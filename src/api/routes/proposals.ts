import { Hono } from 'hono'
import { upsertProposalSchema } from '../schemas/calendar'
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

const proposals = new Hono()

// GET /opportunities/:id/proposal
proposals.get('/:opportunityId', async (c) => {
  const oppId = c.req.param('opportunityId')
  if (!UUID_RE.test(oppId)) return c.json(formatError('VALIDATION_ERROR', 'Invalid opportunity ID'), 400)

  const { data, error } = await supabase
    .from('proposals')
    .select('*')
    .eq('opportunity_id', oppId)
    .maybeSingle()

  if (error) throw error
  return c.json({ data })
})

// PUT /opportunities/:id/proposal — upsert
proposals.put('/:opportunityId', async (c) => {
  const oppId = c.req.param('opportunityId')
  if (!UUID_RE.test(oppId)) return c.json(formatError('VALIDATION_ERROR', 'Invalid opportunity ID'), 400)

  const { data: body, error: jsonError } = await parseJsonBody(c)
  if (jsonError) return c.json(formatError('VALIDATION_ERROR', jsonError), 400)

  const parsed = upsertProposalSchema.parse(body)

  const { data, error } = await supabase
    .from('proposals')
    .upsert({ ...parsed, opportunity_id: oppId }, { onConflict: 'opportunity_id' })
    .select()
    .single()

  if (error) throw error
  return c.json({ data })
})

// DELETE /opportunities/:id/proposal
proposals.delete('/:opportunityId', async (c) => {
  const oppId = c.req.param('opportunityId')
  if (!UUID_RE.test(oppId)) return c.json(formatError('VALIDATION_ERROR', 'Invalid opportunity ID'), 400)

  const { data, error } = await supabase
    .from('proposals')
    .delete()
    .eq('opportunity_id', oppId)
    .select()
    .maybeSingle()

  if (error) throw error
  if (!data) return c.json(formatError('NOT_FOUND', 'No proposal found for this opportunity'), 404)
  return c.json({ success: true, deleted_id: data.id })
})

export default proposals
