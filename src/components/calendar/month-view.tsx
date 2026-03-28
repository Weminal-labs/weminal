'use client'

import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, isSameMonth, startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns'
import type { CalendarBlock, Milestone } from '@/hooks/use-calendar'
import { typeColors } from '@/lib/type-colors'
import type { Opportunity, OpportunityType } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Flag, Clock } from 'lucide-react'

type Props = {
  currentDate: Date
  blocks: CalendarBlock[]
  milestones: Milestone[]
  opportunities?: Opportunity[]
  onDayClick: (date: Date) => void
  selectedDate?: string | null
}

export function MonthView({ currentDate, blocks, milestones, opportunities = [], onDayClick, selectedDate }: Props) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })
  const today = new Date()

  // Find opportunities active on a given day
  function getOppsForDay(day: Date): Opportunity[] {
    return opportunities.filter((opp) => {
      if (!opp.start_date && !opp.end_date) return false
      const start = opp.start_date ? parseISO(opp.start_date) : null
      const end = opp.end_date ? parseISO(opp.end_date) : null

      if (start && end) {
        return isWithinInterval(day, { start, end })
      }
      if (start) return isSameDay(day, start)
      if (end) return isSameDay(day, end)
      return false
    })
  }

  return (
    <div className="rounded-xl border border-gray-200/80 overflow-hidden bg-white shadow-sm">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50/80">
        {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(d => (
          <div key={d} className="py-2.5 text-center text-[10px] font-bold text-gray-400 tracking-widest">{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7">
        {days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const dayBlocks = blocks.filter(b => b.date === dateStr)
          const dayMilestones = milestones.filter(m => m.date === dateStr)
          const dayOpps = getOppsForDay(day)
          const isCurrentMonth = isSameMonth(day, currentDate)
          const isToday = isSameDay(day, today)
          const isSelected = selectedDate === dateStr

          // Merge blocks + opportunities, avoid duplicates by name
          const blockNames = new Set(dayBlocks.map(b => b.title))
          const extraOpps = dayOpps.filter(o => !blockNames.has(o.name))

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onDayClick(day)}
              className={cn(
                'relative border-r border-b border-gray-100 p-1.5 text-left transition-colors h-24 flex flex-col overflow-hidden focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:outline-none focus-visible:z-10',
                !isCurrentMonth ? 'bg-gray-50/50' : 'bg-white hover:bg-gray-50/30',
                isSelected && 'bg-gray-100 ring-2 ring-gray-400 ring-inset z-10',
              )}
              aria-label={`${format(day, 'MMMM d, yyyy')}${dayBlocks.length ? `, ${dayBlocks.length} blocks` : ''}${dayOpps.length ? `, ${dayOpps.length} opportunities` : ''}`}
            >
              {/* Date number */}
              <div className="flex justify-end mb-1">
                <span className={cn(
                  'text-xs tabular-nums font-semibold',
                  !isCurrentMonth && 'text-gray-300',
                  isCurrentMonth && !isToday && 'text-gray-500',
                  isToday && 'text-white bg-gray-900 rounded-full size-6 flex items-center justify-center text-[11px] font-bold',
                )}>
                  {format(day, 'd')}
                </span>
              </div>

              {/* Events */}
              {isCurrentMonth && (
                <div className="flex flex-col gap-0.5 mt-auto">
                  {/* Blocks */}
                  {dayBlocks.slice(0, 2).map(b => {
                    const t = b.opportunities?.type as OpportunityType | undefined
                    const colors = t ? typeColors[t] : null
                    return (
                      <div
                        key={b.id}
                        className={cn(
                          'rounded-full h-[18px] flex items-center px-2 text-[9px] font-semibold truncate',
                          colors ? `${colors.bg} ${colors.text}` : 'bg-gray-100 text-gray-500'
                        )}
                      >
                        <span className="truncate">{b.title}</span>
                      </div>
                    )
                  })}

                  {/* Opportunities (from date range) */}
                  {extraOpps.slice(0, Math.max(0, 2 - dayBlocks.length)).map(opp => {
                    const colors = typeColors[opp.type as OpportunityType]
                    return (
                      <div
                        key={opp.id}
                        className={cn(
                          'rounded-full h-[18px] flex items-center px-2 text-[9px] font-semibold truncate',
                          colors ? `${colors.bg} ${colors.text}` : 'bg-gray-100 text-gray-500'
                        )}
                      >
                        <span className="truncate">{opp.name}</span>
                      </div>
                    )
                  })}

                  {(dayBlocks.length + extraOpps.length) > 2 && (
                    <span className="text-[9px] text-gray-400 font-medium pl-1">+{dayBlocks.length + extraOpps.length - 2}</span>
                  )}

                  {dayMilestones.slice(0, 1).map(m => (
                    <div
                      key={m.id}
                      className={cn(
                        'flex items-center gap-0.5 text-[9px] font-semibold truncate pl-0.5',
                        m.type === 'deadline' ? 'text-red-500' :
                        m.type === 'office_hour' ? 'text-gray-600' :
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
