import { Hono } from 'hono'
import { createBlockSchema, updateBlockSchema, listBlocksSchema } from '../schemas/calendar'
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

const blocks = new Hono()

blocks.get('/', async (c) => {
  const raw = Object.fromEntries(new URL(c.req.url).searchParams.entries())
  const params = listBlocksSchema.parse(raw)

  let query = supabase
    .from('calendar_blocks')
    .select('*, opportunities(id, name, type, organization)', { count: 'exact' })
    .order('date', { ascending: true })

  if (params.date_from) query = query.gte('date', params.date_from)
  if (params.date_to) query = query.lte('date', params.date_to)
  if (params.opportunity_id) query = query.eq('opportunity_id', params.opportunity_id)
  if (params.status) query = query.eq('status', params.status)

  const { data, error, count } = await query
  if (error) throw error

  return c.json({ data: data ?? [], total: count ?? 0 })
})

blocks.get('/:id', async (c) => {
  const id = c.req.param('id')
  if (!UUID_RE.test(id)) return c.json(formatError('VALIDATION_ERROR', 'Invalid block ID'), 400)

  const { data, error } = await supabase
    .from('calendar_blocks')
    .select('*, opportunities(id, name, type, organization)')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return c.json(formatError('NOT_FOUND', 'Block not found'), 404)
    throw error
  }
  return c.json({ data })
})

blocks.post('/', async (c) => {
  const { data: body, error: jsonError } = await parseJsonBody(c)
  if (jsonError) return c.json(formatError('VALIDATION_ERROR', jsonError), 400)

  const parsed = createBlockSchema.parse(body)
  const { data, error } = await supabase.from('calendar_blocks').insert(parsed).select().single()
  if (error) throw error

  return c.json({ data }, 201)
})

blocks.patch('/:id', async (c) => {
  const id = c.req.param('id')
  if (!UUID_RE.test(id)) return c.json(formatError('VALIDATION_ERROR', 'Invalid block ID'), 400)

  const { data: body, error: jsonError } = await parseJsonBody(c)
  if (jsonError) return c.json(formatError('VALIDATION_ERROR', jsonError), 400)

  const parsed = updateBlockSchema.parse(body)
  if (Object.keys(parsed).length === 0) return c.json(formatError('VALIDATION_ERROR', 'No fields to update'), 400)

  const { data, error } = await supabase.from('calendar_blocks').update(parsed).eq('id', id).select().single()
  if (error) {
    if (error.code === 'PGRST116') return c.json(formatError('NOT_FOUND', 'Block not found'), 404)
    throw error
  }
  return c.json({ data })
})

blocks.delete('/:id', async (c) => {
  const id = c.req.param('id')
  if (!UUID_RE.test(id)) return c.json(formatError('VALIDATION_ERROR', 'Invalid block ID'), 400)

  const { data, error } = await supabase.from('calendar_blocks').delete().eq('id', id).select().single()
  if (error) {
    if (error.code === 'PGRST116') return c.json(formatError('NOT_FOUND', 'Block not found'), 404)
    throw error
  }
  return c.json({ success: true, deleted_id: data.id })
})

export default blocks
