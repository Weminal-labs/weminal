'use client'

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type SortingState,
} from '@tanstack/react-table'
import { columns } from './columns'
import type { Opportunity, OpportunityType } from '@/lib/types'
import { ArrowUpDown, ArrowUp, ArrowDown, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TypeBadge } from './type-badge'
import { StatusBadge } from './status-badge'

type Props = {
  data: Opportunity[]
  sorting: SortingState
  onSortingChange: (sorting: SortingState) => void
  onRowClick?: (opportunity: Opportunity) => void
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return null
  const [year, month, day] = dateStr.split('-')
  return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function formatReward(opp: Opportunity) {
  if (!opp.reward_amount) return null
  const currency = opp.reward_currency ?? 'USD'
  const prefix = currency === 'USD' ? '$' : ''
  const amount = Number(opp.reward_amount).toLocaleString()
  return `${prefix}${amount}${opp.reward_token ? ` ${opp.reward_token}` : ''}`
}

function MobileCardList({ data, onRowClick }: { data: Opportunity[]; onRowClick?: (opp: Opportunity) => void }) {
  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white px-4 py-12 text-center text-gray-500">
        No opportunities found
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {data.map((opp) => {
        const reward = formatReward(opp)
        const endDate = formatDate(opp.end_date)

        return (
          <button
            key={opp.id}
            type="button"
            className="w-full text-left rounded-lg border border-gray-200 bg-white px-4 py-3.5 transition-colors hover:bg-gray-50 active:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
            onClick={() => onRowClick?.(opp)}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="font-medium text-gray-900 text-sm leading-snug flex-1 min-w-0">{opp.name}</p>
              <TypeBadge type={opp.type as OpportunityType} />
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <StatusBadge status={opp.status} />
              {opp.organization && (
                <span className="text-xs text-gray-500">{opp.organization}</span>
              )}
            </div>

            {(reward || endDate || opp.website_url) && (
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                {reward && (
                  <span className="text-xs font-medium text-emerald-700 tabular-nums">{reward}</span>
                )}
                {endDate && (
                  <span className="text-xs text-gray-400">Ends {endDate}</span>
                )}
                {opp.website_url && (
                  <a
                    href={opp.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Visit website"
                  >
                    <ExternalLink className="size-3" aria-hidden="true" /> Link
                  </a>
                )}
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}

export function OpportunityTable({ data, sorting, onSortingChange, onRowClick }: Props) {
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater
      onSortingChange(next)
    },
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
  })

  return (
    <>
      {/* Mobile card list */}
      <div className="md:hidden">
        <MobileCardList data={data} onRowClick={onRowClick} />
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  const sorted = header.column.getIsSorted()
                  return (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      aria-sort={sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : undefined}
                    >
                      <div
                        className={cn('flex items-center gap-1', canSort && 'cursor-pointer select-none hover:text-gray-700')}
                        role={canSort ? 'button' : undefined}
                        tabIndex={canSort ? 0 : undefined}
                        onClick={header.column.getToggleSortingHandler()}
                        onKeyDown={canSort ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); header.column.getToggleSortingHandler()?.(e as unknown as React.MouseEvent) } } : undefined}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort && (
                          sorted === 'asc' ? <ArrowUp className="size-3" aria-hidden="true" /> :
                          sorted === 'desc' ? <ArrowDown className="size-3" aria-hidden="true" /> :
                          <ArrowUpDown className="size-3 text-gray-300" aria-hidden="true" />
                        )}
                      </div>
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-500">
                  No opportunities found
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer focus-visible:bg-gray-100 focus-visible:outline-none"
                  tabIndex={0}
                  role="row"
                  onClick={() => onRowClick?.(row.original)}
                  onKeyDown={(e) => { if (e.key === 'Enter') onRowClick?.(row.original) }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-sm whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
