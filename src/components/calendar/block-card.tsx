'use client'

import type { CalendarBlock } from '@/hooks/use-calendar'
import { typeColors } from '@/lib/type-colors'
import type { OpportunityType } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Clock } from 'lucide-react'

type Props = {
  block: CalendarBlock
  onClick?: () => void
  draggable?: boolean
  onDragStart?: (e: React.DragEvent) => void
}

export function BlockCard({ block, onClick, draggable, onDragStart }: Props) {
  const oppType = block.opportunities?.type as OpportunityType | undefined
  const colors = oppType ? typeColors[oppType] : null
  const isDone = block.status === 'done'
  const isSkipped = block.status === 'skipped'
  const isInProgress = block.status === 'in_progress'

  return (
    <button
      type="button"
      className={cn(
        'w-full rounded-lg px-2.5 py-2 text-left text-xs transition-colors shadow-sm',
        colors
          ? `${colors.bg} ${colors.text} border border-transparent`
          : 'bg-slate-50 text-slate-600 border border-slate-200',
        isDone && 'opacity-50',
        isSkipped && 'opacity-40',
        isInProgress && 'ring-2 ring-offset-1 ring-blue-300',
        'hover:shadow-md active:shadow-sm cursor-pointer focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:outline-none'
      )}
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      aria-label={`${block.title} — ${block.hours}h ${block.slot}`}
    >
      <p className={cn('font-semibold truncate text-[13px]', isSkipped && 'line-through')}>{block.title}</p>
      <div className="flex items-center gap-1 mt-0.5 opacity-75">
        <Clock className="size-2.5" aria-hidden="true" />
        <span className="tabular-nums">{block.hours}h</span>
        {block.notes && <span className="truncate ml-1">— {block.notes}</span>}
      </div>
    </button>
  )
}
