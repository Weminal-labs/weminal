'use client'

import type { CalendarBlock, Milestone } from '@/hooks/use-calendar'
import { typeColors } from '@/lib/type-colors'
import type { OpportunityType } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Clock, CalendarDays, Flag, TrendingUp } from 'lucide-react'

type Props = {
  blocks: CalendarBlock[]
  milestones: Milestone[]
  monthLabel: string
}

export function MonthlySummary({ blocks, milestones, monthLabel }: Props) {
  const totalHours = blocks.reduce((sum, b) => sum + (b.hours ?? 0), 0)
  const totalBlocks = blocks.length

  const byType: Record<string, { count: number; hours: number }> = {}
  for (const b of blocks) {
    const t = (b.opportunities?.type as string) ?? 'custom'
    if (!byType[t]) byType[t] = { count: 0, hours: 0 }
    byType[t].count++
    byType[t].hours += b.hours ?? 0
  }

  const byStatus = {
    planned: blocks.filter(b => b.status === 'planned').length,
    in_progress: blocks.filter(b => b.status === 'in_progress').length,
    done: blocks.filter(b => b.status === 'done').length,
    skipped: blocks.filter(b => b.status === 'skipped').length,
  }

  const upcomingDeadlines = milestones
    .filter(m => m.type === 'deadline' && !m.completed)
    .slice(0, 3)

  if (totalBlocks === 0 && milestones.length === 0) return null

  return (
    <div className="border-t border-gray-200 bg-gray-50/50 px-4 py-3">
      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{monthLabel} Summary</h3>

      <div className="grid grid-cols-4 gap-3">
        {/* Total blocks */}
        <div className="bg-white rounded-lg border border-gray-100 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <CalendarDays className="size-3.5 text-gray-400" aria-hidden="true" />
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Blocks</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 tracking-tight tabular-nums">{totalBlocks}</p>
        </div>

        {/* Total hours */}
        <div className="bg-white rounded-lg border border-gray-100 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock className="size-3.5 text-gray-400" aria-hidden="true" />
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Hours</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 tracking-tight tabular-nums">{totalHours}h</p>
        </div>

        {/* By type */}
        <div className="bg-white rounded-lg border border-gray-100 p-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <TrendingUp className="size-3.5 text-gray-400" aria-hidden="true" />
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">By Type</span>
          </div>
          <div className="space-y-1">
            {Object.entries(byType).map(([type, data]) => {
              const colors = typeColors[type as OpportunityType]
              return (
                <div key={type} className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1">
                    <div className={cn('size-2 rounded-full', colors?.dot ?? 'bg-gray-400')} />
                    <span className="capitalize font-medium text-gray-600">{type}</span>
                  </div>
                  <span className="tabular-nums font-bold text-gray-900">{data.count} &middot; {data.hours}h</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Status + deadlines */}
        <div className="bg-white rounded-lg border border-gray-100 p-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Flag className="size-3.5 text-gray-400" aria-hidden="true" />
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Status</span>
          </div>
          <div className="space-y-1 text-[10px]">
            {byStatus.done > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">Done</span>
                <span className="font-bold tabular-nums">{byStatus.done}</span>
              </div>
            )}
            {byStatus.in_progress > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium">In Progress</span>
                <span className="font-bold tabular-nums">{byStatus.in_progress}</span>
              </div>
            )}
            {byStatus.planned > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium">Planned</span>
                <span className="font-bold tabular-nums">{byStatus.planned}</span>
              </div>
            )}
            {byStatus.skipped > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-gray-400 font-medium">Skipped</span>
                <span className="font-bold tabular-nums">{byStatus.skipped}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
