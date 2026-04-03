'use client'

import { X } from 'lucide-react'
import { useIdeaTags, useIdeaChains } from '@/hooks/use-ideas'

const TRACKS = [
  { value: 'defi', label: 'DeFi', active: 'bg-blue-600/20 text-blue-400 ring-1 ring-blue-500/30' },
  { value: 'dev-tools', label: 'Dev Tools', active: 'bg-violet-600/20 text-violet-400 ring-1 ring-violet-500/30' },
  { value: 'infrastructure', label: 'Infrastructure', active: 'bg-orange-600/20 text-orange-400 ring-1 ring-orange-500/30' },
  { value: 'ai', label: 'AI', active: 'bg-emerald-600/20 text-emerald-400 ring-1 ring-emerald-500/30' },
  { value: 'gaming', label: 'Gaming', active: 'bg-pink-600/20 text-pink-400 ring-1 ring-pink-500/30' },
  { value: 'refi', label: 'ReFi', active: 'bg-teal-600/20 text-teal-400 ring-1 ring-teal-500/30' },
  { value: 'consumer', label: 'Consumer', active: 'bg-slate-600/20 text-slate-400 ring-1 ring-slate-500/30' },
]

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced']
const SORT_OPTIONS = [
  { value: 'votes', label: 'Most Voted' },
  { value: 'created_at', label: 'Newest' },
  { value: 'title', label: 'A–Z' },
]

type Filters = {
  track?: string
  difficulty?: string
  tag?: string
  chain?: string
}

type Props = {
  filters: Filters
  sortBy: string
  onFilterChange: (key: string, value: string | undefined) => void
  onSortChange: (value: string) => void
  onClearAll: () => void
}

export function IdeaFilterBar({ filters, sortBy, onFilterChange, onSortChange, onClearAll }: Props) {
  const { data: tagData } = useIdeaTags()
  const { data: chainData } = useIdeaChains()

  const hasFilters = Object.values(filters).some(Boolean)

  return (
    <div className="space-y-2">
      {/* Track pills row */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {TRACKS.map(({ value, label, active }) => (
          <button
            key={value}
            type="button"
            onClick={() => onFilterChange('track', filters.track === value ? undefined : value)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filters.track === value
                ? active
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Secondary filters row */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Difficulty */}
        <select
          value={filters.difficulty ?? ''}
          onChange={(e) => onFilterChange('difficulty', e.target.value || undefined)}
          className="h-7 rounded-md border border-zinc-700 bg-zinc-800 px-2 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-violet-500"
        >
          <option value="">Difficulty</option>
          {DIFFICULTIES.map((d) => (
            <option key={d} value={d}>
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </option>
          ))}
        </select>

        {/* Chain */}
        {(chainData?.data?.length ?? 0) > 0 && (
          <select
            value={filters.chain ?? ''}
            onChange={(e) => onFilterChange('chain', e.target.value || undefined)}
            className="h-7 rounded-md border border-zinc-700 bg-zinc-800 px-2 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-violet-500"
          >
            <option value="">Chain</option>
            {chainData?.data?.map((c: string) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        )}

        {/* Tag */}
        {(tagData?.data?.length ?? 0) > 0 && (
          <select
            value={filters.tag ?? ''}
            onChange={(e) => onFilterChange('tag', e.target.value || undefined)}
            className="h-7 rounded-md border border-zinc-700 bg-zinc-800 px-2 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-violet-500"
          >
            <option value="">Tag</option>
            {tagData?.data?.map((t: string) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        )}

        <div className="h-4 w-px bg-zinc-700" />

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="h-7 rounded-md border border-zinc-700 bg-zinc-800 px-2 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-violet-500"
        >
          {SORT_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        {/* Clear */}
        {hasFilters && (
          <button
            type="button"
            onClick={onClearAll}
            className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <X className="size-3" /> Clear
          </button>
        )}
      </div>
    </div>
  )
}
