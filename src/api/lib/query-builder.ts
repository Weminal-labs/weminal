import { supabase } from './supabase'
import type {
  ListQueryInput,
  CreateOpportunityInput,
  UpdateOpportunityInput,
} from '../schemas/opportunity'

export async function queryOpportunities(params: ListQueryInput) {
  const {
    type,
    status,
    organization,
    blockchain,
    tag,
    search,
    start_date_gte,
    end_date_lte,
    parent_hackathon_id,
    sort_by,
    sort_order,
    page,
    per_page,
  } = params

  let query = supabase
    .from('opportunities')
    .select('*, parent_hackathon:parent_hackathon_id(id, name)', { count: 'exact' })

  // Filters
  if (type) {
    query = query.eq('type', type)
  }

  if (status) {
    query = query.eq('status', status)
  }

  if (organization) {
    query = query.eq('organization', organization)
  }

  if (blockchain) {
    query = query.contains('blockchains', [blockchain])
  }

  if (tag) {
    query = query.contains('tags', [tag])
  }

  if (start_date_gte) {
    query = query.gte('start_date', start_date_gte)
  }

  if (end_date_lte) {
    query = query.lte('end_date', end_date_lte)
  }

  if (parent_hackathon_id) {
    query = query.eq('parent_hackathon_id', parent_hackathon_id)
  }

  if (search) {
    query = query.textSearch('fts', search, {
      type: 'websearch',
      config: 'english',
    })
  }

  // Sorting
  query = query.order(sort_by, { ascending: sort_order === 'asc' })

  // Pagination
  const from = (page - 1) * per_page
  const to = from + per_page - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    throw error
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const flattened = (data ?? []).map((row: any) => {
    const { parent_hackathon, ...rest } = row
    const ph = parent_hackathon as { id: string; name: string } | null
    return { ...rest, parent_hackathon_name: ph?.name ?? null }
  }) as Record<string, unknown>[]

  return {
    data: flattened,
    pagination: {
      page,
      per_page,
      total: count ?? 0,
      total_pages: Math.ceil((count ?? 0) / per_page),
    },
  }
}

export async function getOpportunity(id: string) {
  const { data, error } = await supabase
    .from('opportunities')
    .select('*, parent_hackathon:parent_hackathon_id(id, name)')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw error
  }

  if (!data) return null
  const { parent_hackathon, ...rest } = data as Record<string, unknown>
  const ph = parent_hackathon as { id: string; name: string } | null
  return { ...rest, parent_hackathon_name: ph?.name ?? null }
}

export async function createOpportunity(input: CreateOpportunityInput) {
  const { data, error } = await supabase
    .from('opportunities')
    .insert(input)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function updateOpportunity(
  id: string,
  input: UpdateOpportunityInput
) {
  const { data, error } = await supabase
    .from('opportunities')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw error
  }

  return data
}

export async function deleteOpportunity(id: string) {
  const { data, error } = await supabase
    .from('opportunities')
    .delete()
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw error
  }

  return data
}
