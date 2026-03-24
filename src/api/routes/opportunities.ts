import { Hono } from 'hono'
import {
  createOpportunitySchema,
  updateOpportunitySchema,
  listQuerySchema,
} from '../schemas/opportunity'
import {
  queryOpportunities,
  getOpportunity,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
} from '../lib/query-builder'
import { formatError } from '../middleware/error-handler'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function validateId(id: string) {
  return UUID_RE.test(id)
}

async function parseJsonBody(c: { req: { json: () => Promise<unknown> } }) {
  try {
    return { data: await c.req.json(), error: null }
  } catch {
    return { data: null, error: 'Invalid JSON body' }
  }
}

const opportunities = new Hono()

// GET /opportunities — list with filters + pagination
opportunities.get('/', async (c) => {
  const rawQuery = Object.fromEntries(
    new URL(c.req.url).searchParams.entries()
  )
  const parsed = listQuerySchema.parse(rawQuery)
  const result = await queryOpportunities(parsed)
  return c.json(result)
})

// GET /opportunities/:id
opportunities.get('/:id', async (c) => {
  const id = c.req.param('id')

  if (!validateId(id)) {
    return c.json(formatError('VALIDATION_ERROR', 'Invalid opportunity ID'), 400)
  }

  const data = await getOpportunity(id)

  if (!data) {
    return c.json(formatError('NOT_FOUND', 'Opportunity not found'), 404)
  }

  return c.json({ data })
})

// POST /opportunities
opportunities.post('/', async (c) => {
  const { data: body, error: jsonError } = await parseJsonBody(c)
  if (jsonError) {
    return c.json(formatError('VALIDATION_ERROR', jsonError), 400)
  }

  const parsed = createOpportunitySchema.parse(body)
  const data = await createOpportunity(parsed)
  return c.json({ data }, 201)
})

// PATCH /opportunities/:id
opportunities.patch('/:id', async (c) => {
  const id = c.req.param('id')

  if (!validateId(id)) {
    return c.json(formatError('VALIDATION_ERROR', 'Invalid opportunity ID'), 400)
  }

  const { data: body, error: jsonError } = await parseJsonBody(c)
  if (jsonError) {
    return c.json(formatError('VALIDATION_ERROR', jsonError), 400)
  }

  const parsed = updateOpportunitySchema.parse(body)

  if (Object.keys(parsed).length === 0) {
    return c.json(formatError('VALIDATION_ERROR', 'No fields to update'), 400)
  }

  const data = await updateOpportunity(id, parsed)

  if (!data) {
    return c.json(formatError('NOT_FOUND', 'Opportunity not found'), 404)
  }

  return c.json({ data })
})

// DELETE /opportunities/:id
opportunities.delete('/:id', async (c) => {
  const id = c.req.param('id')

  if (!validateId(id)) {
    return c.json(formatError('VALIDATION_ERROR', 'Invalid opportunity ID'), 400)
  }

  const data = await deleteOpportunity(id)

  if (!data) {
    return c.json(formatError('NOT_FOUND', 'Opportunity not found'), 404)
  }

  return c.json({
    success: true,
    deleted_id: data.id,
  })
})

export default opportunities
