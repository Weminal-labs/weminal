'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import { useUpdatesPerDay, useOverview } from '@/hooks/use-stats'
import { AreaChart, Area } from '@/components/charts/area-chart'
import { Grid } from '@/components/charts/grid'
import { XAxis } from '@/components/charts/x-axis'
import { ChartTooltip } from '@/components/charts/tooltip'
import { FunnelChart } from '@/components/charts/funnel-chart'
import { Skeleton } from '@/components/ui/skeleton'
import { Table2, BarChart3, LayoutGrid, Lightbulb, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

const RANGE_OPTIONS = [
  { label: 'Day', days: 1 },
  { label: 'Week', days: 7 },
  { label: 'Month', days: 30 },
  { label: 'Year', days: 365 },
] as const

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-white/30 bg-white/60 backdrop-blur-sm px-4 py-3.5">
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-lg font-semibold text-gray-900 tabular-nums tracking-tight">{value}</p>
      {sub && <p className="text-[11px] text-gray-300 mt-0.5">{sub}</p>}
    </div>
  )
}

function toYMD(d: Date) {
  return d.toISOString().slice(0, 10)
}

function addDays(d: Date, n: number) {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

function ChartsContent() {
  const [days, setDays] = useState(7)
  // offset in units of `days` periods (0 = current, -1 = previous, etc.)
  const [offset, setOffset] = useState(0)

  const rangeEnd = addDays(new Date(), offset * days)
  const rangeStart = addDays(rangeEnd, -days + 1)
  const isCurrentPeriod = offset === 0

  const from = toYMD(rangeStart)
  const to = toYMD(rangeEnd)

  const { data: stats, isLoading: timeLoading } = useUpdatesPerDay(days, from, to)
  const { data: overview, isLoading: overviewLoading } = useOverview()

  // Reset offset when switching range type
  const handleRangeChange = useCallback((d: number) => {
    setDays(d)
    setOffset(0)
  }, [])

  const [contentVisible, setContentVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setContentVisible(true), 800)
    return () => clearTimeout(t)
  }, [])

  const chartData = (stats ?? []).map((s) => ({
    date: new Date(s.date),
    created: s.created,
    updated: s.updated,
  }))

  const isLoading = timeLoading || overviewLoading

  return (
    <main className="min-h-dvh bg-zinc-950 relative">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover object-top -z-10 pointer-events-none"
      >
        <source src="/hack-bg.webm" type="video/webm" />
      </video>
      {/* Vignette */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'linear-gradient(to right, rgba(9,9,11,0.92) 0%, transparent 18%, transparent 82%, rgba(9,9,11,0.92) 100%)',
        }}
      />

      <div className="relative z-10">
        {/* Sticky nav */}
        <div
          className="sticky top-0 z-30 border-b border-white/10 bg-black/60 backdrop-blur-md transition-all duration-700"
          style={{ opacity: contentVisible ? 1 : 0, transform: contentVisible ? 'translateY(0)' : 'translateY(-12px)' }}
        >
          <div className="mx-auto max-w-5xl px-4 py-2.5 flex items-center gap-3">
            <nav className="flex items-center rounded-lg bg-white/10 p-0.5" aria-label="Main navigation">
              <Link href="/hack" className="inline-flex items-center gap-1 md:gap-1.5 rounded-md px-2.5 md:px-3.5 py-1.5 text-xs md:text-sm text-white/70 hover:text-white transition-colors">
                <Table2 className="size-4" aria-hidden="true" /> Table
              </Link>
              <span className="inline-flex items-center gap-1 md:gap-1.5 rounded-md px-2.5 md:px-3.5 py-1.5 text-xs md:text-sm font-semibold bg-white/20 text-white shadow-sm" aria-current="page">
                <BarChart3 className="size-4" aria-hidden="true" /> Charts
              </span>
              <Link href="/review" className="inline-flex items-center gap-1 md:gap-1.5 rounded-md px-2.5 md:px-3.5 py-1.5 text-xs md:text-sm text-white/70 hover:text-white transition-colors">
                <LayoutGrid className="size-4" aria-hidden="true" /> Review
              </Link>
              <Link href="/ideas" className="inline-flex items-center gap-1 md:gap-1.5 rounded-md px-2.5 md:px-3.5 py-1.5 text-xs md:text-sm text-white/70 hover:text-white transition-colors">
                <Lightbulb className="size-4" aria-hidden="true" /> Ideas
              </Link>
            </nav>
            <div className="hidden md:block">
              <h1 className="text-sm font-semibold text-white tracking-tight">Analytics</h1>
              <p className="text-xs text-white/50">Opportunity pipeline insights</p>
            </div>
          </div>
        </div>

        {/* GIF hero space */}
        <div className="h-8 md:h-12" />

        {/* Content card */}
        <div
          className="mx-auto max-w-5xl px-4 pb-8 transition-all duration-700 delay-200"
          style={{ opacity: contentVisible ? 1 : 0, transform: contentVisible ? 'translateY(0)' : 'translateY(24px)' }}
        >
          <div className="bg-white/25 backdrop-blur-2xl rounded-2xl p-4 md:p-6 shadow-2xl border border-white/20">
            {isLoading ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 rounded-xl" />
                  ))}
                </div>
                <Skeleton className="h-64 rounded-xl" />
              </div>
            ) : overview ? (
              <>
                {/* KPI Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  <StatCard label="Opportunities" value={String(overview.total)} />
                  <StatCard label="Reward Pool" value={overview.totalReward >= 1_000_000 ? `$${(overview.totalReward / 1_000_000).toFixed(1)}M` : `$${(overview.totalReward / 1_000).toFixed(0)}k`} />
                  <StatCard
                    label="In Pipeline"
                    value={String(overview.funnel.filter((f) => !['Completed', 'Rejected', 'Cancelled'].includes(f.label)).reduce((s, f) => s + f.value, 0))}
                    sub="Active"
                  />
                  <StatCard
                    label="Completed"
                    value={String(overview.funnel.find((f) => f.label === 'Completed')?.value ?? 0)}
                  />
                </div>

                {/* Activity chart */}
                <div className="rounded-xl border border-white/30 bg-white/60 backdrop-blur-sm p-4 md:p-6 mb-4">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-gray-600">Activity</h3>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setOffset(o => o - 1)}
                          className="rounded p-0.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                          aria-label="Previous period"
                        >
                          <ChevronLeft className="size-3.5" />
                        </button>
                        <span className="text-xs text-gray-400 tabular-nums min-w-[120px] text-center">
                          {from} → {to}
                        </span>
                        <button
                          type="button"
                          onClick={() => setOffset(o => o + 1)}
                          disabled={isCurrentPeriod}
                          className="rounded p-0.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label="Next period"
                        >
                          <ChevronRight className="size-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {RANGE_OPTIONS.map((opt) => (
                        <button
                          key={opt.days}
                          type="button"
                          onClick={() => handleRangeChange(opt.days)}
                          className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                            days === opt.days
                              ? 'bg-gray-900 text-white'
                              : 'text-gray-300 hover:text-gray-600'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {chartData.length > 0 ? (
                    <>
                      <AreaChart
                        data={chartData}
                        xDataKey="date"
                        aspectRatio="2.5 / 1"
                        margin={{ top: 16, right: 16, bottom: 32, left: 16 }}
                      >
                        <Grid horizontal numTicksRows={4} />
                        <Area
                          dataKey="created"
                          fill="var(--chart-line-primary)"
                          fillOpacity={0.3}
                          strokeWidth={2}
                        />
                        <Area
                          dataKey="updated"
                          fill="var(--chart-line-secondary)"
                          fillOpacity={0.15}
                          strokeWidth={1.5}
                        />
                        <XAxis />
                        <ChartTooltip
                          rows={(point) => [
                            { color: 'var(--chart-line-primary)', label: 'Created', value: String(point.created ?? 0) },
                            { color: 'var(--chart-line-secondary)', label: 'Updated', value: String(point.updated ?? 0) },
                          ]}
                        />
                      </AreaChart>
                      <div className="flex items-center justify-center gap-5 mt-2 text-[11px] text-gray-300">
                        <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-[oklch(0.623_0.214_255)]" /> Created</span>
                        <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-[oklch(0.705_0.015_265)]" /> Updated</span>
                      </div>
                    </>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-gray-300 text-sm">No activity data</div>
                  )}
                </div>

                {/* Pipeline Funnel */}
                <div className="rounded-xl border border-white/30 bg-white/60 backdrop-blur-sm p-4 md:p-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-4">Pipeline</h3>
                  {overview.funnel.length > 0 ? (
                    <FunnelChart
                      data={overview.funnel.map((f) => ({
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
                    <div className="h-32 flex items-center justify-center text-gray-300 text-sm">No data</div>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  )
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-500">Loading...</div>
      </div>
    }>
      <ChartsContent />
    </Suspense>
  )
}
