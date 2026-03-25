'use client'

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type SortingState,
} from '@tanstack/react-table'
import { columns } from './columns'
import type { Opportunity } from '@/lib/types'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  data: Opportunity[]
  sorting: SortingState
  onSortingChange: (sorting: SortingState) => void
  onRowClick?: (opportunity: Opportunity) => void
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
    <div className="overflow-x-auto rounded-lg border border-gray-200">
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
  )
}
