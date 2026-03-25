'use client'

import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, isSameMonth, startOfWeek, endOfWeek } from 'date-fns'
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
  selectedDate?: string | null
}

export function MonthView({ currentDate, blocks, milestones, onDayClick, selectedDate }: Props) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })
  const today = new Date()

  return (
    <div className="rounded-xl border border-gray-200/80 overflow-hidden bg-white shadow-sm flex flex-col h-full">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50/80">
        {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(d => (
          <div key={d} className="py-2.5 text-center text-[10px] font-bold text-gray-400 tracking-widest">{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="flex-1 grid grid-cols-7 auto-rows-fr">
        {days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const dayBlocks = blocks.filter(b => b.date === dateStr)
          const dayMilestones = milestones.filter(m => m.date === dateStr)
          const isCurrentMonth = isSameMonth(day, currentDate)
          const isToday = isSameDay(day, today)
          const isSelected = selectedDate === dateStr

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onDayClick(day)}
              className={cn(
                'relative border-r border-b border-gray-100 p-1.5 text-left transition-colors min-h-[100px] flex flex-col focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none focus-visible:z-10',
                !isCurrentMonth ? 'bg-gray-50/50' : 'bg-white hover:bg-blue-50/20',
                isSelected && 'bg-blue-50/40 ring-2 ring-blue-400 ring-inset z-10',
              )}
              aria-label={`${format(day, 'MMMM d, yyyy')}${dayBlocks.length ? `, ${dayBlocks.length} blocks` : ''}${dayMilestones.length ? `, ${dayMilestones.length} milestones` : ''}`}
            >
              {/* Date number */}
              <div className="flex justify-end mb-1">
                <span className={cn(
                  'text-xs tabular-nums font-semibold',
                  !isCurrentMonth && 'text-gray-300',
                  isCurrentMonth && !isToday && 'text-gray-500',
                  isToday && 'text-white bg-blue-600 rounded-full size-6 flex items-center justify-center text-[11px] font-bold',
                )}>
                  {format(day, 'd')}
                </span>
              </div>

              {/* Events */}
              {isCurrentMonth && (
                <div className="flex flex-col gap-0.5 mt-auto">
                  {dayBlocks.slice(0, 2).map(b => {
                    const t = b.opportunities?.type as OpportunityType | undefined
                    const colors = t ? typeColors[t] : null
                    return (
                      <div
                        key={b.id}
                        className={cn(
                          'rounded-full h-[18px] flex items-center px-2 text-[9px] font-semibold truncate',
                          colors ? `${colors.bg} ${colors.text}` : 'bg-slate-100 text-slate-500'
                        )}
                      >
                        <span className="truncate">{b.title}</span>
                      </div>
                    )
                  })}
                  {dayBlocks.length > 2 && (
                    <span className="text-[9px] text-gray-400 font-medium pl-1">+{dayBlocks.length - 2}</span>
                  )}

                  {dayMilestones.slice(0, 1).map(m => (
                    <div
                      key={m.id}
                      className={cn(
                        'flex items-center gap-0.5 text-[9px] font-semibold truncate pl-0.5',
                        m.type === 'deadline' ? 'text-red-500' :
                        m.type === 'office_hour' ? 'text-teal-600' :
                        'text-gray-400'
                      )}
                    >
                      {m.type === 'deadline' ? <Flag className="size-2.5 shrink-0" aria-hidden="true" /> :
                       m.type === 'office_hour' ? <Clock className="size-2.5 shrink-0" aria-hidden="true" /> : null}
                      <span className="truncate">{m.title}</span>
                    </div>
                  ))}
                  {dayMilestones.length > 1 && (
                    <span className="text-[9px] text-gray-400 pl-1">+{dayMilestones.length - 1}</span>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
