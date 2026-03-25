import { Hono } from 'hono'
import { supabase } from '../lib/supabase'
import { opportunityTypes, opportunityStatuses } from '../schemas/opportunity'

const meta = new Hono()

meta.get('/types', (c) => {
  return c.json({ data: [...opportunityTypes] })
})

meta.get('/statuses', (c) => {
  return c.json({ data: [...opportunityStatuses] })
})

meta.get('/blockchains', async (c) => {
  const { data: rows, error } = await supabase
    .from('opportunities')
    .select('blockchains')

  if (error) return c.json({ data: [] })

  const unique = new Set<string>()
  for (const row of rows ?? []) {
    for (const chain of (row.blockchains as string[]) ?? []) {
      unique.add(chain)
    }
  }
  return c.json({ data: [...unique].sort() })
})

meta.get('/tags', async (c) => {
  const { data: rows, error } = await supabase
    .from('opportunities')
    .select('tags')

  if (error) return c.json({ data: [] })

  const unique = new Set<string>()
  for (const row of rows ?? []) {
    for (const tag of (row.tags as string[]) ?? []) {
      unique.add(tag)
    }
  }
  return c.json({ data: [...unique].sort() })
})

meta.get('/organizations', async (c) => {
  const { data, error } = await supabase
    .from('opportunities')
    .select('organization')
    .not('organization', 'is', null)

  if (error) return c.json({ data: [] })

  const unique = [...new Set(
    (data ?? []).map((r) => r.organization as string)
  )].sort()

  return c.json({ data: unique })
})

export default meta
