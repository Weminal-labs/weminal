import { supabase } from './supabase'
import type { CreateIdeaInput, UpdateIdeaInput, ListIdeasQuery } from '../schemas/idea'

export async function queryIdeas(params: ListIdeasQuery) {
  const { category, track, difficulty, tag, chain, search, featured, sort_by, sort_order, page, per_page } = params

  let query = supabase.from('ideas').select('*', { count: 'exact' })

  if (category) query = query.eq('category', category)
  if (track) query = query.eq('track', track)
  if (difficulty) query = query.eq('difficulty', difficulty)
  if (tag) query = query.contains('tags', [tag])
  if (chain) query = query.contains('supported_chains', [chain])
  if (featured !== undefined) query = query.eq('is_featured', featured)

  if (search) {
    query = query.textSearch('fts', search, { type: 'websearch', config: 'english' })
  }

  query = query.order(sort_by, { ascending: sort_order === 'asc' })

  const from = (page - 1) * per_page
  const to = from + per_page - 1
  query = query.range(from, to)

  const { data, error, count } = await query
  if (error) throw error

  return {
    data: data ?? [],
    pagination: {
      page,
      per_page,
      total: count ?? 0,
      total_pages: Math.ceil((count ?? 0) / per_page),
    },
  }
}

export async function getIdea(slug: string) {
  const { data, error } = await supabase
    .from('ideas')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

export async function createIdea(input: CreateIdeaInput) {
  const { data, error } = await supabase.from('ideas').insert(input).select().single()
  if (error) throw error
  return data
}

export async function updateIdea(slug: string, input: UpdateIdeaInput) {
  const { data, error } = await supabase
    .from('ideas')
    .update(input)
    .eq('slug', slug)
    .select()
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

export async function voteIdea(slug: string) {
  const { error } = await supabase.rpc('increment_idea_votes', { idea_slug: slug })
  if (error) {
    console.error(`increment_idea_votes RPC failed for "${slug}":`, error.message)
    throw error
  }
  return await getIdea(slug)
}

export async function getIdeaTags(): Promise<string[]> {
  const { data, error } = await supabase.from('ideas').select('tags')
  if (error) return []
  const unique = new Set<string>()
  for (const row of data ?? []) {
    for (const tag of (row.tags as string[]) ?? []) unique.add(tag)
  }
  return [...unique].sort()
}

export async function getIdeaChains(): Promise<string[]> {
  const { data, error } = await supabase.from('ideas').select('supported_chains')
  if (error) return []
  const unique = new Set<string>()
  for (const row of data ?? []) {
    for (const chain of (row.supported_chains as string[]) ?? []) unique.add(chain)
  }
  return [...unique].sort()
}
