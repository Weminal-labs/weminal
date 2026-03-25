import { Hono } from 'hono'
import { createMilestoneSchema, updateMilestoneSchema, listMilestonesSchema } from '../schemas/calendar'
import { supabase } from '../lib/supabase'
import { formatError } from '../middleware/error-handler'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

async function parseJsonBody(c: { req: { json: () => Promise<unknown> } }) {
  try {
    return { data: await c.req.json(), error: null }
  } catch {
    return { data: null, error: 'Invalid JSON body' }
  }
}

const milestones = new Hono()

// GET /milestones?date_from=&date_to= — cross-opportunity
milestones.get('/', async (c) => {
  const raw = Object.fromEntries(new URL(c.req.url).searchParams.entries())
  const params = listMilestonesSchema.parse(raw)

  let query = supabase
    .from('milestones')
    .select('*, opportunities(id, name, type, organization)')
    .order('date', { ascending: true })

  if (params.date_from) query = query.gte('date', params.date_from)
  if (params.date_to) query = query.lte('date', params.date_to)
  if (params.type) query = query.eq('type', params.type)

  const { data, error } = await query
  if (error) throw error
  return c.json({ data: data ?? [] })
})

// GET /opportunities/:id/milestones
milestones.get('/opportunity/:opportunityId', async (c) => {
  const oppId = c.req.param('opportunityId')
  if (!UUID_RE.test(oppId)) return c.json(formatError('VALIDATION_ERROR', 'Invalid opportunity ID'), 400)

  const { data, error } = await supabase
    .from('milestones')
    .select('*')
    .eq('opportunity_id', oppId)
    .order('date', { ascending: true })

  if (error) throw error
  return c.json({ data: data ?? [] })
})

// POST /opportunities/:id/milestones
milestones.post('/opportunity/:opportunityId', async (c) => {
  const oppId = c.req.param('opportunityId')
  if (!UUID_RE.test(oppId)) return c.json(formatError('VALIDATION_ERROR', 'Invalid opportunity ID'), 400)

  const { data: body, error: jsonError } = await parseJsonBody(c)
  if (jsonError) return c.json(formatError('VALIDATION_ERROR', jsonError), 400)

  const parsed = createMilestoneSchema.parse(body)
  const { data, error } = await supabase
    .from('milestones')
    .insert({ ...parsed, opportunity_id: oppId })
    .select()
    .single()

  if (error) throw error
  return c.json({ data }, 201)
})

// PATCH /milestones/:id
milestones.patch('/:id', async (c) => {
  const id = c.req.param('id')
  if (!UUID_RE.test(id)) return c.json(formatError('VALIDATION_ERROR', 'Invalid milestone ID'), 400)

  const { data: body, error: jsonError } = await parseJsonBody(c)
  if (jsonError) return c.json(formatError('VALIDATION_ERROR', jsonError), 400)

  const parsed = updateMilestoneSchema.parse(body)
  const { data, error } = await supabase.from('milestones').update(parsed).eq('id', id).select().single()
  if (error) {
    if (error.code === 'PGRST116') return c.json(formatError('NOT_FOUND', 'Milestone not found'), 404)
    throw error
  }
  return c.json({ data })
})

// DELETE /milestones/:id
milestones.delete('/:id', async (c) => {
  const id = c.req.param('id')
  if (!UUID_RE.test(id)) return c.json(formatError('VALIDATION_ERROR', 'Invalid milestone ID'), 400)

  const { data, error } = await supabase.from('milestones').delete().eq('id', id).select().single()
  if (error) {
    if (error.code === 'PGRST116') return c.json(formatError('NOT_FOUND', 'Milestone not found'), 404)
    throw error
  }
  return c.json({ success: true, deleted_id: data.id })
})

export default milestones
