'use client'

import { TypeFilter } from './type-filter'
import { SelectFilter } from './select-filter'
import { useStatuses, useBlockchains, useTags, useOrganizations } from '@/hooks/use-meta'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

type FilterValues = {
  type?: string
  status?: string
  format?: string
  organization?: string
  blockchain?: string
  tag?: string
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
    <>
      {/* Desktop: single horizontal row */}
      <div className="hidden md:flex md:flex-wrap md:items-center md:gap-2">
        <TypeFilter value={filters.type} onChange={(v) => onFilterChange('type', v)} />
        <SelectFilter label="Status" value={filters.status} options={statusData?.data ?? []} onChange={(v) => onFilterChange('status', v)} formatLabel={(s) => s.replace('_', ' ')} />
        <SelectFilter label="Format" value={filters.format} options={['in_person', 'online', 'hybrid']} onChange={(v) => onFilterChange('format', v)} formatLabel={(s) => s.replace('_', ' ')} />
        <SelectFilter label="Organization" value={filters.organization} options={orgData?.data ?? []} onChange={(v) => onFilterChange('organization', v)} />
        <SelectFilter label="Chain" value={filters.blockchain} options={chainData?.data ?? []} onChange={(v) => onFilterChange('blockchain', v)} />
        <SelectFilter label="Tag" value={filters.tag} options={tagData?.data ?? []} onChange={(v) => onFilterChange('tag', v)} />
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onClearAll} className="text-gray-500" aria-label="Clear all filters">
            <X className="size-3 mr-1" aria-hidden="true" /> Clear
          </Button>
        )}
      </div>

      {/* Mobile: structured rows */}
      <div className="md:hidden space-y-2">
        {/* Row 1: type pills + status */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 no-scrollbar">
          <TypeFilter value={filters.type} onChange={(v) => onFilterChange('type', v)} />
          <div className="shrink-0">
            <SelectFilter label="Status" value={filters.status} options={statusData?.data ?? []} onChange={(v) => onFilterChange('status', v)} formatLabel={(s) => s.replace('_', ' ')} />
          </div>
        </div>

        {/* Row 2: secondary filters */}
        <div className="flex flex-wrap items-center gap-2">
          <SelectFilter label="Format" value={filters.format} options={['in_person', 'online', 'hybrid']} onChange={(v) => onFilterChange('format', v)} formatLabel={(s) => s.replace('_', ' ')} />
          <SelectFilter label="Organization" value={filters.organization} options={orgData?.data ?? []} onChange={(v) => onFilterChange('organization', v)} />
          <SelectFilter label="Chain" value={filters.blockchain} options={chainData?.data ?? []} onChange={(v) => onFilterChange('blockchain', v)} />
          <SelectFilter label="Tag" value={filters.tag} options={tagData?.data ?? []} onChange={(v) => onFilterChange('tag', v)} />
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={onClearAll} className="text-gray-500 shrink-0" aria-label="Clear all filters">
              <X className="size-3 mr-1" aria-hidden="true" /> Clear
            </Button>
          )}
        </div>
      </div>
    </>
  )
}
