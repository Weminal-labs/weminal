'use client'

import { startOfWeek, addDays, format, isSameDay } from 'date-fns'
import type { CalendarBlock, Milestone } from '@/hooks/use-calendar'
import { BlockCard } from './block-card'
import { cn } from '@/lib/utils'

type Props = {
  currentDate: Date
  blocks: CalendarBlock[]
  milestones: Milestone[]
  onBlockClick: (block: CalendarBlock) => void
  onSlotDrop: (date: string, slot: 'AM' | 'PM' | 'ALL_DAY') => void
  onBlockDragStart: (block: CalendarBlock) => void
}

const SLOTS = ['AM', 'PM'] as const

export function WeekView({ currentDate, blocks, milestones, onBlockClick, onSlotDrop, onBlockDragStart }: Props) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const today = new Date()

  function getBlocks(date: Date, slot: string) {
    const dateStr = format(date, 'yyyy-MM-dd')
    return blocks.filter(b => b.date === dateStr && (b.slot === slot || b.slot === 'ALL_DAY'))
  }

  function getMilestones(date: Date) {
    const dateStr = format(date, 'yyyy-MM-dd')
    return milestones.filter(m => m.date === dateStr)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.currentTarget.classList.add('ring-2', 'ring-blue-400', 'ring-inset', 'bg-blue-50/50')
  }

  function handleDragLeave(e: React.DragEvent) {
    e.currentTarget.classList.remove('ring-2', 'ring-blue-400', 'ring-inset', 'bg-blue-50/50')
  }

  function handleDrop(e: React.DragEvent, date: Date, slot: 'AM' | 'PM' | 'ALL_DAY') {
    e.preventDefault()
    e.currentTarget.classList.remove('ring-2', 'ring-blue-400', 'ring-inset', 'bg-blue-50/50')
    onSlotDrop(format(date, 'yyyy-MM-dd'), slot)
  }

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
        {days.map(day => {
          const isToday = isSameDay(day, today)
          const dayMilestones = getMilestones(day)
          return (
            <div
              key={day.toISOString()}
              className={cn(
                'px-3 py-3 text-center border-r border-gray-200 last:border-r-0',
                isToday && 'bg-blue-50'
              )}
            >
              <p className={cn('text-xs font-medium uppercase tracking-wider', isToday ? 'text-blue-600' : 'text-gray-500')}>{format(day, 'EEE')}</p>
              <p className={cn(
                'text-2xl font-bold tabular-nums mt-0.5',
                isToday ? 'text-blue-600' : 'text-gray-900'
              )}>
                {format(day, 'd')}
              </p>
              {dayMilestones.length > 0 && (
                <div className="flex justify-center gap-1 mt-1.5">
                  {dayMilestones.slice(0, 3).map(m => (
                    <div
                      key={m.id}
                      className={cn(
                        'size-2 rounded-full',
                        m.type === 'deadline' ? 'bg-red-500' :
                        m.type === 'office_hour' ? 'bg-teal-500' :
                        m.type === 'announcement' ? 'bg-amber-500' :
                        'bg-gray-400'
                      )}
                      title={m.title}
                    />
                  ))}
                  {dayMilestones.length > 3 && (
                    <span className="text-[9px] text-gray-400">+{dayMilestones.length - 3}</span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Slot rows */}
      {SLOTS.map(slot => (
        <div key={slot} className="grid grid-cols-7 border-b border-gray-100 last:border-b-0">
          {days.map(day => {
            const cellBlocks = getBlocks(day, slot)
            const isToday = isSameDay(day, today)
            const isEmpty = cellBlocks.length === 0

            return (
              <div
                key={`${day.toISOString()}-${slot}`}
                className={cn(
                  'min-h-[100px] p-2 border-r border-gray-100 last:border-r-0 transition-colors',
                  isToday ? 'bg-blue-50/40' : 'bg-white',
                  isEmpty && 'hover:bg-gray-50/50'
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, day, slot)}
              >
                <p className={cn(
                  'text-[10px] font-semibold uppercase tracking-wider mb-2',
                  slot === 'AM' ? 'text-amber-500' : 'text-indigo-400'
                )}>
                  {slot}
                </p>
                <div className="space-y-1.5">
                  {cellBlocks.map(block => (
                    <BlockCard
                      key={block.id}
                      block={block}
                      onClick={() => onBlockClick(block)}
                      draggable
                      onDragStart={() => onBlockDragStart(block)}
                    />
                  ))}
                </div>
                {isEmpty && (
                  <div className="flex items-center justify-center h-12 rounded-md border border-dashed border-gray-200 text-[10px] text-gray-300">
                    Drop here
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
