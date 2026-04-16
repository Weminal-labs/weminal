import { Hono } from 'hono'
import { db } from '../lib/db'
import { opportunityTypes, opportunityStatuses } from '../schemas/opportunity'
import { ideaTracks, ideaCategories, ideaDifficulties } from '../schemas/idea'
import { getIdeaTags, getIdeaChains } from '../lib/idea-query-builder'

const meta = new Hono()

meta.get('/types', (c) => {
  return c.json({ data: [...opportunityTypes] })
})

meta.get('/statuses', (c) => {
  return c.json({ data: [...opportunityStatuses] })
})

meta.get('/blockchains', async (c) => {
  try {
    const rows = await db
      .selectFrom('opportunities')
      .select('blockchains')
      .execute()

    const unique = new Set<string>()
    for (const row of rows) {
      for (const chain of (row.blockchains as string[]) ?? []) {
        unique.add(chain)
      }
    }
    return c.json({ data: [...unique].sort() })
  } catch {
    return c.json({ data: [] })
  }
})

meta.get('/tags', async (c) => {
  try {
    const rows = await db
      .selectFrom('opportunities')
      .select('tags')
      .execute()

    const unique = new Set<string>()
    for (const row of rows) {
      for (const tag of (row.tags as string[]) ?? []) {
        unique.add(tag)
      }
    }
    return c.json({ data: [...unique].sort() })
  } catch {
    return c.json({ data: [] })
  }
})

meta.get('/organizations', async (c) => {
  try {
    const rows = await db
      .selectFrom('opportunities')
      .select('organization')
      .where('organization', 'is not', null)
      .execute()

    const unique = [...new Set(
      rows.map((r) => r.organization as string)
    )].sort()

    return c.json({ data: unique })
  } catch {
    return c.json({ data: [] })
  }
})

// ─── Ideas meta ──────────────────────────────────────────────────────────────

meta.get('/idea-tracks', (c) => c.json({ data: [...ideaTracks] }))
meta.get('/idea-categories', (c) => c.json({ data: [...ideaCategories] }))
meta.get('/idea-difficulties', (c) => c.json({ data: [...ideaDifficulties] }))

meta.get('/idea-tags', async (c) => {
  const data = await getIdeaTags()
  return c.json({ data })
})

meta.get('/idea-chains', async (c) => {
  const data = await getIdeaChains()
  return c.json({ data })
})

export default meta
