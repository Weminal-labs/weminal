import { Hono } from 'hono'
import { supabase } from '../lib/supabase'
import { opportunityTypes, opportunityStatuses } from '../schemas/opportunity'

const meta = new Hono()

// GET /meta/types — hardcoded enum values
meta.get('/types', (c) => {
  return c.json({ data: [...opportunityTypes] })
})

// GET /meta/statuses — hardcoded enum values
meta.get('/statuses', (c) => {
  return c.json({ data: [...opportunityStatuses] })
})

// GET /meta/blockchains — distinct values from database
meta.get('/blockchains', async (c) => {
  const { data, error } = await supabase.rpc('get_distinct_blockchains')

  if (error) {
    // Fallback: query directly if RPC not available
    const { data: rows, error: queryError } = await supabase
      .from('opportunities')
      .select('blockchains')

    if (queryError) throw queryError

    const uniqueChains = new Set<string>()
    for (const row of rows ?? []) {
      for (const chain of (row.blockchains as string[]) ?? []) {
        uniqueChains.add(chain)
      }
    }

    return c.json({ data: [...uniqueChains].sort() })
  }

  return c.json({ data: data ?? [] })
})

// GET /meta/tags — distinct values from database
meta.get('/tags', async (c) => {
  const { data, error } = await supabase.rpc('get_distinct_tags')

  if (error) {
    // Fallback: query directly if RPC not available
    const { data: rows, error: queryError } = await supabase
      .from('opportunities')
      .select('tags')

    if (queryError) throw queryError

    const uniqueTags = new Set<string>()
    for (const row of rows ?? []) {
      for (const tag of (row.tags as string[]) ?? []) {
        uniqueTags.add(tag)
      }
    }

    return c.json({ data: [...uniqueTags].sort() })
  }

  return c.json({ data: data ?? [] })
})

// GET /meta/organizations — distinct non-null organizations
meta.get('/organizations', async (c) => {
  const { data, error } = await supabase
    .from('opportunities')
    .select('organization')
    .not('organization', 'is', null)

  if (error) throw error

  const uniqueOrgs = [...new Set(
    (data ?? []).map((r) => r.organization as string)
  )].sort()

  return c.json({ data: uniqueOrgs })
})

export default meta
