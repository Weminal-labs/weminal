'use client'

import { Suspense, useState } from 'react'
import { useUpdatesPerDay, useOverview } from '@/hooks/use-stats'
import { AreaChart, Area } from '@/components/charts/area-chart'
import { Grid } from '@/components/charts/grid'
import { XAxis } from '@/components/charts/x-axis'
import { ChartTooltip } from '@/components/charts/tooltip'
import { FunnelChart } from '@/components/charts/funnel-chart'
import { Skeleton } from '@/components/ui/skeleton'
import { Table2, Calendar, BarChart3 } from 'lucide-react'
import Link from 'next/link'

const RANGE_OPTIONS = [
  { label: 'Day', days: 1 },
  { label: 'Week', days: 7 },
  { label: 'Month', days: 30 },
  { label: 'Year', days: 365 },
] as const

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white px-4 py-3.5">
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-lg font-semibold text-gray-900 tabular-nums tracking-tight">{value}</p>
      {sub && <p className="text-[11px] text-gray-300 mt-0.5">{sub}</p>}
    </div>
  )
}

function ChartsContent() {
  const [days, setDays] = useState(7)
  const { data: stats, isLoading: timeLoading } = useUpdatesPerDay(days)
  const { data: overview, isLoading: overviewLoading } = useOverview()

  const chartData = (stats ?? []).map((s) => ({
    date: new Date(s.date),
    created: s.created,
    updated: s.updated,
  }))

  const isLoading = timeLoading || overviewLoading

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <nav className="flex items-center rounded-lg bg-gray-100/80 p-0.5" aria-label="Main navigation">
          <Link href="/hack" className="inline-flex items-center gap-1 md:gap-1.5 rounded-md px-2.5 md:px-3.5 py-1.5 text-xs md:text-sm text-gray-500 hover:text-gray-700 transition-colors">
            <Table2 className="size-4" aria-hidden="true" /> Table
          </Link>
          <Link href="/hack?view=calendar" className="inline-flex items-center gap-1 md:gap-1.5 rounded-md px-2.5 md:px-3.5 py-1.5 text-xs md:text-sm text-gray-500 hover:text-gray-700 transition-colors">
            <Calendar className="size-4" aria-hidden="true" /> Calendar
          </Link>
          <span className="inline-flex items-center gap-1 md:gap-1.5 rounded-md px-2.5 md:px-3.5 py-1.5 text-xs md:text-sm font-semibold bg-white text-gray-900 shadow-sm" aria-current="page">
            <BarChart3 className="size-4" aria-hidden="true" /> Charts
          </span>
        </nav>
        <div className="hidden md:block">
          <h1 className="text-lg font-semibold text-gray-900 tracking-tight">Analytics</h1>
          <p className="text-xs text-gray-400">Opportunity pipeline insights</p>
        </div>
      </div>

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

          {/* Main chart: Activity over time */}
          <div className="rounded-xl border border-gray-100 bg-white p-4 md:p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Activity</h3>
              <div className="flex items-center gap-0.5">
                {RANGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.days}
                    type="button"
                    onClick={() => setDays(opt.days)}
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
          <div className="rounded-xl border border-gray-100 bg-white p-4 md:p-6">
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
  )
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    }>
      <ChartsContent />
    </Suspense>
  )
}
