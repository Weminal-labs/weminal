'use client'

import { useState } from 'react'
import { useOpportunities } from '@/hooks/use-opportunities'
import { TypeBadge } from '@/components/table/type-badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { typeColors } from '@/lib/type-colors'
import type { Opportunity, OpportunityType } from '@/lib/types'
import { Search, GripVertical } from 'lucide-react'

type Props = {
  onDragStart: (opportunity: Opportunity) => void
}

const types: OpportunityType[] = ['hackathon', 'grant', 'fellowship', 'bounty']

export function OpportunitySidebar({ onDragStart }: Props) {
  const [typeFilter, setTypeFilter] = useState<string | undefined>()
  const [search, setSearch] = useState('')
  const { data } = useOpportunities({
    type: typeFilter,
    search: search || undefined,
    per_page: 100,
    sort_by: 'start_date',
    sort_order: 'asc',
  })

  const opportunities = data?.data ?? []

  function handleDragStart(e: React.DragEvent, opp: Opportunity) {
    e.dataTransfer.setData('application/crypto-opportunity', JSON.stringify({ id: opp.id, name: opp.name, type: opp.type }))
    e.dataTransfer.effectAllowed = 'copy'
    onDragStart(opp)
  }

  return (
    <div className="w-64 shrink-0 border-r border-gray-200 bg-white overflow-y-auto">
      <div className="p-3 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-900 mb-2 text-balance">Opportunities</h2>
        <div className="relative mb-2">
          <Search className="absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            className="h-7 pl-7 text-xs"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          <button
            type="button"
            onClick={() => setTypeFilter(undefined)}
            className={cn(
              'rounded-full px-2 py-0.5 text-[10px] font-medium',
              !typeFilter ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
            )}
          >
            All
          </button>
          {types.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(typeFilter === t ? undefined : t)}
              className={cn(
                'rounded-full px-2 py-0.5 text-[10px] font-medium capitalize',
                typeFilter === t ? `${typeColors[t].bg} ${typeColors[t].text}` : 'bg-gray-100 text-gray-600'
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="p-2 space-y-1">
        {opportunities.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4 text-pretty">No opportunities found</p>
        ) : (
          opportunities.map(opp => (
            <div
              key={opp.id}
              draggable
              onDragStart={e => handleDragStart(e, opp)}
              className="flex items-start gap-1.5 rounded-md p-2 hover:bg-gray-50 cursor-grab active:cursor-grabbing transition-colors"
            >
              <GripVertical className="size-3.5 text-gray-300 mt-0.5 shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">{opp.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <TypeBadge type={opp.type as OpportunityType} />
                  {opp.organization && (
                    <span className="text-[10px] text-gray-500 truncate">{opp.organization}</span>
                  )}
                </div>
                {(opp.start_date || opp.end_date) && (
                  <p className="text-[10px] text-gray-400 tabular-nums mt-0.5">
                    {opp.start_date ?? '?'} → {opp.end_date ?? '?'}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
