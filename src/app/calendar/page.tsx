'use client'

import { useState, useCallback, useRef, Suspense } from 'react'
import { format, addWeeks, subWeeks, addMonths, subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addMonths as addM } from 'date-fns'
import { useBlocks, useCreateBlock, useUpdateBlock, useMilestones, type CalendarBlock } from '@/hooks/use-calendar'
import { WeekView } from '@/components/calendar/week-view'
import { MonthView } from '@/components/calendar/month-view'
import { OpportunitySidebar } from '@/components/calendar/opportunity-sidebar'
import { MilestoneTimeline } from '@/components/calendar/milestone-timeline'
import { BlockDetailPanel } from '@/components/calendar/block-detail-panel'
import { MonthlySummary } from '@/components/calendar/monthly-summary'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { Opportunity } from '@/lib/types'
import { toast } from 'sonner'
import { ChevronLeft, ChevronRight, Calendar, Table2 } from 'lucide-react'
import Link from 'next/link'

type ViewMode = 'week' | 'month'

function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<ViewMode>('week')
  const [selectedBlock, setSelectedBlock] = useState<CalendarBlock | null>(null)
  const dragOppRef = useRef<Opportunity | null>(null)
  const dragBlockRef = useRef<CalendarBlock | null>(null)

  // Date range for data fetching
  const weekStart = format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const weekEnd = format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const monthStart = format(startOfMonth(currentDate), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(currentDate), 'yyyy-MM-dd')

  const dateFrom = view === 'week' ? weekStart : monthStart
  const dateTo = view === 'week' ? weekEnd : monthEnd

  const { data: blocksData, isLoading: blocksLoading } = useBlocks(dateFrom, dateTo)
  const { data: milestonesData } = useMilestones(dateFrom, dateTo)
  const createBlock = useCreateBlock()
  const updateBlock = useUpdateBlock()

  const blocks = blocksData?.data ?? []
  const milestones = milestonesData?.data ?? []

  const navigate = useCallback((dir: 'prev' | 'next' | 'today') => {
    if (dir === 'today') setCurrentDate(new Date())
    else if (view === 'week') setCurrentDate(d => dir === 'next' ? addWeeks(d, 1) : subWeeks(d, 1))
    else setCurrentDate(d => dir === 'next' ? addMonths(d, 1) : subMonths(d, 1))
  }, [view])

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
    <div className="min-h-dvh flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200/80 bg-white/95 backdrop-blur-sm px-4 py-2.5 sticky top-0 z-20">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-3 md:gap-5">
            {/* Nav tabs */}
            <nav className="flex items-center rounded-lg bg-gray-100/80 p-0.5" aria-label="Main navigation">
              <Link href="/hack" className="inline-flex items-center gap-1 md:gap-1.5 rounded-md px-2.5 md:px-3.5 py-1.5 text-xs md:text-sm text-gray-500 hover:text-gray-700 transition-colors">
                <Table2 className="size-4" aria-hidden="true" /> Table
              </Link>
              <span className="inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-sm font-semibold bg-white text-gray-900 shadow-sm" aria-current="page">
                <Calendar className="size-4" aria-hidden="true" /> Calendar
              </span>
            </nav>

            {/* Date navigation */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => navigate('prev')} aria-label="Previous">
                <ChevronLeft className="size-4" aria-hidden="true" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('today')}>Today</Button>
              <Button variant="outline" size="icon" onClick={() => navigate('next')} aria-label="Next">
                <ChevronRight className="size-4" aria-hidden="true" />
              </Button>
              <h1 className="text-lg font-semibold text-gray-900 tabular-nums text-balance">
                {view === 'week'
                  ? `${format(new Date(weekStart), 'MMM d')} – ${format(new Date(weekEnd), 'MMM d, yyyy')}`
                  : format(currentDate, 'MMMM yyyy')
                }
              </h1>
            </div>
          </div>

          {/* View toggle */}
          <div className="flex items-center rounded-lg bg-gray-100/80 p-0.5">
            <button
              type="button"
              onClick={() => setView('week')}
              className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:outline-none ${view === 'week' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Week
            </button>
            <button
              type="button"
              onClick={() => setView('month')}
              className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:outline-none ${view === 'month' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Month
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — hidden on mobile */}
        <div className="hidden md:block">
          <OpportunitySidebar onDragStart={opp => { dragOppRef.current = opp }} />
        </div>

        {/* Calendar */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <div className="p-2 md:p-4 overflow-auto flex-1">
            {blocksLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : view === 'week' ? (
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
                selectedDate={selectedBlock?.date}
                onDayClick={(date) => {
                  const dateStr = format(date, 'yyyy-MM-dd')
                  const dayBlocks = blocks.filter(b => b.date === dateStr)
                  if (dayBlocks.length > 0) {
                    setSelectedBlock(dayBlocks[0])
                  } else {
                    // Switch to week view for that day so user can add blocks
                    setCurrentDate(date)
                    setView('week')
                  }
                }}
              />
            )}
          </div>

          {/* Milestone timeline */}
          <MilestoneTimeline milestones={milestones} />

          {/* Monthly summary */}
          {view === 'month' && (
            <MonthlySummary
              blocks={blocks}
              milestones={milestones}
              monthLabel={format(currentDate, 'MMMM yyyy')}
            />
          )}
        </div>

        {/* Block detail panel */}
        {selectedBlock && (
          <BlockDetailPanel
            block={selectedBlock}
            onClose={() => setSelectedBlock(null)}
          />
        )}
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh flex items-center justify-center">
        <div className="text-gray-500">Loading calendar...</div>
      </div>
    }>
      <CalendarPage />
    </Suspense>
  )
}
