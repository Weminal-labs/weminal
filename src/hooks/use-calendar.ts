'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchMeta } from '@/lib/api-client'

const API = '/api/v1'

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error?.message ?? `API error: ${res.status}`)
  return data as T
}

// Calendar Blocks
export function useBlocks(dateFrom: string, dateTo: string) {
  return useQuery({
    queryKey: ['blocks', dateFrom, dateTo],
    queryFn: () => fetchJson<{ data: CalendarBlock[] }>(`${API}/calendar/blocks?date_from=${dateFrom}&date_to=${dateTo}`),
  })
}

export function useCreateBlock() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Partial<CalendarBlock>) => fetchJson(`${API}/calendar/blocks`, { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['blocks'] }),
  })
}

export function useUpdateBlock() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...input }: Partial<CalendarBlock> & { id: string }) =>
      fetchJson(`${API}/calendar/blocks/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['blocks'] }),
  })
}

export function useDeleteBlock() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => fetchJson(`${API}/calendar/blocks/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['blocks'] }),
  })
}

// Milestones
export function useMilestones(dateFrom: string, dateTo: string) {
  return useQuery({
    queryKey: ['milestones', dateFrom, dateTo],
    queryFn: () => fetchJson<{ data: Milestone[] }>(`${API}/milestones?date_from=${dateFrom}&date_to=${dateTo}`),
  })
}

export function useOpportunityMilestones(opportunityId: string) {
  return useQuery({
    queryKey: ['milestones', 'opportunity', opportunityId],
    queryFn: () => fetchJson<{ data: Milestone[] }>(`${API}/milestones/opportunity/${opportunityId}`),
    enabled: !!opportunityId,
  })
}

export function useCreateMilestone() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ opportunityId, ...input }: Partial<Milestone> & { opportunityId: string }) =>
      fetchJson(`${API}/milestones/opportunity/${opportunityId}`, { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['milestones'] }),
  })
}

// Proposals
export function useProposal(opportunityId: string) {
  return useQuery({
    queryKey: ['proposal', opportunityId],
    queryFn: () => fetchJson<{ data: Proposal | null }>(`${API}/proposals/${opportunityId}`),
    enabled: !!opportunityId,
  })
}

export function useUpsertProposal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ opportunityId, ...input }: Partial<Proposal> & { opportunityId: string }) =>
      fetchJson(`${API}/proposals/${opportunityId}`, { method: 'PUT', body: JSON.stringify(input) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['proposal'] }),
  })
}

// Types
export type CalendarBlock = {
  id: string
  opportunity_id: string | null
  title: string
  date: string
  slot: 'AM' | 'PM' | 'ALL_DAY'
  hours: number
  notes: string | null
  status: 'planned' | 'in_progress' | 'done' | 'skipped'
  created_at: string
  updated_at: string
  opportunities?: { id: string; name: string; type: string; organization: string | null } | null
}

export type Milestone = {
  id: string
  opportunity_id: string
  title: string
  date: string
  time: string | null
  type: 'deadline' | 'office_hour' | 'announcement' | 'checkpoint' | 'other'
  links: { label: string; url: string }[]
  notes: string | null
  completed: boolean
  created_at: string
  updated_at: string
  opportunities?: { id: string; name: string; type: string; organization: string | null } | null
}

export type Proposal = {
  id: string
  opportunity_id: string
  content: string | null
  status: 'draft' | 'submitted' | 'accepted' | 'rejected'
  submission_url: string | null
  links: { label: string; url: string }[]
  created_at: string
  updated_at: string
}
