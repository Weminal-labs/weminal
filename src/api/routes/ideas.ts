import { Hono } from 'hono'
import { createIdeaSchema, updateIdeaSchema, listIdeasQuerySchema } from '../schemas/idea'
import {
  queryIdeas,
  getIdea,
  createIdea,
  updateIdea,
  voteIdea,
} from '../lib/idea-query-builder'
import { handleError } from '../middleware/error-handler'

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function isValidSlug(slug: string) {
  return SLUG_RE.test(slug) && slug.length <= 120
}

const ideas = new Hono()

// Propagate errors as JSON (sub-routers don't inherit parent's onError)
ideas.onError(handleError)

// GET /ideas
ideas.get('/', async (c) => {
  const raw = Object.fromEntries(new URL(c.req.url).searchParams.entries())
  const params = listIdeasQuerySchema.parse(raw)
  const result = await queryIdeas(params)
  return c.json(result)
})

// GET /ideas/:slug
ideas.get('/:slug', async (c) => {
  const slug = c.req.param('slug')
  if (!isValidSlug(slug)) {
    return c.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid slug' } }, 400)
  }
  const data = await getIdea(slug)
  if (!data) return c.json({ error: { code: 'NOT_FOUND', message: 'Idea not found' } }, 404)
  return c.json({ data })
})

// POST /ideas
ideas.post('/', async (c) => {
  let body: unknown
  try { body = await c.req.json() } catch {
    return c.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid JSON' } }, 400)
  }
  const input = createIdeaSchema.parse(body)
  const data = await createIdea(input)
  return c.json({ data }, 201)
})

// PATCH /ideas/:slug
ideas.patch('/:slug', async (c) => {
  const slug = c.req.param('slug')
  if (!isValidSlug(slug)) {
    return c.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid slug' } }, 400)
  }
  let body: unknown
  try { body = await c.req.json() } catch {
    return c.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid JSON' } }, 400)
  }
  const input = updateIdeaSchema.parse(body)
  if (Object.keys(input).length === 0) {
    return c.json({ error: { code: 'VALIDATION_ERROR', message: 'No fields to update' } }, 400)
  }
  const data = await updateIdea(slug, input)
  if (!data) return c.json({ error: { code: 'NOT_FOUND', message: 'Idea not found' } }, 404)
  return c.json({ data })
})

// POST /ideas/vote/:slug
ideas.post('/vote/:slug', async (c) => {
  const slug = c.req.param('slug')
  if (!isValidSlug(slug)) {
    return c.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid slug' } }, 400)
  }
  const data = await voteIdea(slug)
  if (!data) return c.json({ error: { code: 'NOT_FOUND', message: 'Idea not found' } }, 404)
  return c.json({ data })
})

export default ideas
