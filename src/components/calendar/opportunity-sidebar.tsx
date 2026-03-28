'use client'

import { useState } from 'react'
import { useOpportunities } from '@/hooks/use-opportunities'
import { TypeBadge } from '@/components/table/type-badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { typeColors } from '@/lib/type-colors'
import type { Opportunity, OpportunityType } from '@/lib/types'
import { Search } from 'lucide-react'

type Props = {
  onDragStart: (opportunity: Opportunity) => void
  selectedId?: string | null
  onSelect?: (opp: Opportunity) => void
}

const types: OpportunityType[] = ['hackathon', 'grant', 'fellowship', 'bounty']

export function OpportunitySidebar({ onDragStart, selectedId, onSelect }: Props) {
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
    <div className="w-72 shrink-0 border-r border-gray-200 bg-white flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-3 text-balance">Opportunities</h2>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <Input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search…"
            aria-label="Search opportunities"
            autoComplete="off"
            className="h-9 pl-9 text-sm bg-gray-100 border-none focus-visible:ring-2 focus-visible:ring-gray-400"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={!typeFilter}
            onClick={() => setTypeFilter(undefined)}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-gray-400',
              !typeFilter ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            All
          </button>
          {types.map(t => (
            <button
              key={t}
              type="button"
              aria-pressed={typeFilter === t}
              onClick={() => setTypeFilter(typeFilter === t ? undefined : t)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors focus-visible:ring-2 focus-visible:ring-gray-400',
                typeFilter === t ? `${typeColors[t].bg} ${typeColors[t].text}` : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {opportunities.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8 text-pretty">No opportunities found</p>
        ) : (
          opportunities.map(opp => {
            const oppType = opp.type as OpportunityType
            const isSelected = selectedId === opp.id
            return (
              <div
                key={opp.id}
                draggable
                onDragStart={e => handleDragStart(e, opp)}
                onClick={() => onSelect?.(opp)}
                className={cn(
                  'p-3 rounded-xl border-2 cursor-grab active:cursor-grabbing transition-all',
                  isSelected
                    ? 'border-gray-400 bg-gray-50'
                    : 'border-gray-100 bg-white hover:border-gray-200'
                )}
              >
                <p className="text-sm font-bold text-gray-900 leading-tight truncate">{opp.name}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <TypeBadge type={oppType} />
                </div>
                <p className="text-[10px] text-gray-500 font-medium tabular-nums mt-1.5">
                  {opp.start_date ?? '—'} → {opp.end_date ?? '—'}
                </p>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
