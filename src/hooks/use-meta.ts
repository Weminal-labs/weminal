'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchMeta } from '@/lib/api-client'

export function useMeta(endpoint: string) {
  return useQuery({
    queryKey: ['meta', endpoint],
    queryFn: () => fetchMeta(endpoint),
    staleTime: 5 * 60 * 1000,
  })
}

export function useTypes() { return useMeta('types') }
export function useStatuses() { return useMeta('statuses') }
export function useBlockchains() { return useMeta('blockchains') }
export function useTags() { return useMeta('tags') }
export function useOrganizations() { return useMeta('organizations') }
