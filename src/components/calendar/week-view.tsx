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
    e.currentTarget.classList.add('bg-blue-50')
  }

  function handleDragLeave(e: React.DragEvent) {
    e.currentTarget.classList.remove('bg-blue-50')
  }

  function handleDrop(e: React.DragEvent, date: Date, slot: 'AM' | 'PM' | 'ALL_DAY') {
    e.preventDefault()
    e.currentTarget.classList.remove('bg-blue-50')
    onSlotDrop(format(date, 'yyyy-MM-dd'), slot)
  }

  return (
    <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
      {/* Day headers */}
      {days.map(day => (
        <div
          key={day.toISOString()}
          className={cn(
            'bg-white px-2 py-2 text-center',
            isSameDay(day, today) && 'bg-blue-50'
          )}
        >
          <p className="text-xs text-gray-500">{format(day, 'EEE')}</p>
          <p className={cn(
            'text-lg font-semibold tabular-nums',
            isSameDay(day, today) ? 'text-blue-600' : 'text-gray-900'
          )}>
            {format(day, 'd')}
          </p>
          {/* Milestone dots */}
          {getMilestones(day).length > 0 && (
            <div className="flex justify-center gap-0.5 mt-0.5">
              {getMilestones(day).slice(0, 3).map(m => (
                <div
                  key={m.id}
                  className={cn(
                    'size-1.5 rounded-full',
                    m.type === 'deadline' ? 'bg-red-500' :
                    m.type === 'office_hour' ? 'bg-teal-500' :
                    'bg-gray-400'
                  )}
                  title={m.title}
                />
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Slot rows */}
      {SLOTS.map(slot => (
        days.map(day => {
          const cellBlocks = getBlocks(day, slot)
          return (
            <div
              key={`${day.toISOString()}-${slot}`}
              className={cn(
                'bg-white min-h-[80px] p-1 transition-colors',
                isSameDay(day, today) && 'bg-blue-50/30'
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, day, slot)}
            >
              <p className="text-[10px] text-gray-400 mb-1">{slot}</p>
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
        })
      ))}
    </div>
  )
}
