import type { Opportunity, Idea, ApiResponse, PaginationMeta } from './types'

const API_BASE = '/api/v1'

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  let data: unknown
  try {
    data = await res.json()
  } catch {
    throw new Error(`Server error (${res.status})`)
  }

  if (!res.ok) {
    const errData = data as { error?: { message?: string } } | null
    throw new Error(errData?.error?.message ?? `API error: ${res.status}`)
  }

  return data as T
}

export type ListParams = {
  type?: string
  status?: string
  format?: string
  organization?: string
  blockchain?: string
  tag?: string
  search?: string
  sort_by?: string
  sort_order?: string
  page?: number
  per_page?: number
}

export async function fetchOpportunities(params: ListParams = {}) {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '' && value !== null) {
      query.set(key, String(value))
    }
  }
  return fetchApi<ApiResponse<Opportunity[]> & { pagination: PaginationMeta }>(
    `/opportunities?${query.toString()}`
  )
}

export async function fetchOpportunity(id: string) {
  return fetchApi<{ data: Opportunity }>(`/opportunities/${id}`)
}

export async function createOpportunityApi(input: Partial<Opportunity>) {
  return fetchApi<{ data: Opportunity }>('/opportunities', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function updateOpportunityApi(id: string, input: Partial<Opportunity>) {
  return fetchApi<{ data: Opportunity }>(`/opportunities/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export async function deleteOpportunityApi(id: string) {
  return fetchApi<{ success: boolean; deleted_id: string }>(`/opportunities/${id}`, {
    method: 'DELETE',
  })
}

export async function fetchMeta(endpoint: string) {
  return fetchApi<{ data: string[] }>(`/meta/${endpoint}`)
}

// ─── Ideas API ────────────────────────────────────────────────────────────────

export type IdeaListParams = {
  category?: string
  track?: string
  difficulty?: string
  tag?: string
  chain?: string
  search?: string
  featured?: boolean
  sort_by?: string
  sort_order?: string
  page?: number
  per_page?: number
}

export async function fetchIdeas(params: IdeaListParams = {}) {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '' && value !== null) {
      query.set(key, String(value))
    }
  }
  return fetchApi<ApiResponse<Idea[]> & { pagination: PaginationMeta }>(
    `/ideas?${query.toString()}`
  )
}

export async function fetchIdea(slug: string) {
  return fetchApi<{ data: Idea }>(`/ideas/${slug}`)
}

export async function voteIdeaApi(slug: string) {
  return fetchApi<{ data: Idea }>(`/ideas/vote/${slug}`, { method: 'POST' })
}

export async function fetchIdeaMeta(endpoint: string) {
  return fetchApi<{ data: string[] }>(`/meta/${endpoint}`)
}
