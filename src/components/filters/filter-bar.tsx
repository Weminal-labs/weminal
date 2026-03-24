'use client'

import { TypeFilter } from './type-filter'
import { SearchInput } from './search-input'
import { SelectFilter } from './select-filter'
import { useStatuses, useBlockchains, useTags, useOrganizations } from '@/hooks/use-meta'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

type FilterValues = {
  type?: string
  status?: string
  organization?: string
  blockchain?: string
  tag?: string
  search?: string
}

type Props = {
  filters: FilterValues
  onFilterChange: (key: string, value: string | undefined) => void
  onClearAll: () => void
}

export function FilterBar({ filters, onFilterChange, onClearAll }: Props) {
  const { data: statusData } = useStatuses()
  const { data: chainData } = useBlockchains()
  const { data: tagData } = useTags()
  const { data: orgData } = useOrganizations()

  const hasFilters = Object.values(filters).some((v) => v && v !== '')

  return (
    <div className="flex flex-wrap items-center gap-2">
      <TypeFilter
        value={filters.type}
        onChange={(v) => onFilterChange('type', v)}
      />
      <SelectFilter
        label="Status"
        value={filters.status}
        options={statusData?.data ?? []}
        onChange={(v) => onFilterChange('status', v)}
        formatLabel={(s) => s.replace('_', ' ')}
      />
      <SelectFilter
        label="Organization"
        value={filters.organization}
        options={orgData?.data ?? []}
        onChange={(v) => onFilterChange('organization', v)}
      />
      <SelectFilter
        label="Chain"
        value={filters.blockchain}
        options={chainData?.data ?? []}
        onChange={(v) => onFilterChange('blockchain', v)}
      />
      <SelectFilter
        label="Tag"
        value={filters.tag}
        options={tagData?.data ?? []}
        onChange={(v) => onFilterChange('tag', v)}
      />
      <SearchInput
        value={filters.search ?? ''}
        onChange={(v) => onFilterChange('search', v || undefined)}
      />
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onClearAll} className="text-gray-500" aria-label="Clear all filters">
          <X className="size-3 mr-1" aria-hidden="true" /> Clear
        </Button>
      )}
    </div>
  )
}
