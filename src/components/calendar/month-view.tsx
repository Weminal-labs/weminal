'use client'

import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, isSameMonth, addMonths, startOfWeek, endOfWeek } from 'date-fns'
import type { CalendarBlock, Milestone } from '@/hooks/use-calendar'
import { typeColors } from '@/lib/type-colors'
import type { OpportunityType } from '@/lib/types'
import { cn } from '@/lib/utils'

type Props = {
  currentDate: Date
  blocks: CalendarBlock[]
  milestones: Milestone[]
  onDayClick: (date: Date) => void
}

function MiniMonth({ month, blocks, milestones, onDayClick }: { month: Date; blocks: CalendarBlock[]; milestones: Milestone[]; onDayClick: (date: Date) => void }) {
  const monthStart = startOfMonth(month)
  const monthEnd = endOfMonth(month)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })
  const today = new Date()

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3">
      <h3 className="text-sm font-semibold text-gray-900 mb-2 text-balance">{format(month, 'MMMM yyyy')}</h3>
      <div className="grid grid-cols-7 gap-px text-center">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div key={i} className="text-[10px] text-gray-400 pb-1">{d}</div>
        ))}
        {days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const dayBlocks = blocks.filter(b => b.date === dateStr)
          const dayMilestones = milestones.filter(m => m.date === dateStr)
          const isCurrentMonth = isSameMonth(day, month)
          const isToday = isSameDay(day, today)

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onDayClick(day)}
              className={cn(
                'relative size-8 flex flex-col items-center justify-center rounded text-xs tabular-nums',
                !isCurrentMonth && 'text-gray-300',
                isCurrentMonth && 'text-gray-700 hover:bg-gray-50',
                isToday && 'bg-blue-100 text-blue-700 font-semibold'
              )}
              aria-label={format(day, 'MMMM d, yyyy')}
            >
              {format(day, 'd')}
              {(dayBlocks.length > 0 || dayMilestones.length > 0) && isCurrentMonth && (
                <div className="absolute bottom-0 flex gap-px">
                  {dayBlocks.slice(0, 2).map(b => {
                    const t = b.opportunities?.type as OpportunityType | undefined
                    return (
                      <div key={b.id} className={cn('size-1 rounded-full', t ? typeColors[t].dot : 'bg-slate-400')} />
                    )
                  })}
                  {dayMilestones.length > 0 && <div className="size-1 rounded-full bg-red-400" />}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function MonthView({ currentDate, blocks, milestones, onDayClick }: Props) {
  const months = Array.from({ length: 4 }, (_, i) => addMonths(startOfMonth(currentDate), i))

  return (
    <div className="grid grid-cols-2 gap-4">
      {months.map(month => (
        <MiniMonth
          key={month.toISOString()}
          month={month}
          blocks={blocks}
          milestones={milestones}
          onDayClick={onDayClick}
        />
      ))}
    </div>
  )
}
