'use client'

import { useState, useCallback, useEffect, Suspense } from 'react'
import { useQueryStates, parseAsString, parseAsInteger } from 'nuqs'
import type { SortingState } from '@tanstack/react-table'
import { useOpportunities } from '@/hooks/use-opportunities'
import { OpportunityTable } from '@/components/table/opportunity-table'
import { TablePagination } from '@/components/table/table-pagination'
import { FilterBar } from '@/components/filters/filter-bar'
import { DeleteConfirmDialog } from '@/components/forms/delete-confirm-dialog'
import { OpportunityDetail } from '@/components/detail/opportunity-detail'
import { Skeleton } from '@/components/ui/skeleton'
import { McpUsageDialog } from '@/components/mcp-usage-dialog'
import type { Opportunity } from '@/lib/types'
import { SearchInput } from '@/components/filters/search-input'
import { Table2, BarChart3, LayoutGrid, Lightbulb } from 'lucide-react'
import Link from 'next/link'

function OpportunitiesPage() {
  const [params, setParams] = useQueryStates({
    type: parseAsString,
    status: parseAsString,
    format: parseAsString,
    organization: parseAsString,
    blockchain: parseAsString,
    tag: parseAsString,
    search: parseAsString,
    sort_by: parseAsString.withDefault('created_at'),
    sort_order: parseAsString.withDefault('desc'),
    page: parseAsInteger.withDefault(1),
  })

  const [contentVisible, setContentVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setContentVisible(true), 800)
    return () => clearTimeout(t)
  }, [])

  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null)
  const [deleteOpp, setDeleteOpp] = useState<Opportunity | null>(null)

  const sorting: SortingState = params.sort_by
    ? [{ id: params.sort_by, desc: params.sort_order === 'desc' }]
    : []

  const { data, isLoading, isError, error } = useOpportunities({
    type: params.type ?? undefined,
    status: params.status ?? undefined,
    format: params.format ?? undefined,
    organization: params.organization ?? undefined,
    blockchain: params.blockchain ?? undefined,
    tag: params.tag ?? undefined,
    search: params.search ?? undefined,
    sort_by: params.sort_by,
    sort_order: params.sort_order,
    page: params.page,
    per_page: 20,
  })

  const handleFilterChange = useCallback((key: string, value: string | undefined) => {
    setParams({ [key]: value ?? null, page: 1 })
  }, [setParams])

  const handleClearAll = useCallback(() => {
    setParams({
      type: null, status: null, format: null, organization: null, blockchain: null,
      tag: null, search: null, page: 1,
    })
  }, [setParams])

  const handleSortingChange = useCallback((newSorting: SortingState) => {
    if (newSorting.length > 0) {
      setParams({
        sort_by: newSorting[0].id,
        sort_order: newSorting[0].desc ? 'desc' : 'asc',
        page: 1,
      })
    }
  }, [setParams])

  const handlePageChange = useCallback((page: number) => {
    setParams({ page })
  }, [setParams])

  return (
    <main className="min-h-dvh relative">
      {/* Background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover object-top z-0 pointer-events-none"
      >
        <source src="/hack-bg.webm" type="video/webm" />
      </video>
      {/* Vignette */}
      <div
        className="pointer-events-none fixed inset-0 z-[1]"
        style={{
          background:
            'linear-gradient(to right, rgba(9,9,11,0.92) 0%, transparent 18%, transparent 82%, rgba(9,9,11,0.92) 100%)',
        }}
      />

      <div className="relative z-10">
        {/* Sticky nav header */}
        <div
          className="sticky top-0 z-30 border-b border-white/10 bg-black/60 backdrop-blur-md transition-all duration-700"
          style={{ opacity: contentVisible ? 1 : 0, transform: contentVisible ? 'translateY(0)' : 'translateY(-12px)' }}
        >
          <div className="mx-auto max-w-7xl px-2 md:px-4 py-2.5 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-3 md:gap-4">
              <nav className="flex items-center rounded-lg bg-white/10 p-0.5" aria-label="Main navigation">
                <span className="inline-flex items-center gap-1 md:gap-1.5 rounded-md px-2.5 md:px-3.5 py-1.5 text-xs md:text-sm font-semibold bg-white/20 text-white shadow-sm" aria-current="page">
                  <Table2 className="size-4" aria-hidden="true" /> Table
                </span>
                <Link
                  href="/charts"
                  className="inline-flex items-center gap-1 md:gap-1.5 rounded-md px-2.5 md:px-3.5 py-1.5 text-xs md:text-sm text-white/70 hover:text-white transition-colors"
                >
                  <BarChart3 className="size-4" aria-hidden="true" /> Charts
                </Link>
                <Link
                  href="/review"
                  className="inline-flex items-center gap-1 md:gap-1.5 rounded-md px-2.5 md:px-3.5 py-1.5 text-xs md:text-sm text-white/70 hover:text-white transition-colors"
                >
                  <LayoutGrid className="size-4" aria-hidden="true" /> Review
                </Link>
                <Link
                  href="/ideas"
                  className="inline-flex items-center gap-1 md:gap-1.5 rounded-md px-2.5 md:px-3.5 py-1.5 text-xs md:text-sm text-white/70 hover:text-white transition-colors"
                >
                  <Lightbulb className="size-4" aria-hidden="true" /> Ideas
                </Link>
              </nav>
              <div className="hidden md:block">
                <h1 className="text-sm font-semibold text-white tracking-tight">Crypto Opportunities</h1>
                <p className="text-xs text-white/50">Hackathons, grants, fellowships, and bounties</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <SearchInput
                value={params.search ?? ''}
                onChange={(v) => handleFilterChange('search', v || undefined)}
              />
              <McpUsageDialog />
            </div>
          </div>
        </div>

        <div className="h-8 md:h-12" />

        <div
          className="mx-auto max-w-7xl px-2 md:px-4 pb-8 transition-all duration-700 delay-200"
          style={{ opacity: contentVisible ? 1 : 0, transform: contentVisible ? 'translateY(0)' : 'translateY(24px)' }}
        >
          <div className="bg-white/25 backdrop-blur-2xl rounded-2xl p-3 md:p-4 shadow-2xl border border-white/20">
            <div className="mb-4">
              <FilterBar
                filters={{
                  type: params.type ?? undefined,
                  status: params.status ?? undefined,
                  format: params.format ?? undefined,
                  organization: params.organization ?? undefined,
                  blockchain: params.blockchain ?? undefined,
                  tag: params.tag ?? undefined,
                }}
                onFilterChange={handleFilterChange}
                onClearAll={handleClearAll}
              />
            </div>

            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : isError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
                <p className="text-red-700">{error instanceof Error ? error.message : 'Failed to load opportunities'}</p>
              </div>
            ) : (
              <>
                <OpportunityTable
                  data={data?.data ?? []}
                  sorting={sorting}
                  onSortingChange={handleSortingChange}
                  onRowClick={setSelectedOpp}
                />
                {data?.pagination && (
                  <TablePagination
                    pagination={data.pagination}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {selectedOpp && (
        <OpportunityDetail
          opportunity={selectedOpp}
          onClose={() => setSelectedOpp(null)}
          onDelete={(opp) => { setDeleteOpp(opp); setSelectedOpp(null) }}
        />
      )}

      <DeleteConfirmDialog
        opportunity={deleteOpp}
        open={!!deleteOpp}
        onOpenChange={(open) => !open && setDeleteOpp(null)}
      />
    </main>
  )
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    }>
      <OpportunitiesPage />
    </Suspense>
  )
}
