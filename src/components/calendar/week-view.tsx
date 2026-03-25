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

const SLOTS: readonly ('ALL_DAY' | 'AM' | 'PM')[] = ['ALL_DAY', 'AM', 'PM']
const SLOT_LABELS: Record<string, string> = { ALL_DAY: 'All Day', AM: 'AM', PM: 'PM' }

export function WeekView({ currentDate, blocks, milestones, onBlockClick, onSlotDrop, onBlockDragStart }: Props) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const today = new Date()

  function getBlocks(date: Date, slot: string) {
    const dateStr = format(date, 'yyyy-MM-dd')
    if (slot === 'ALL_DAY') return blocks.filter(b => b.date === dateStr && b.slot === 'ALL_DAY')
    return blocks.filter(b => b.date === dateStr && b.slot === slot)
  }

  function getMilestones(date: Date) {
    const dateStr = format(date, 'yyyy-MM-dd')
    return milestones.filter(m => m.date === dateStr)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.currentTarget.classList.add('ring-2', 'ring-blue-300', 'ring-inset', 'bg-blue-50/40')
  }

  function handleDragLeave(e: React.DragEvent) {
    e.currentTarget.classList.remove('ring-2', 'ring-blue-300', 'ring-inset', 'bg-blue-50/40')
  }

  function handleDrop(e: React.DragEvent, date: Date, slot: 'AM' | 'PM' | 'ALL_DAY') {
    e.preventDefault()
    e.currentTarget.classList.remove('ring-2', 'ring-blue-300', 'ring-inset', 'bg-blue-50/40')
    onSlotDrop(format(date, 'yyyy-MM-dd'), slot)
  }

  return (
    <div className="rounded-xl border border-gray-200/80 overflow-hidden bg-white shadow-sm">
      {/* Day headers - 8 columns (label + 7 days) */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-gray-100">
        <div className="bg-gray-50/50" />
        {days.map(day => {
          const isToday = isSameDay(day, today)
          const dayMilestones = getMilestones(day)
          return (
            <div
              key={day.toISOString()}
              className={cn(
                'px-2 py-3 text-center border-l border-gray-100',
                isToday && 'bg-blue-50/50'
              )}
            >
              <p className={cn('text-[11px] font-semibold uppercase tracking-wider', isToday ? 'text-blue-600' : 'text-gray-400')}>
                {format(day, 'EEE')}
              </p>
              <p className={cn(
                'text-xl font-bold tabular-nums tracking-tight mt-0.5',
                isToday ? 'text-white bg-blue-600 rounded-full size-8 flex items-center justify-center mx-auto' : 'text-gray-800'
              )}>
                {format(day, 'd')}
              </p>
              {dayMilestones.length > 0 && (
                <div className="flex justify-center gap-0.5 mt-1">
                  {dayMilestones.slice(0, 3).map(m => (
                    <div
                      key={m.id}
                      className={cn(
                        'size-1.5 rounded-full',
                        m.type === 'deadline' ? 'bg-red-500' :
                        m.type === 'office_hour' ? 'bg-teal-500' :
                        m.type === 'announcement' ? 'bg-amber-500' :
                        'bg-gray-300'
                      )}
                      title={m.title}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Slot rows */}
      {SLOTS.map(slot => (
        <div key={slot} className={cn('grid grid-cols-[60px_repeat(7,1fr)]', slot !== 'ALL_DAY' ? 'border-t border-gray-100' : 'border-t border-gray-200')}>
          {/* Slot label */}
          <div className="flex items-start justify-center pt-2.5 bg-gray-50/50 border-r border-gray-100">
            <span className={cn(
              'text-[10px] font-semibold uppercase tracking-widest',
              slot === 'ALL_DAY' ? 'text-gray-400' : slot === 'AM' ? 'text-amber-400' : 'text-indigo-300'
            )}>
              {SLOT_LABELS[slot]}
            </span>
          </div>

          {/* Day cells */}
          {days.map(day => {
            const cellBlocks = getBlocks(day, slot)
            const isToday = isSameDay(day, today)
            const minH = slot === 'ALL_DAY' ? 'min-h-[48px]' : 'min-h-[110px]'

            return (
              <div
                key={`${day.toISOString()}-${slot}`}
                className={cn(
                  `${minH} p-1.5 border-l border-gray-100 transition-colors`,
                  isToday ? 'bg-blue-50/20' : 'bg-white',
                  cellBlocks.length === 0 && 'hover:bg-gray-50/30'
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, day, slot)}
              >
                <div className="space-y-1">
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
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
