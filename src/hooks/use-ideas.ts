'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchIdeas,
  fetchIdea,
  voteIdeaApi,
  fetchIdeaMeta,
  type IdeaListParams,
} from '@/lib/api-client'

export function useIdeas(params: IdeaListParams = {}) {
  return useQuery({
    queryKey: ['ideas', params],
    queryFn: () => fetchIdeas(params),
  })
}

export function useIdea(slug: string) {
  return useQuery({
    queryKey: ['ideas', slug],
    queryFn: () => fetchIdea(slug),
    enabled: !!slug,
  })
}

export function useVoteIdea() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (slug: string) => voteIdeaApi(slug),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ideas'] }),
  })
}

export function useIdeaTracks() {
  return useQuery({
    queryKey: ['meta', 'idea-tracks'],
    queryFn: () => fetchIdeaMeta('idea-tracks'),
    staleTime: 5 * 60 * 1000,
  })
}

export function useIdeaTags() {
  return useQuery({
    queryKey: ['meta', 'idea-tags'],
    queryFn: () => fetchIdeaMeta('idea-tags'),
    staleTime: 5 * 60 * 1000,
  })
}

export function useIdeaChains() {
  return useQuery({
    queryKey: ['meta', 'idea-chains'],
    queryFn: () => fetchIdeaMeta('idea-chains'),
    staleTime: 5 * 60 * 1000,
  })
}
