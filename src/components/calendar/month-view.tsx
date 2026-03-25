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
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 mb-3 text-balance">{format(month, 'MMMM yyyy')}</h3>
      <div className="grid grid-cols-7 gap-1 text-center">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <div key={d} className="text-[10px] font-medium text-gray-400 uppercase tracking-wider pb-2">{d}</div>
        ))}
        {days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const dayBlocks = blocks.filter(b => b.date === dateStr)
          const dayMilestones = milestones.filter(m => m.date === dateStr)
          const isCurrentMonth = isSameMonth(day, month)
          const isToday = isSameDay(day, today)
          const hasContent = (dayBlocks.length > 0 || dayMilestones.length > 0) && isCurrentMonth

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onDayClick(day)}
              className={cn(
                'relative flex flex-col items-center justify-center rounded-lg text-xs tabular-nums transition-colors focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:outline-none',
                'h-10 w-full',
                !isCurrentMonth && 'text-gray-300',
                isCurrentMonth && !isToday && !hasContent && 'text-gray-600 hover:bg-gray-100',
                isCurrentMonth && !isToday && hasContent && 'text-gray-900 font-medium hover:bg-gray-100',
                isToday && 'bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-sm',
              )}
              aria-label={format(day, 'MMMM d, yyyy')}
            >
              <span>{format(day, 'd')}</span>
              {hasContent && (
                <div className="absolute -bottom-0.5 flex gap-0.5">
                  {dayBlocks.slice(0, 3).map(b => {
                    const t = b.opportunities?.type as OpportunityType | undefined
                    return (
                      <div key={b.id} className={cn('size-1.5 rounded-full', t ? typeColors[t].dot : 'bg-slate-400')} />
                    )
                  })}
                  {dayMilestones.map(m => (
                    <div
                      key={m.id}
                      className={cn(
                        'size-1.5 rounded-full',
                        m.type === 'deadline' ? 'bg-red-500' :
                        m.type === 'office_hour' ? 'bg-teal-500' :
                        m.type === 'announcement' ? 'bg-amber-500' :
                        'bg-gray-400'
                      )}
                    />
                  ))}
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
    <div className="grid grid-cols-2 gap-6">
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
