import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import { db } from '../lib/db'
import { handleError } from '../middleware/error-handler'
import { generateApiKey, sanitizeLabel } from '../../lib/pure-helpers'

const me = new Hono()

// Propagate errors as JSON (sub-routers don't inherit parent's onError)
me.onError(handleError)

// ---------------------------------------------------------------------------
// T145 — Key management routes
// ---------------------------------------------------------------------------

// POST /api/v1/me/keys — generate a new API key
me.post('/keys', authMiddleware, async (c) => {
  const userId = c.get('userId')

  let body: Record<string, unknown>
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Request body must be valid JSON' }, 400)
  }

  const rawLabel = body.label
  if (!rawLabel || typeof rawLabel !== 'string') {
    return c.json({ error: 'label is required' }, 400)
  }

  const label = sanitizeLabel(rawLabel)
  if (label.length === 0 || label.length > 100) {
    return c.json({ error: 'Label required (max 100 chars)' }, 400)
  }

  // Enforce 10-key cap per user
  const countRow = await db
    .selectFrom('api_keys')
    .select(db.fn.countAll<string>().as('count'))
    .where('user_id', '=', userId)
    .where('revoked_at', 'is', null)
    .executeTakeFirstOrThrow()

  if (Number(countRow.count) >= 10) {
    return c.json({ error: 'Maximum 10 active API keys allowed' }, 400)
  }

  const { raw, hash, prefix } = await generateApiKey()

  try {
    const data = await db
      .insertInto('api_keys')
      .values({ user_id: userId, label, key_hash: hash, key_prefix: prefix })
      .returning(['id', 'label', 'key_prefix', 'created_at'])
      .executeTakeFirstOrThrow()

    // Raw key returned ONCE — never stored, never logged
    return c.json({ data: { ...data, key: raw } }, 201)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    if (message.includes('API key cap exceeded')) {
      return c.json({ error: 'Maximum 10 active API keys allowed' }, 400)
    }
    return c.json({ error: 'Failed to create API key' }, 500)
  }
})

// GET /api/v1/me/keys — list active keys (no key_hash in response)
me.get('/keys', authMiddleware, async (c) => {
  const userId = c.get('userId')

  try {
    const data = await db
      .selectFrom('api_keys')
      .select(['id', 'label', 'key_prefix', 'created_at', 'last_used_at'])
      .where('user_id', '=', userId)
      .where('revoked_at', 'is', null)
      .orderBy('created_at', 'desc')
      .execute()

    return c.json({ data })
  } catch {
    return c.json({ error: 'Failed to fetch API keys' }, 500)
  }
})

// DELETE /api/v1/me/keys/:id — soft-delete (revoke) a key
me.delete('/keys/:id', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const keyId = c.req.param('id')

  // Verify ownership before revoking
  const keyRow = await db
    .selectFrom('api_keys')
    .select(['id', 'user_id'])
    .where('id', '=', keyId)
    .executeTakeFirst()

  if (!keyRow || keyRow.user_id !== userId) {
    return c.json({ error: 'Key not found' }, 404)
  }

  try {
    await db
      .updateTable('api_keys')
      .set({ revoked_at: new Date().toISOString() })
      .where('id', '=', keyId)
      .execute()
  } catch {
    return c.json({ error: 'Failed to revoke API key' }, 500)
  }

  return c.json({ data: { success: true } })
})

// ---------------------------------------------------------------------------
// T146 — User profile route
// ---------------------------------------------------------------------------

// GET /api/v1/me/profile — core user identity (no wallet fields yet)
me.get('/profile', authMiddleware, async (c) => {
  const userId = c.get('userId')

  const user = await db
    .selectFrom('users')
    .select(['id', 'name', 'email', 'image', 'created_at'])
    .where('id', '=', userId)
    .executeTakeFirst()

  if (!user) {
    return c.json({ error: 'User not found' }, 404)
  }

  return c.json({ data: user })
})

// ---------------------------------------------------------------------------
// T154 — Builder activity route
// ---------------------------------------------------------------------------

// GET /api/v1/me/activity — opportunities, ideas, hackathons created by user
me.get('/activity', authMiddleware, async (c) => {
  const userId = c.get('userId')

  try {
    const [
      opportunities,
      oppsCountRow,
      ideas,
      ideasCountRow,
      hackathons,
      hacksCountRow,
    ] = await Promise.all([
      db
        .selectFrom('opportunities')
        .select(['id', 'name', 'type', 'status', 'created_at'])
        .where('created_by', '=', userId)
        .orderBy('created_at', 'desc')
        .limit(10)
        .execute(),

      db
        .selectFrom('opportunities')
        .select(db.fn.countAll<string>().as('count'))
        .where('created_by', '=', userId)
        .executeTakeFirstOrThrow(),

      db
        .selectFrom('ideas')
        .select(['id', 'title', 'slug', 'votes', 'created_at'])
        .where('created_by', '=', userId)
        .orderBy('created_at', 'desc')
        .limit(10)
        .execute(),

      db
        .selectFrom('ideas')
        .select(db.fn.countAll<string>().as('count'))
        .where('created_by', '=', userId)
        .executeTakeFirstOrThrow(),

      db
        .selectFrom('opportunities')
        .select(['id', 'name', 'end_date', 'reward_amount', 'reward_currency', 'created_at'])
        .where('created_by', '=', userId)
        .where('type', '=', 'hackathon')
        .orderBy('end_date', 'asc')
        .limit(5)
        .execute(),

      db
        .selectFrom('opportunities')
        .select(db.fn.countAll<string>().as('count'))
        .where('created_by', '=', userId)
        .where('type', '=', 'hackathon')
        .executeTakeFirstOrThrow(),
    ])

    return c.json({
      data: {
        opportunities: {
          total: Number(oppsCountRow.count),
          items: opportunities.map((o) => ({
            id: o.id,
            title: o.name,
            type: o.type,
            status: o.status,
            created_at: o.created_at,
          })),
        },
        ideas: {
          total: Number(ideasCountRow.count),
          items: ideas.map((i) => ({
            id: i.id,
            title: i.title,
            slug: i.slug,
            votes: i.votes,
            created_at: i.created_at,
          })),
        },
        hackathons: {
          total: Number(hacksCountRow.count),
          items: hackathons.map((h) => ({
            id: h.id,
            title: h.name,
            deadline: h.end_date,
            prize_pool: h.reward_amount,
            prize_currency: h.reward_currency,
            created_at: h.created_at,
          })),
        },
      },
    })
  } catch {
    return c.json({ error: 'Failed to fetch activity' }, 500)
  }
})

export default me
