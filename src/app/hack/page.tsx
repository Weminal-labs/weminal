'use client'

import { useState, useCallback, useRef, Suspense } from 'react'
import { useQueryStates, parseAsString, parseAsInteger } from 'nuqs'
import type { SortingState } from '@tanstack/react-table'
import { format, addWeeks, subWeeks, addMonths, subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { useOpportunities } from '@/hooks/use-opportunities'
import { useBlocks, useCreateBlock, useUpdateBlock, useMilestones, type CalendarBlock } from '@/hooks/use-calendar'
import { OpportunityTable } from '@/components/table/opportunity-table'
import { TablePagination } from '@/components/table/table-pagination'
import { FilterBar } from '@/components/filters/filter-bar'
import { CreateOpportunityDialog } from '@/components/forms/create-opportunity-dialog'
import { DeleteConfirmDialog } from '@/components/forms/delete-confirm-dialog'
import { OpportunityDetail } from '@/components/detail/opportunity-detail'
import { WeekView } from '@/components/calendar/week-view'
import { MonthView } from '@/components/calendar/month-view'
import { OpportunitySidebar } from '@/components/calendar/opportunity-sidebar'
import { MilestoneTimeline } from '@/components/calendar/milestone-timeline'
import { BlockDetailPanel } from '@/components/calendar/block-detail-panel'
import { MonthlySummary } from '@/components/calendar/monthly-summary'
import { Skeleton } from '@/components/ui/skeleton'
import { McpUsageDialog } from '@/components/mcp-usage-dialog'
import { Button } from '@/components/ui/button'
import type { Opportunity } from '@/lib/types'
import { SearchInput } from '@/components/filters/search-input'
import { Calendar, Table2, ChevronLeft, ChevronRight, BarChart3, LayoutGrid } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

type ViewMode = 'table' | 'calendar'
type CalendarViewMode = 'week' | 'month'

function OpportunitiesPage() {
  const [params, setParams] = useQueryStates({
    view: parseAsString.withDefault('table'),
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

  const activeView = (params.view === 'calendar' ? 'calendar' : 'table') as ViewMode

  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null)
  const [deleteOpp, setDeleteOpp] = useState<Opportunity | null>(null)

  // --- Table state ---
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

  // --- Calendar state ---
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarView, setCalendarView] = useState<CalendarViewMode>('week')
  const [selectedBlock, setSelectedBlock] = useState<CalendarBlock | null>(null)
  const dragOppRef = useRef<Opportunity | null>(null)
  const dragBlockRef = useRef<CalendarBlock | null>(null)

  const weekStart = format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const weekEnd = format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const monthStart = format(startOfMonth(currentDate), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(currentDate), 'yyyy-MM-dd')

  const dateFrom = calendarView === 'week' ? weekStart : monthStart
  const dateTo = calendarView === 'week' ? weekEnd : monthEnd

  const { data: blocksData, isLoading: blocksLoading } = useBlocks(dateFrom, dateTo)
  const { data: milestonesData } = useMilestones(dateFrom, dateTo)

  // Fetch opportunities with dates for calendar overlay
  const { data: calOppsData } = useOpportunities({ per_page: 100, sort_by: 'start_date', sort_order: 'asc' })
  const calendarOpportunities = calOppsData?.data ?? []
  const createBlock = useCreateBlock()
  const updateBlock = useUpdateBlock()

  const blocks = blocksData?.data ?? []
  const milestones = milestonesData?.data ?? []

  const navigateCalendar = useCallback((dir: 'prev' | 'next' | 'today') => {
    if (dir === 'today') setCurrentDate(new Date())
    else if (calendarView === 'week') setCurrentDate(d => dir === 'next' ? addWeeks(d, 1) : subWeeks(d, 1))
    else setCurrentDate(d => dir === 'next' ? addMonths(d, 1) : subMonths(d, 1))
  }, [calendarView])

  const handleSlotDrop = useCallback(async (date: string, slot: 'AM' | 'PM' | 'ALL_DAY') => {
    if (dragOppRef.current) {
      const opp = dragOppRef.current
      try {
        await createBlock.mutateAsync({
          opportunity_id: opp.id,
          title: opp.name,
          date,
          slot,
          hours: 4,
        })
        toast.success(`Added "${opp.name}" to ${date} ${slot}`)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to create block')
      }
      dragOppRef.current = null
    } else if (dragBlockRef.current) {
      const block = dragBlockRef.current
      try {
        await updateBlock.mutateAsync({ id: block.id, date, slot })
        toast.success(`Moved "${block.title}" to ${date} ${slot}`)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to move block')
      }
      dragBlockRef.current = null
    }
  }, [createBlock, updateBlock])

  return (
    <main className="min-h-dvh bg-white">
      {activeView === 'table' ? (
        /* ===== TABLE VIEW ===== */
        <div className="mx-auto max-w-7xl px-2 md:px-4 py-4 md:py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 md:mb-6 flex-wrap gap-2">
            <div className="flex items-center gap-3 md:gap-4">
              <nav className="flex items-center rounded-lg bg-gray-100/80 p-0.5" aria-label="Main navigation">
                <span className="inline-flex items-center gap-1 md:gap-1.5 rounded-md px-2.5 md:px-3.5 py-1.5 text-xs md:text-sm font-semibold bg-white text-gray-900 shadow-sm" aria-current="page">
                  <Table2 className="size-4" aria-hidden="true" /> Table
                </span>
                <button
                  type="button"
                  onClick={() => setParams({ view: 'calendar' })}
                  className="inline-flex items-center gap-1 md:gap-1.5 rounded-md px-2.5 md:px-3.5 py-1.5 text-xs md:text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <Calendar className="size-4" aria-hidden="true" /> Calendar
                </button>
                <Link
                  href="/charts"
                  className="inline-flex items-center gap-1 md:gap-1.5 rounded-md px-2.5 md:px-3.5 py-1.5 text-xs md:text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <BarChart3 className="size-4" aria-hidden="true" /> Charts
                </Link>
                <Link
                  href="/review"
                  className="inline-flex items-center gap-1 md:gap-1.5 rounded-md px-2.5 md:px-3.5 py-1.5 text-xs md:text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <LayoutGrid className="size-4" aria-hidden="true" /> Review
                </Link>
              </nav>
              <div className="hidden md:block">
                <h1 className="text-lg font-semibold text-gray-800 tracking-tight">Crypto Opportunities</h1>
                <p className="text-xs text-gray-400">Hackathons, grants, fellowships, and bounties</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <SearchInput
                value={params.search ?? ''}
                onChange={(v) => handleFilterChange('search', v || undefined)}
              />
              <McpUsageDialog />
              <CreateOpportunityDialog />
            </div>
          </div>

          {/* Filters */}
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
      ) : (
        /* ===== CALENDAR VIEW ===== */
        <div className="flex flex-col min-h-dvh">
          {/* Calendar Header */}
          <header className="border-b border-gray-200/80 bg-white/95 backdrop-blur-sm px-4 py-2.5 sticky top-0 z-20">
            <div className="mx-auto max-w-7xl flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-3 md:gap-5">
                <nav className="flex items-center rounded-lg bg-gray-100/80 p-0.5" aria-label="Main navigation">
                  <button
                    type="button"
                    onClick={() => setParams({ view: 'table' })}
                    className="inline-flex items-center gap-1 md:gap-1.5 rounded-md px-2.5 md:px-3.5 py-1.5 text-xs md:text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <Table2 className="size-4" aria-hidden="true" /> Table
                  </button>
                  <span className="inline-flex items-center gap-1 md:gap-1.5 rounded-md px-2.5 md:px-3.5 py-1.5 text-xs md:text-sm font-semibold bg-white text-gray-900 shadow-sm" aria-current="page">
                    <Calendar className="size-4" aria-hidden="true" /> Calendar
                  </span>
                  <Link
                    href="/charts"
                    className="inline-flex items-center gap-1 md:gap-1.5 rounded-md px-2.5 md:px-3.5 py-1.5 text-xs md:text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <BarChart3 className="size-4" aria-hidden="true" /> Charts
                  </Link>
                  <Link
                    href="/review"
                    className="inline-flex items-center gap-1 md:gap-1.5 rounded-md px-2.5 md:px-3.5 py-1.5 text-xs md:text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <LayoutGrid className="size-4" aria-hidden="true" /> Review
                  </Link>
                </nav>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => navigateCalendar('prev')} aria-label="Previous">
                    <ChevronLeft className="size-4" aria-hidden="true" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigateCalendar('today')}>Today</Button>
                  <Button variant="outline" size="icon" onClick={() => navigateCalendar('next')} aria-label="Next">
                    <ChevronRight className="size-4" aria-hidden="true" />
                  </Button>
                  <h1 className="text-lg font-semibold text-gray-900 tabular-nums text-balance">
                    {calendarView === 'week'
                      ? `${format(new Date(weekStart), 'MMM d')} – ${format(new Date(weekEnd), 'MMM d, yyyy')}`
                      : format(currentDate, 'MMMM yyyy')
                    }
                  </h1>
                </div>
              </div>

              <div className="flex items-center rounded-lg bg-gray-100/80 p-0.5">
                <button
                  type="button"
                  onClick={() => setCalendarView('week')}
                  className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:outline-none ${calendarView === 'week' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Week
                </button>
                <button
                  type="button"
                  onClick={() => setCalendarView('month')}
                  className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:outline-none ${calendarView === 'month' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Month
                </button>
              </div>
            </div>
          </header>

          {/* Calendar Body */}
          <div className="flex flex-1 overflow-hidden">
            <div className="hidden md:block">
              <OpportunitySidebar onDragStart={opp => { dragOppRef.current = opp }} />
            </div>

            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
              <div className="p-2 md:p-4 overflow-auto flex-1">
                {blocksLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : calendarView === 'week' ? (
                  <WeekView
                    currentDate={currentDate}
                    blocks={blocks}
                    milestones={milestones}
                    onBlockClick={setSelectedBlock}
                    onSlotDrop={handleSlotDrop}
                    onBlockDragStart={block => { dragBlockRef.current = block }}
                  />
                ) : (
                  <MonthView
                    currentDate={currentDate}
                    blocks={blocks}
                    milestones={milestones}
                    opportunities={calendarOpportunities}
                    selectedDate={selectedBlock?.date}
                    onDayClick={(date) => {
                      const dateStr = format(date, 'yyyy-MM-dd')
                      const dayBlocks = blocks.filter(b => b.date === dateStr)
                      if (dayBlocks.length > 0) {
                        setSelectedBlock(dayBlocks[0])
                      } else {
                        setCurrentDate(date)
                        setCalendarView('week')
                      }
                    }}
                  />
                )}
              </div>

              <MilestoneTimeline milestones={milestones} />

              {calendarView === 'month' && (
                <MonthlySummary
                  blocks={blocks}
                  milestones={milestones}
                  monthLabel={format(currentDate, 'MMMM yyyy')}
                />
              )}
            </div>

            {selectedBlock && (
              <BlockDetailPanel
                block={selectedBlock}
                onClose={() => setSelectedBlock(null)}
              />
            )}
          </div>
        </div>
      )}

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
