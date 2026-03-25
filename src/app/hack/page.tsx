'use client'

import { useState, useCallback, Suspense } from 'react'
import { useQueryStates, parseAsString, parseAsInteger } from 'nuqs'
import type { SortingState } from '@tanstack/react-table'
import { useOpportunities } from '@/hooks/use-opportunities'
import { OpportunityTable } from '@/components/table/opportunity-table'
import { TablePagination } from '@/components/table/table-pagination'
import { FilterBar } from '@/components/filters/filter-bar'
import { CreateOpportunityDialog } from '@/components/forms/create-opportunity-dialog'
import { DeleteConfirmDialog } from '@/components/forms/delete-confirm-dialog'
import { OpportunityDetail } from '@/components/detail/opportunity-detail'
import { Skeleton } from '@/components/ui/skeleton'
import type { Opportunity } from '@/lib/types'
import { Calendar, Table2 } from 'lucide-react'
import Link from 'next/link'

function OpportunitiesPage() {
  const [params, setParams] = useQueryStates({
    type: parseAsString,
    status: parseAsString,
    organization: parseAsString,
    blockchain: parseAsString,
    tag: parseAsString,
    search: parseAsString,
    sort_by: parseAsString.withDefault('created_at'),
    sort_order: parseAsString.withDefault('desc'),
    page: parseAsInteger.withDefault(1),
  })

  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null)
  const [deleteOpp, setDeleteOpp] = useState<Opportunity | null>(null)

  const sorting: SortingState = params.sort_by
    ? [{ id: params.sort_by, desc: params.sort_order === 'desc' }]
    : []

  const { data, isLoading, isError, error } = useOpportunities({
    type: params.type ?? undefined,
    status: params.status ?? undefined,
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
      type: null, status: null, organization: null, blockchain: null,
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
    <main className="min-h-dvh">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-1" aria-label="Main navigation">
              <span className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-900" aria-current="page">
                <Table2 className="size-4" aria-hidden="true" /> Table
              </span>
              <Link href="/calendar" className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 transition-colors">
                <Calendar className="size-4" aria-hidden="true" /> Calendar
              </Link>
            </nav>
            <div>
              <h1 className="text-xl font-bold text-gray-900 text-balance">Crypto Opportunities</h1>
              <p className="text-sm text-gray-500 text-pretty">Hackathons, grants, fellowships, and bounties</p>
            </div>
          </div>
          <CreateOpportunityDialog />
        </div>

        {/* Filters */}
        <div className="mb-4">
          <FilterBar
            filters={{
              type: params.type ?? undefined,
              status: params.status ?? undefined,
              organization: params.organization ?? undefined,
              blockchain: params.blockchain ?? undefined,
              tag: params.tag ?? undefined,
              search: params.search ?? undefined,
            }}
            onFilterChange={handleFilterChange}
            onClearAll={handleClearAll}
          />
        </div>

        {/* Table */}
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

      {/* Detail Panel */}
      {selectedOpp && (
        <OpportunityDetail
          opportunity={selectedOpp}
          onClose={() => setSelectedOpp(null)}
          onDelete={(opp) => { setDeleteOpp(opp); setSelectedOpp(null) }}
        />
      )}

      {/* Delete Dialog */}
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
