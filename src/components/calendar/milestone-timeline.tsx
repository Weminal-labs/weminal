'use client'

import type { Milestone } from '@/hooks/use-calendar'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { typeColors } from '@/lib/type-colors'
import type { OpportunityType } from '@/lib/types'
import { Flag, Clock, Megaphone, CheckCircle2 } from 'lucide-react'

type Props = {
  milestones: Milestone[]
}

const typeIcons = {
  deadline: Flag,
  office_hour: Clock,
  announcement: Megaphone,
  checkpoint: CheckCircle2,
  other: Flag,
}

const typeBg = {
  deadline: 'bg-red-50 text-red-700 border-red-200',
  office_hour: 'bg-gray-50 text-gray-600 border-gray-200',
  announcement: 'bg-amber-50 text-amber-700 border-amber-200',
  checkpoint: 'bg-gray-50 text-gray-700 border-gray-200',
  other: 'bg-gray-50 text-gray-600 border-gray-200',
}

export function MilestoneTimeline({ milestones }: Props) {
  if (milestones.length === 0) return null

  return (
    <div className="border-t border-gray-200 bg-white px-4 py-3">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5 text-balance">Milestone Timeline</h3>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {milestones.slice(0, 12).map(m => {
          const Icon = typeIcons[m.type]
          const oppType = m.opportunities?.type as OpportunityType | undefined
          const oppName = m.opportunities?.name ?? ''

          return (
            <div
              key={m.id}
              className={cn(
                'shrink-0 rounded-lg border px-3 py-2 text-xs min-w-[180px] max-w-[240px]',
                typeBg[m.type],
                m.completed && 'opacity-50'
              )}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className="size-3 shrink-0" aria-hidden="true" />
                <span className="font-semibold tabular-nums">{format(new Date(m.date), 'MMM d')}</span>
                {m.time && <span className="text-[10px] opacity-70 tabular-nums">{m.time}</span>}
              </div>
              <p className={cn('font-medium truncate', m.completed && 'line-through')}>{m.title}</p>
              {oppName && (
                <p className="text-[10px] opacity-60 truncate mt-0.5">
                  {oppType && <span className="capitalize">{oppType}: </span>}
                  {oppName}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
