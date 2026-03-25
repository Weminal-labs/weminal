'use client'

import type { Milestone } from '@/hooks/use-calendar'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { typeColors } from '@/lib/type-colors'
import type { OpportunityType } from '@/lib/types'
import { Clock, Flag, Megaphone, CheckCircle2 } from 'lucide-react'

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

export function MilestoneTimeline({ milestones }: Props) {
  if (milestones.length === 0) return null

  return (
    <div className="border-t border-gray-200 bg-white px-4 py-3">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Upcoming Milestones</h3>
      <div className="space-y-1.5">
        {milestones.slice(0, 8).map(m => {
          const Icon = typeIcons[m.type]
          const oppType = m.opportunities?.type as OpportunityType | undefined
          const color = oppType ? typeColors[oppType] : null

          return (
            <div key={m.id} className="flex items-center gap-2 text-xs">
              <span className="text-gray-400 tabular-nums shrink-0 w-20">{format(new Date(m.date), 'MMM d')}</span>
              <Icon className={cn('size-3 shrink-0', m.type === 'deadline' ? 'text-red-500' : 'text-gray-400')} aria-hidden="true" />
              <span className={cn('truncate', m.completed && 'line-through text-gray-400')}>
                {m.title}
              </span>
              {m.opportunities && (
                <span className={cn('text-[10px] shrink-0', color ? color.text : 'text-gray-400')}>
                  {m.opportunities.name}
                </span>
              )}
              {m.time && (
                <span className="text-gray-400 tabular-nums shrink-0">{m.time}</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
