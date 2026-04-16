import { Hono } from 'hono'
import { upsertProposalSchema } from '../schemas/calendar'
import { db } from '../lib/db'
import { formatError } from '../middleware/error-handler'
import { authMiddleware } from '../middleware/auth'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

async function parseJsonBody(c: { req: { json: () => Promise<unknown> } }) {
  try {
    return { data: await c.req.json(), error: null }
  } catch {
    return { data: null, error: 'Invalid JSON body' }
  }
}

const proposals = new Hono()

// GET /opportunities/:id/proposal
proposals.get('/:opportunityId', async (c) => {
  const oppId = c.req.param('opportunityId')
  if (!UUID_RE.test(oppId)) return c.json(formatError('VALIDATION_ERROR', 'Invalid opportunity ID'), 400)

  const data = await db
    .selectFrom('proposals')
    .selectAll()
    .where('opportunity_id', '=', oppId)
    .executeTakeFirst()

  return c.json({ data: data ?? null })
})

// PUT /opportunities/:id/proposal — upsert; requires auth; records created_by
proposals.put('/:opportunityId', authMiddleware, async (c) => {
  const oppId = c.req.param('opportunityId')
  if (!UUID_RE.test(oppId)) return c.json(formatError('VALIDATION_ERROR', 'Invalid opportunity ID'), 400)

  const userId = c.get('userId')
  const role = c.get('userRole')

  // Non-admins: if a proposal already exists for this opportunity, verify ownership
  if (role !== 'admin') {
    const existing = await db
      .selectFrom('proposals')
      .select(['id', 'created_by'])
      .where('opportunity_id', '=', oppId)
      .executeTakeFirst()

    if (existing && existing.created_by !== userId) {
      return c.json(formatError('FORBIDDEN', 'You do not own this record'), 403)
    }
  }

  const { data: body, error: jsonError } = await parseJsonBody(c)
  if (jsonError) return c.json(formatError('VALIDATION_ERROR', jsonError), 400)

  const parsed = upsertProposalSchema.parse(body)

  const insertValues = { ...parsed, opportunity_id: oppId, created_by: userId } as never
  const updateValues = { ...parsed, created_by: userId } as never

  const data = await db
    .insertInto('proposals')
    .values(insertValues)
    .onConflict((oc) => oc.column('opportunity_id').doUpdateSet(updateValues))
    .returningAll()
    .executeTakeFirstOrThrow()

  return c.json({ data })
})

// DELETE /opportunities/:id/proposal — requires auth; members can only delete own records
proposals.delete('/:opportunityId', authMiddleware, async (c) => {
  const oppId = c.req.param('opportunityId')
  if (!UUID_RE.test(oppId)) return c.json(formatError('VALIDATION_ERROR', 'Invalid opportunity ID'), 400)

  const userId = c.get('userId')
  const role = c.get('userRole')

  // Non-admins must own the record
  if (role !== 'admin') {
    const existing = await db
      .selectFrom('proposals')
      .select(['id', 'created_by'])
      .where('opportunity_id', '=', oppId)
      .executeTakeFirst()

    if (!existing) {
      return c.json(formatError('NOT_FOUND', 'No proposal found for this opportunity'), 404)
    }
    if (existing.created_by !== userId) {
      return c.json(formatError('FORBIDDEN', 'You do not own this record'), 403)
    }
  }

  const data = await db
    .deleteFrom('proposals')
    .where('opportunity_id', '=', oppId)
    .returningAll()
    .executeTakeFirst()

  if (!data) return c.json(formatError('NOT_FOUND', 'No proposal found for this opportunity'), 404)
  return c.json({ success: true, deleted_id: data.id })
})

export default proposals
