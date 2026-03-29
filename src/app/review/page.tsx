'use client'

import { Suspense, useState, useCallback } from 'react'
import { format, startOfWeek, addWeeks, subWeeks } from 'date-fns'
import { useWeeklyReview, useGenerateWeeklyReview } from '@/hooks/use-weekly-review'
import { AreaChart, Area } from '@/components/charts/area-chart'
import { XAxis } from '@/components/charts/x-axis'
import RichPopover from '@/components/ui/rich-popover'
import { HackDrawer } from '@/components/review/hack-drawer'
import { CardStack } from '@/components/review/card-stack'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { typeColors } from '@/lib/type-colors'
import type { Opportunity, OpportunityType } from '@/lib/types'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import {
  Table2, Calendar, BarChart3, LayoutGrid,
  ChevronLeft, ChevronRight, Sparkles,
  Trophy, Clock, CheckCircle2, AlertTriangle, TrendingUp,
} from 'lucide-react'

function ReviewContent() {
  const [currentDate, setCurrentDate] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
  const weekStart = format(currentDate, 'yyyy-MM-dd')
  const weekEndDate = new Date(currentDate.getTime() + 6 * 86400000)

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
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
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

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="size-8" onClick={() => navigate('prev')}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate('today')}>Today</Button>
          <Button variant="outline" size="icon" className="size-8" onClick={() => navigate('next')}>
            <ChevronRight className="size-4" />
          </Button>
          <span className="text-sm font-medium text-gray-700 tabular-nums">
            {format(currentDate, 'MMM d')} – {format(weekEndDate, 'MMM d, yyyy')}
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-4 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className={cn('rounded-2xl', i === 0 ? 'h-52 md:col-span-2 md:row-span-2' : i === 3 ? 'h-44 md:col-span-2' : 'h-44')} />
          ))}
        </div>
      ) : !snap ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="size-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <Sparkles className="size-7 text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">No review for this week</h2>
          <p className="text-sm text-gray-400 mb-6 max-w-xs">Generate a snapshot to see your weekly summary</p>
          <Button
            onClick={() => generateMutation.mutate(weekStart)}
            disabled={generateMutation.isPending}
            className="rounded-xl bg-gray-900 hover:bg-gray-800"
          >
            {generateMutation.isPending ? 'Generating...' : 'Generate Review'}
          </Button>
        </div>
      ) : (
        <>
        {/* ── Weekly Notes ── */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 md:p-6 mb-4 space-y-4">
          {/* Summary paragraph */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Week of {format(currentDate, 'MMM d')} – {format(weekEndDate, 'MMM d, yyyy')}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {snap.stats.totalNew > 0 ? (
                <>
                  Added <span className="font-medium text-gray-900">{snap.stats.totalNew} new opportunities</span> this week
                  {snap.topHacks.length > 0 && (
                    <>
                      . Biggest find:
                      <RichPopover
                        trigger={
                          <span className="mx-1 inline-flex cursor-pointer items-center rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-xs font-medium text-gray-800 hover:bg-gray-100 align-middle">
                            {snap.topHacks[0].name.slice(0, 30)}{snap.topHacks[0].name.length > 30 ? '...' : ''}
                          </span>
                        }
                        title={snap.topHacks[0].name}
                        description={snap.topHacks[0].description?.slice(0, 150) ?? `${snap.topHacks[0].type} by ${snap.topHacks[0].organization ?? 'Unknown'}`}
                        actionLabel="View details"
                        onActionClick={() => setSelectedOpp(snap.topHacks[0])}
                        meta={snap.topHacks[0].reward_amount ? `$${Number(snap.topHacks[0].reward_amount).toLocaleString()}` : undefined}
                        side="bottom"
                      />
                      with {snap.topHacks[0].reward_amount ? `$${Number(snap.topHacks[0].reward_amount).toLocaleString()} reward` : 'no reward listed'}
                    </>
                  )}
                  {snap.completedDeadlines.length > 0 && (
                    <>
                      . Completed{' '}
                      {snap.completedDeadlines.map((opp, i) => (
                        <span key={opp.id}>
                          {i > 0 && ', '}
                          <RichPopover
                            trigger={
                              <span className="inline-flex cursor-pointer items-center rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-xs font-medium text-gray-800 hover:bg-gray-100 align-middle">
                                {opp.name.slice(0, 25)}{opp.name.length > 25 ? '...' : ''}
                              </span>
                            }
                            title={opp.name}
                            description={`${opp.type} · ${opp.organization ?? 'Unknown org'}`}
                            actionLabel="Details"
                            onActionClick={() => setSelectedOpp(opp)}
                            meta={opp.reward_amount ? `$${Number(opp.reward_amount).toLocaleString()}` : undefined}
                            side="bottom"
                          />
                        </span>
                      ))}
                    </>
                  )}
                  {snap.upcomingDeadlines.length > 0 && (
                    <>. <span className="font-medium text-gray-900">{snap.upcomingDeadlines.length} deadline{snap.upcomingDeadlines.length > 1 ? 's' : ''}</span> coming up</>
                  )}
                  {snap.missingDeadlines.length > 0 && (
                    <>. <span className="text-gray-500">{snap.missingDeadlines.length} hackathon{snap.missingDeadlines.length > 1 ? 's' : ''} still missing deadlines</span></>
                  )}
                  .
                </>
              ) : (
                <>No new opportunities added this week.</>
              )}
            </p>
          </div>

          {/* Tech Stack & Chains */}
          {snap.insights && (snap.insights.topChains.length > 0 || snap.insights.topTags.length > 0) && (
            <div className="flex flex-wrap gap-4 pt-3 border-t border-gray-50">
              {snap.insights.topChains.length > 0 && (
                <div>
                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">Tech Stack</p>
                  <div className="flex flex-wrap gap-1">
                    {snap.insights.topChains.map((c) => (
                      <span key={c.name} className="inline-flex items-center gap-1 rounded-full bg-gray-50 border border-gray-100 px-2 py-0.5 text-[11px] text-gray-600">
                        {c.name} <span className="text-gray-300">{c.count}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {snap.insights.topTags.length > 0 && (
                <div>
                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">Topics</p>
                  <div className="flex flex-wrap gap-1">
                    {snap.insights.topTags.map((t) => (
                      <span key={t.name} className="inline-flex items-center gap-1 rounded-full bg-gray-50 border border-gray-100 px-2 py-0.5 text-[11px] text-gray-600">
                        {t.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Resource Links */}
          {snap.insights?.resourceLinks && snap.insights.resourceLinks.length > 0 && (
            <div className="pt-3 border-t border-gray-50">
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">Docs & Links</p>
              <div className="flex flex-wrap gap-1.5">
                {snap.insights.resourceLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-md border border-gray-100 bg-white px-2 py-1 text-[11px] text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    <span className="size-1 rounded-full bg-gray-300 shrink-0" />
                    <span className="truncate max-w-[160px]">{link.name}</span>
                    <svg className="size-2.5 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-4">

          {/* ── Hero: KPIs + Activity (span 2 cols, 2 rows) ── */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 md:col-span-2 md:row-span-2 flex flex-col justify-between">
            <div>
              <p className="text-gray-400 text-[11px] font-medium tracking-wider uppercase mb-1">Weekly Snapshot</p>
              <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
                {format(currentDate, 'MMM d')} – {format(weekEndDate, 'MMM d')}
              </h2>
              <p className="text-gray-400 text-xs mt-1">
                {snap.stats.totalNew} new · {snap.completedDeadlines.length} completed · {snap.upcomingDeadlines.length} upcoming
              </p>
            </div>

            {/* KPI row */}
            <div className="grid grid-cols-3 gap-4 my-5">
              <div>
                <p className="text-3xl font-bold text-gray-900 tabular-nums tracking-tight">{snap.stats.totalOpportunities}</p>
                <p className="text-gray-400 text-[10px] mt-0.5">Total</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 tabular-nums tracking-tight">
                  {snap.stats.totalReward >= 1_000_000 ? `$${(snap.stats.totalReward / 1_000_000).toFixed(1)}M` : `$${(snap.stats.totalReward / 1_000).toFixed(0)}k`}
                </p>
                <p className="text-gray-400 text-[10px] mt-0.5">Rewards</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 tabular-nums tracking-tight">{snap.stats.totalNew}</p>
                <p className="text-gray-400 text-[10px] mt-0.5">New</p>
              </div>
            </div>

            {/* Activity chart */}
            {snap.stats.activityPerDay.length > 0 && (
              <div className="mt-auto">
                <AreaChart
                  data={snap.stats.activityPerDay.map((d) => ({ date: new Date(d.date), created: d.created, updated: d.updated }))}
                  xDataKey="date"
                  aspectRatio="3 / 1"
                  margin={{ top: 8, right: 4, bottom: 20, left: 4 }}
                >
                  <Area dataKey="created" fill="var(--chart-line-primary)" fillOpacity={0.2} strokeWidth={2} />
                  <Area dataKey="updated" fill="var(--chart-line-secondary)" fillOpacity={0.1} strokeWidth={1.5} />
                  <XAxis />
                </AreaChart>
              </div>
            )}
          </div>

          {/* ── Top Hacks card stack ── */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4 flex flex-col">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-3">
              <Trophy className="size-3.5" /> Top Hacks
            </div>
            <div className="flex-1 flex items-center justify-center">
              <CardStack opportunities={snap.topHacks} onSelect={setSelectedOpp} />
            </div>
          </div>

          {/* ── Completed ── */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                <CheckCircle2 className="size-3.5" /> Completed
              </div>
              <span className="text-xs font-semibold text-gray-900 bg-gray-100 rounded-full px-2 py-0.5 tabular-nums">{snap.completedDeadlines.length}</span>
            </div>
            <div className="flex-1 space-y-1">
              {snap.completedDeadlines.length > 0 ? (
                snap.completedDeadlines.slice(0, 4).map((opp) => {
                  const colors = typeColors[opp.type as OpportunityType]
                  return (
                    <button key={opp.id} type="button" onClick={() => setSelectedOpp(opp)}
                      className="w-full text-left flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50 transition-colors">
                      {colors && <span className={cn('size-1.5 rounded-full shrink-0', colors.dot)} />}
                      <span className="text-xs text-gray-700 truncate">{opp.name}</span>
                    </button>
                  )
                })
              ) : (
                <p className="text-xs text-gray-300 py-6 text-center">None yet</p>
              )}
            </div>
          </div>

          {/* ── Deadlines ── */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                <Clock className="size-3.5" /> Deadlines
              </div>
              <span className="text-xs font-semibold text-gray-900 bg-gray-100 rounded-full px-2 py-0.5 tabular-nums">{snap.upcomingDeadlines.length}</span>
            </div>
            <div className="flex-1 space-y-1">
              {snap.upcomingDeadlines.length > 0 ? (
                snap.upcomingDeadlines.slice(0, 4).map((opp) => (
                  <button key={opp.id} type="button" onClick={() => setSelectedOpp(opp)}
                    className="w-full text-left flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50 transition-colors">
                    <span className="text-xs text-gray-700 truncate">{opp.name}</span>
                    <span className="text-[10px] text-gray-400 shrink-0 tabular-nums">{opp.end_date}</span>
                  </button>
                ))
              ) : (
                <p className="text-xs text-gray-300 py-6 text-center">No deadlines</p>
              )}
            </div>
          </div>

          {/* ── Pipeline Status (span 2) ── */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4 md:col-span-2 flex flex-col">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-4">
              <TrendingUp className="size-3.5" /> Pipeline Status
            </div>
            {snap.stats.funnel.length > 0 ? (
              <div className="space-y-2.5">
                {snap.stats.funnel.map((f) => {
                  const maxVal = Math.max(...snap.stats.funnel.map((s) => s.value))
                  const pct = maxVal > 0 ? (f.value / maxVal) * 100 : 0
                  return (
                    <div key={f.label} className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-24 shrink-0 text-right">{f.label}</span>
                      <div className="flex-1 h-6 bg-gray-50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gray-900 rounded-full flex items-center justify-end px-2 transition-all duration-500"
                          style={{ width: `${Math.max(pct, 8)}%` }}
                        >
                          <span className="text-[10px] font-semibold text-white tabular-nums">{f.value}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-300 text-sm py-8">No data</div>
            )}
          </div>

          {/* ── New This Week (span 2, compact) ── */}
          <div className="rounded-2xl bg-gray-50/80 p-4 md:col-span-2 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                New This Week
              </div>
              <span className="text-xs font-semibold text-gray-900 bg-white rounded-full px-2 py-0.5 tabular-nums">{snap.newHacks.length}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {snap.newHacks.slice(0, 12).map((opp) => {
                const colors = typeColors[opp.type as OpportunityType]
                return (
                  <button
                    key={opp.id}
                    type="button"
                    onClick={() => setSelectedOpp(opp)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white border border-gray-100 px-3 py-1.5 text-[11px] text-gray-700 hover:bg-gray-100 transition-colors shadow-sm"
                  >
                    {colors && <span className={cn('size-1.5 rounded-full', colors.dot)} />}
                    <span className="truncate max-w-[140px]">{opp.name}</span>
                    {opp.reward_amount && (
                      <span className="text-gray-400 tabular-nums">${Number(opp.reward_amount).toLocaleString()}</span>
                    )}
                  </button>
                )
              })}
              {snap.newHacks.length > 12 && (
                <span className="inline-flex items-center px-3 py-1.5 text-[11px] text-gray-400">
                  +{snap.newHacks.length - 12} more
                </span>
              )}
            </div>
          </div>

          {/* ── Missing Deadlines (span 2) ── */}
          {snap.missingDeadlines.length > 0 && (
            <div className="rounded-2xl border border-gray-100 bg-white p-4 md:col-span-2 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                  <AlertTriangle className="size-3.5" /> Missing Deadlines
                </div>
                <span className="text-xs font-semibold text-gray-900 bg-gray-100 rounded-full px-2 py-0.5 tabular-nums">{snap.missingDeadlines.length}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
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
            </div>
          )}
        </div>
        </>
      )}

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
