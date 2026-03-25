'use client'

import type { CalendarBlock } from '@/hooks/use-calendar'
import { typeColors } from '@/lib/type-colors'
import type { OpportunityType } from '@/lib/types'
import { cn } from '@/lib/utils'

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

  return (
    <button
      type="button"
      className={cn(
        'w-full rounded-md px-2 py-1.5 text-left text-xs transition-colors',
        colors ? `${colors.bg} ${colors.text}` : 'bg-slate-100 text-slate-600 border border-slate-200',
        isDone && 'opacity-50',
        isSkipped && 'opacity-40 line-through',
        'hover:ring-2 hover:ring-gray-300 cursor-pointer'
      )}
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      aria-label={`${block.title} — ${block.hours}h ${block.slot}`}
    >
      <p className={cn('font-medium truncate', isSkipped && 'line-through')}>{block.title}</p>
      <p className="text-[10px] opacity-70 tabular-nums">{block.hours}h &middot; {block.slot}</p>
    </button>
  )
}
