'use client'

import { Suspense, useState, useCallback } from 'react'
import { format, startOfWeek, addWeeks, subWeeks } from 'date-fns'
import { useWeeklyReview, useGenerateWeeklyReview } from '@/hooks/use-weekly-review'
import { AreaChart, Area } from '@/components/charts/area-chart'
import { FunnelChart } from '@/components/charts/funnel-chart'
import { Grid } from '@/components/charts/grid'
import { XAxis } from '@/components/charts/x-axis'
import { ChartTooltip } from '@/components/charts/tooltip'
import { HackDrawer } from '@/components/review/hack-drawer'
import { CardStack } from '@/components/review/card-stack'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { typeColors } from '@/lib/type-colors'
import type { Opportunity, OpportunityType } from '@/lib/types'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import {
  Table2, Calendar, BarChart3, LayoutGrid,
  ChevronLeft, ChevronRight, Sparkles,
  Plus, Trophy, Clock, CheckCircle2, AlertTriangle,
} from 'lucide-react'

function BentoCell({ children, className = '', label, icon: Icon, count }: {
  children: React.ReactNode
  className?: string
  label: string
  icon?: typeof Plus
  count?: number
}) {
  return (
    <div className={cn('rounded-xl border border-gray-100 bg-white p-4 flex flex-col overflow-hidden', className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400 uppercase tracking-wider">
          {Icon && <Icon className="size-3.5" />}
          {label}
        </div>
        {count !== undefined && (
          <span className="text-xs font-semibold text-gray-900 bg-gray-100 rounded-full px-2 py-0.5 tabular-nums">{count}</span>
        )}
      </div>
      {children}
    </div>
  )
}

function OppRow({ opp, onClick }: { opp: Opportunity; onClick: () => void }) {
  const colors = typeColors[opp.type as OpportunityType]
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50 transition-colors"
    >
      {colors && <span className={cn('size-1.5 rounded-full shrink-0', colors.dot)} />}
      <span className="text-xs text-gray-700 truncate flex-1">{opp.name}</span>
      {opp.reward_amount && (
        <span className="text-[10px] text-gray-400 tabular-nums shrink-0">
          ${Number(opp.reward_amount).toLocaleString()}
        </span>
      )}
    </button>
  )
}

function ReviewContent() {
  const [currentDate, setCurrentDate] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
  const weekStart = format(currentDate, 'yyyy-MM-dd')
  const weekEnd = format(addWeeks(currentDate, 1).setDate(addWeeks(currentDate, 1).getDate() - 1) ? new Date(currentDate.getTime() + 6 * 86400000) : currentDate, 'yyyy-MM-dd')

  const { data: review, isLoading } = useWeeklyReview(weekStart)
  const generateMutation = useGenerateWeeklyReview()

  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null)

  const navigate = useCallback((dir: 'prev' | 'next' | 'today') => {
    if (dir === 'today') setCurrentDate(startOfWeek(new Date(), { weekStartsOn: 1 }))
    else if (dir === 'next') setCurrentDate((d) => addWeeks(d, 1))
    else setCurrentDate((d) => subWeeks(d, 1))
  }, [])

  const snap = review?.snapshot

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <nav className="flex items-center rounded-lg bg-gray-100/80 p-0.5" aria-label="Main navigation">
            <Link href="/hack" className="inline-flex items-center gap-1 md:gap-1.5 rounded-md px-2.5 md:px-3.5 py-1.5 text-xs md:text-sm text-gray-500 hover:text-gray-700 transition-colors">
              <Table2 className="size-4" /> Table
            </Link>
            <Link href="/hack?view=calendar" className="inline-flex items-center gap-1 md:gap-1.5 rounded-md px-2.5 md:px-3.5 py-1.5 text-xs md:text-sm text-gray-500 hover:text-gray-700 transition-colors">
              <Calendar className="size-4" /> Calendar
            </Link>
            <Link href="/charts" className="inline-flex items-center gap-1 md:gap-1.5 rounded-md px-2.5 md:px-3.5 py-1.5 text-xs md:text-sm text-gray-500 hover:text-gray-700 transition-colors">
              <BarChart3 className="size-4" /> Charts
            </Link>
            <span className="inline-flex items-center gap-1 md:gap-1.5 rounded-md px-2.5 md:px-3.5 py-1.5 text-xs md:text-sm font-semibold bg-white text-gray-900 shadow-sm" aria-current="page">
              <LayoutGrid className="size-4" /> Review
            </span>
          </nav>
        </div>

        {/* Week nav */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="size-8" onClick={() => navigate('prev')}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate('today')}>Today</Button>
          <Button variant="outline" size="icon" className="size-8" onClick={() => navigate('next')}>
            <ChevronRight className="size-4" />
          </Button>
          <span className="text-sm font-medium text-gray-700 tabular-nums">
            {format(currentDate, 'MMM d')} – {format(new Date(currentDate.getTime() + 6 * 86400000), 'MMM d, yyyy')}
          </span>
        </div>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="grid md:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className={cn('h-48 rounded-xl', i === 2 && 'md:col-span-2 md:row-span-2', i === 5 && 'md:col-span-2', i === 6 && 'md:col-span-2')} />
          ))}
        </div>
      ) : !snap ? (
        /* No snapshot — generate */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="size-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <Sparkles className="size-7 text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">No review for this week</h2>
          <p className="text-sm text-gray-400 mb-6 max-w-xs">Generate a snapshot to see your weekly activity summary</p>
          <Button
            onClick={() => generateMutation.mutate(weekStart)}
            disabled={generateMutation.isPending}
            className="rounded-xl bg-gray-900 hover:bg-gray-800"
          >
            {generateMutation.isPending ? 'Generating...' : 'Generate Review'}
          </Button>
        </div>
      ) : (
        /* Bento Grid */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* New This Week */}
          <BentoCell label="New This Week" icon={Plus} count={snap.newHacks.length}>
            <div className="flex-1 overflow-y-auto space-y-0.5 -mx-2">
              {snap.newHacks.length > 0 ? (
                snap.newHacks.map((opp) => (
                  <OppRow key={opp.id} opp={opp} onClick={() => setSelectedOpp(opp)} />
                ))
              ) : (
                <p className="text-xs text-gray-300 py-4 text-center">No new opportunities</p>
              )}
            </div>
          </BentoCell>

          {/* Best Grant / Top Hacks — Card Stack */}
          <BentoCell label="Top Hacks" icon={Trophy}>
            <CardStack
              opportunities={snap.topHacks}
              onSelect={setSelectedOpp}
            />
          </BentoCell>

          {/* Activity Chart — 2 cols, 2 rows */}
          <BentoCell label="Activity" className="md:col-span-2 md:row-span-2">
            {snap.stats.activityPerDay.length > 0 ? (
              <>
                <div className="flex-1 min-h-0">
                  <AreaChart
                    data={snap.stats.activityPerDay.map((d) => ({ date: new Date(d.date), created: d.created, updated: d.updated }))}
                    xDataKey="date"
                    aspectRatio="2 / 1"
                    margin={{ top: 12, right: 12, bottom: 28, left: 12 }}
                  >
                    <Grid horizontal numTicksRows={3} />
                    <Area dataKey="created" fill="var(--chart-line-primary)" fillOpacity={0.3} strokeWidth={2} />
                    <Area dataKey="updated" fill="var(--chart-line-secondary)" fillOpacity={0.15} strokeWidth={1.5} />
                    <XAxis />
                    <ChartTooltip
                      rows={(point) => [
                        { color: 'var(--chart-line-primary)', label: 'Created', value: String(point.created ?? 0) },
                        { color: 'var(--chart-line-secondary)', label: 'Updated', value: String(point.updated ?? 0) },
                      ]}
                    />
                  </AreaChart>
                </div>
                {/* KPI row */}
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900 tabular-nums">{snap.stats.totalOpportunities}</p>
                    <p className="text-[10px] text-gray-400">Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900 tabular-nums">
                      {snap.stats.totalReward >= 1_000_000 ? `$${(snap.stats.totalReward / 1_000_000).toFixed(1)}M` : `$${(snap.stats.totalReward / 1_000).toFixed(0)}k`}
                    </p>
                    <p className="text-[10px] text-gray-400">Rewards</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900 tabular-nums">{snap.stats.totalNew}</p>
                    <p className="text-[10px] text-gray-400">New</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-300 text-sm">No activity</div>
            )}
          </BentoCell>

          {/* Upcoming Deadlines */}
          <BentoCell label="Deadlines" icon={Clock} count={snap.upcomingDeadlines.length}>
            <div className="flex-1 overflow-y-auto space-y-0.5 -mx-2">
              {snap.upcomingDeadlines.length > 0 ? (
                snap.upcomingDeadlines.slice(0, 5).map((opp) => (
                  <button
                    key={opp.id}
                    type="button"
                    onClick={() => setSelectedOpp(opp)}
                    className="w-full text-left flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-xs text-gray-700 truncate">{opp.name}</span>
                    <span className="text-[10px] text-gray-400 shrink-0 tabular-nums">{opp.end_date}</span>
                  </button>
                ))
              ) : (
                <p className="text-xs text-gray-300 py-4 text-center">No deadlines this week</p>
              )}
            </div>
          </BentoCell>

          {/* Completed */}
          <BentoCell label="Completed" icon={CheckCircle2} count={snap.completedDeadlines.length}>
            <div className="flex-1 overflow-y-auto space-y-0.5 -mx-2">
              {snap.completedDeadlines.length > 0 ? (
                snap.completedDeadlines.map((opp) => (
                  <OppRow key={opp.id} opp={opp} onClick={() => setSelectedOpp(opp)} />
                ))
              ) : (
                <p className="text-xs text-gray-300 py-4 text-center">Nothing completed</p>
              )}
            </div>
          </BentoCell>

          {/* Missing Deadlines */}
          <BentoCell label="Missing Deadlines" icon={AlertTriangle} count={snap.missingDeadlines.length} className="md:col-span-2">
            <div className="flex-1 overflow-y-auto -mx-2">
              {snap.missingDeadlines.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 px-2">
                  {snap.missingDeadlines.map((opp) => {
                    const colors = typeColors[opp.type as OpportunityType]
                    return (
                      <button
                        key={opp.id}
                        type="button"
                        onClick={() => setSelectedOpp(opp)}
                        className="inline-flex items-center gap-1 rounded-full bg-gray-50 border border-gray-100 px-2.5 py-1 text-[11px] text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        {colors && <span className={cn('size-1.5 rounded-full', colors.dot)} />}
                        {opp.name}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <p className="text-xs text-gray-300 py-4 text-center px-2">All hackathons have deadlines</p>
              )}
            </div>
          </BentoCell>

          {/* Pipeline Funnel */}
          <BentoCell label="Pipeline" className="md:col-span-2">
            {snap.stats.funnel.length > 0 ? (
              <FunnelChart
                data={snap.stats.funnel.map((f) => ({
                  label: f.label,
                  value: f.value,
                  displayValue: String(f.value),
                }))}
                color="oklch(0.623 0.214 255)"
                orientation="horizontal"
                edges="curved"
                layers={2}
                gap={3}
                showPercentage
                showValues
                showLabels
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-300 text-sm">No data</div>
            )}
          </BentoCell>
        </div>
      )}

      {/* Drawer */}
      <HackDrawer
        opportunity={selectedOpp}
        open={!!selectedOpp}
        onOpenChange={(open) => !open && setSelectedOpp(null)}
      />
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh flex items-center justify-center">
        <div className="text-gray-500">Loading review...</div>
      </div>
    }>
      <ReviewContent />
    </Suspense>
  )
}
