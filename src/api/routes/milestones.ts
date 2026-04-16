import { Hono } from 'hono'
import { createMilestoneSchema, updateMilestoneSchema, listMilestonesSchema } from '../schemas/calendar'
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

const MILESTONE_COLS = [
  'milestones.id',
  'milestones.opportunity_id',
  'milestones.title',
  'milestones.date',
  'milestones.time',
  'milestones.type',
  'milestones.links',
  'milestones.notes',
  'milestones.completed',
  'milestones.created_by',
  'milestones.created_at',
  'milestones.updated_at',
] as const

type MilestoneWithJoin = Record<string, unknown> & {
  opp_id: string | null
  opp_name: string | null
  opp_type: string | null
  opp_org: string | null
}

function shapeMilestone(row: MilestoneWithJoin) {
  const { opp_id, opp_name, opp_type, opp_org, ...rest } = row
  return {
    ...rest,
    opportunities: opp_id
      ? { id: opp_id, name: opp_name, type: opp_type, organization: opp_org }
      : null,
  }
}

const milestones = new Hono()

// GET /milestones?date_from=&date_to= — cross-opportunity
milestones.get('/', async (c) => {
  const raw = Object.fromEntries(new URL(c.req.url).searchParams.entries())
  const params = listMilestonesSchema.parse(raw)

  let query = db
    .selectFrom('milestones')
    .innerJoin('opportunities', 'opportunities.id', 'milestones.opportunity_id')
    .select([
      ...MILESTONE_COLS,
      'opportunities.id as opp_id',
      'opportunities.name as opp_name',
      'opportunities.type as opp_type',
      'opportunities.organization as opp_org',
    ])
    .orderBy('milestones.date', 'asc')

  if (params.date_from) query = query.where('milestones.date', '>=', params.date_from)
  if (params.date_to) query = query.where('milestones.date', '<=', params.date_to)
  if (params.type) query = query.where('milestones.type', '=', params.type)

  const rows = await query.execute()
  const data = rows.map((r) => shapeMilestone(r as MilestoneWithJoin))
  return c.json({ data })
})

// GET /opportunities/:id/milestones
milestones.get('/opportunity/:opportunityId', async (c) => {
  const oppId = c.req.param('opportunityId')
  if (!UUID_RE.test(oppId)) return c.json(formatError('VALIDATION_ERROR', 'Invalid opportunity ID'), 400)

  const data = await db
    .selectFrom('milestones')
    .selectAll()
    .where('opportunity_id', '=', oppId)
    .orderBy('date', 'asc')
    .execute()

  return c.json({ data })
})

// POST /opportunities/:id/milestones — requires auth; records created_by
milestones.post('/opportunity/:opportunityId', authMiddleware, async (c) => {
  const oppId = c.req.param('opportunityId')
  if (!UUID_RE.test(oppId)) return c.json(formatError('VALIDATION_ERROR', 'Invalid opportunity ID'), 400)

  const { data: body, error: jsonError } = await parseJsonBody(c)
  if (jsonError) return c.json(formatError('VALIDATION_ERROR', jsonError), 400)

  const parsed = createMilestoneSchema.parse(body)
  const userId = c.get('userId')

  const data = await db
    .insertInto('milestones')
    .values({ ...parsed, opportunity_id: oppId, created_by: userId } as never)
    .returningAll()
    .executeTakeFirstOrThrow()

  return c.json({ data }, 201)
})

// PATCH /milestones/:id — requires auth; members can only edit own records
milestones.patch('/:id', authMiddleware, async (c) => {
  const id = c.req.param('id')
  if (!UUID_RE.test(id)) return c.json(formatError('VALIDATION_ERROR', 'Invalid milestone ID'), 400)

  const userId = c.get('userId')
  const role = c.get('userRole')

  // Non-admins must own the record
  if (role !== 'admin') {
    const existing = await db
      .selectFrom('milestones')
      .select(['id', 'created_by'])
      .where('id', '=', id)
      .executeTakeFirst()

    if (!existing) {
      return c.json(formatError('NOT_FOUND', 'Milestone not found'), 404)
    }
    if (existing.created_by !== userId) {
      return c.json(formatError('FORBIDDEN', 'You do not own this record'), 403)
    }
  }

  const { data: body, error: jsonError } = await parseJsonBody(c)
  if (jsonError) return c.json(formatError('VALIDATION_ERROR', jsonError), 400)

  const parsed = updateMilestoneSchema.parse(body)
  const data = await db
    .updateTable('milestones')
    .set(parsed as never)
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirst()

  if (!data) return c.json(formatError('NOT_FOUND', 'Milestone not found'), 404)
  return c.json({ data })
})

// DELETE /milestones/:id — requires auth; members can only delete own records
milestones.delete('/:id', authMiddleware, async (c) => {
  const id = c.req.param('id')
  if (!UUID_RE.test(id)) return c.json(formatError('VALIDATION_ERROR', 'Invalid milestone ID'), 400)

  const userId = c.get('userId')
  const role = c.get('userRole')

  // Non-admins must own the record
  if (role !== 'admin') {
    const existing = await db
      .selectFrom('milestones')
      .select(['id', 'created_by'])
      .where('id', '=', id)
      .executeTakeFirst()

    if (!existing) {
      return c.json(formatError('NOT_FOUND', 'Milestone not found'), 404)
    }
    if (existing.created_by !== userId) {
      return c.json(formatError('FORBIDDEN', 'You do not own this record'), 403)
    }
  }

  const data = await db
    .deleteFrom('milestones')
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirst()

  if (!data) return c.json(formatError('NOT_FOUND', 'Milestone not found'), 404)
  return c.json({ success: true, deleted_id: data.id })
})

export default milestones
