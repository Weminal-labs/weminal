'use client'

import { Suspense, useState, useCallback } from 'react'
import { parseAsString, parseAsInteger, useQueryStates } from 'nuqs'
import { useIdeas, useVoteIdea } from '@/hooks/use-ideas'
import { IdeaCard } from '@/components/ideas/idea-card'
import { IdeaFilterBar } from '@/components/ideas/idea-filter-bar'
import { SearchInput } from '@/components/filters/search-input'
import { Skeleton } from '@/components/ui/skeleton'
import { Lightbulb } from 'lucide-react'
import type { Idea } from '@/lib/types'

function IdeasContent() {
  const [params, setParams] = useQueryStates({
    track: parseAsString,
    difficulty: parseAsString,
    tag: parseAsString,
    chain: parseAsString,
    search: parseAsString,
    sort_by: parseAsString.withDefault('votes'),
    sort_order: parseAsString.withDefault('desc'),
    page: parseAsInteger.withDefault(1),
  })

  const [selectedChain, setSelectedChain] = useState('')

  const { data, isLoading, isError, error } = useIdeas({
    track: params.track ?? undefined,
    difficulty: params.difficulty ?? undefined,
    tag: params.tag ?? undefined,
    chain: params.chain ?? undefined,
    search: params.search ?? undefined,
    sort_by: params.sort_by,
    sort_order: params.sort_order,
    page: params.page,
    per_page: 30,
  })

  const voteMutation = useVoteIdea()

  const handleFilterChange = useCallback(
    (key: string, value: string | undefined) => {
      setParams({ [key]: value ?? null, page: 1 })
    },
    [setParams]
  )

  const handleClearAll = useCallback(() => {
    setParams({ track: null, difficulty: null, tag: null, chain: null, search: null, page: 1 })
  }, [setParams])

  const ideas = data?.data ?? []
  const pagination = data?.pagination

  return (
    <main className="min-h-dvh bg-zinc-950">
      <div className="mx-auto max-w-7xl px-3 md:px-6 py-6 md:py-10">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-2.5 mb-1.5">
            <Lightbulb className="size-6 text-violet-400 shrink-0" aria-hidden="true" />
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Ideas Pool</h1>
            {pagination && (
              <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-400 tabular-nums">
                {pagination.total}
              </span>
            )}
          </div>
          <p className="text-sm text-zinc-500">
            Curated build ideas for your next hackathon or grant application — with market validation and a clear build path.
          </p>
        </div>

        {/* Search + Filters */}
        <div className="mb-6 space-y-3">
          <SearchInput
            value={params.search ?? ''}
            onChange={(v) => handleFilterChange('search', v || undefined)}
          />
          <IdeaFilterBar
            filters={{
              track: params.track ?? undefined,
              difficulty: params.difficulty ?? undefined,
              tag: params.tag ?? undefined,
              chain: params.chain ?? undefined,
            }}
            sortBy={params.sort_by}
            onFilterChange={handleFilterChange}
            onSortChange={(v) => setParams({ sort_by: v, page: 1 })}
            onClearAll={handleClearAll}
          />
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl bg-zinc-800/50" />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-8 text-center">
            <p className="text-sm text-red-400">
              {error instanceof Error ? error.message : 'Failed to load ideas'}
            </p>
          </div>
        ) : ideas.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
            <Lightbulb className="size-10 text-zinc-700 mx-auto mb-3" aria-hidden="true" />
            <p className="text-sm text-zinc-500">No ideas match your filters</p>
            {Object.values({ track: params.track, difficulty: params.difficulty, tag: params.tag, chain: params.chain, search: params.search }).some(Boolean) && (
              <button
                type="button"
                onClick={handleClearAll}
                className="mt-3 text-xs text-violet-400 hover:text-violet-300 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ideas.map((idea: Idea) => (
                <IdeaCard
                  key={idea.id}
                  idea={idea}
                  selectedChain={selectedChain}
                  onChainChange={setSelectedChain}
                  onVote={() => voteMutation.mutate(idea.slug)}
                  isVoting={voteMutation.isPending && voteMutation.variables === idea.slug}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  type="button"
                  onClick={() => setParams({ page: Math.max(1, params.page - 1) })}
                  disabled={params.page <= 1}
                  className="rounded-md bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-xs text-zinc-500 tabular-nums">
                  {pagination.page} / {pagination.total_pages}
                </span>
                <button
                  type="button"
                  onClick={() => setParams({ page: Math.min(pagination.total_pages, params.page + 1) })}
                  disabled={params.page >= pagination.total_pages}
                  className="rounded-md bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}

export default function IdeasPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh bg-zinc-950 flex items-center justify-center">
          <div className="text-sm text-zinc-500">Loading ideas...</div>
        </div>
      }
    >
      <IdeasContent />
    </Suspense>
  )
}
