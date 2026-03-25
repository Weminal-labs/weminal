'use client'

import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, isSameMonth, addMonths, startOfWeek, endOfWeek } from 'date-fns'
import type { CalendarBlock, Milestone } from '@/hooks/use-calendar'
import { typeColors } from '@/lib/type-colors'
import type { OpportunityType } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Flag, Clock } from 'lucide-react'

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
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Month header */}
      <div className="bg-gray-900 px-4 py-2.5">
        <h3 className="text-sm font-bold text-white text-balance">{format(month, 'MMMM yyyy')}</h3>
      </div>

      <div className="p-3">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
            <div key={d} className="text-[10px] font-semibold text-gray-400 text-center py-1">{d}</div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-lg overflow-hidden">
          {days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const dayBlocks = blocks.filter(b => b.date === dateStr)
            const dayMilestones = milestones.filter(m => m.date === dateStr)
            const isCurrentMonth = isSameMonth(day, month)
            const isToday = isSameDay(day, today)
            const hasBlocks = dayBlocks.length > 0 && isCurrentMonth
            const hasMilestones = dayMilestones.length > 0 && isCurrentMonth
            const hasContent = hasBlocks || hasMilestones

            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => onDayClick(day)}
                className={cn(
                  'relative flex flex-col items-stretch p-1 min-h-[52px] text-left transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none focus-visible:z-10',
                  !isCurrentMonth ? 'bg-gray-50 text-gray-300' : 'bg-white hover:bg-blue-50',
                  isToday && 'bg-blue-50',
                )}
                aria-label={`${format(day, 'MMMM d, yyyy')}${hasContent ? `, ${dayBlocks.length} blocks, ${dayMilestones.length} milestones` : ''}`}
              >
                {/* Date number */}
                <span className={cn(
                  'text-[11px] tabular-nums leading-none mb-0.5',
                  !isCurrentMonth && 'text-gray-300',
                  isCurrentMonth && !isToday && 'text-gray-500',
                  isToday && 'text-white font-bold bg-blue-600 rounded-full size-5 flex items-center justify-center',
                  hasContent && !isToday && 'text-gray-900 font-semibold',
                )}>
                  {format(day, 'd')}
                </span>

                {/* Event pills — show actual names, not dots */}
                {isCurrentMonth && (
                  <div className="flex flex-col gap-px mt-auto">
                    {dayBlocks.slice(0, 2).map(b => {
                      const t = b.opportunities?.type as OpportunityType | undefined
                      const colors = t ? typeColors[t] : null
                      return (
                        <div
                          key={b.id}
                          className={cn(
                            'rounded-sm px-1 py-px text-[8px] font-medium leading-tight truncate',
                            colors ? `${colors.bg} ${colors.text}` : 'bg-slate-100 text-slate-500'
                          )}
                        >
                          {b.title.length > 12 ? b.title.slice(0, 12) + '…' : b.title}
                        </div>
                      )
                    })}
                    {dayBlocks.length > 2 && (
                      <div className="text-[8px] text-gray-400 px-1">+{dayBlocks.length - 2} more</div>
                    )}
                    {dayMilestones.slice(0, 1).map(m => (
                      <div
                        key={m.id}
                        className={cn(
                          'flex items-center gap-0.5 rounded-sm px-1 py-px text-[8px] font-medium leading-tight truncate',
                          m.type === 'deadline' ? 'bg-red-50 text-red-600' :
                          m.type === 'office_hour' ? 'bg-teal-50 text-teal-600' :
                          'bg-gray-100 text-gray-500'
                        )}
                      >
                        {m.type === 'deadline' ? <Flag className="size-2 shrink-0" aria-hidden="true" /> : m.type === 'office_hour' ? <Clock className="size-2 shrink-0" aria-hidden="true" /> : null}
                        {m.title.length > 10 ? m.title.slice(0, 10) + '…' : m.title}
                      </div>
                    ))}
                    {dayMilestones.length > 1 && (
                      <div className="text-[8px] text-gray-400 px-1">+{dayMilestones.length - 1}</div>
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function MonthView({ currentDate, blocks, milestones, onDayClick }: Props) {
  const months = Array.from({ length: 4 }, (_, i) => addMonths(startOfMonth(currentDate), i))

  return (
    <div className="grid grid-cols-2 gap-5">
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
