'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchOpportunities,
  createOpportunityApi,
  updateOpportunityApi,
  deleteOpportunityApi,
  type ListParams,
} from '@/lib/api-client'
import type { Opportunity } from '@/lib/types'

export function useOpportunities(params: ListParams) {
  return useQuery({
    queryKey: ['opportunities', params],
    queryFn: () => fetchOpportunities(params),
  })
}

export function useCreateOpportunity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Partial<Opportunity>) => createOpportunityApi(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['opportunities'] }),
  })
}

export function useUpdateOpportunity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...input }: Partial<Opportunity> & { id: string }) =>
      updateOpportunityApi(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['opportunities'] }),
  })
}

export function useDeleteOpportunity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteOpportunityApi(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['opportunities'] }),
  })
}
