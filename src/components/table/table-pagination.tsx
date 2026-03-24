'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import type { PaginationMeta } from '@/lib/types'

type Props = {
  pagination: PaginationMeta
  onPageChange: (page: number) => void
}

export function TablePagination({ pagination, onPageChange }: Props) {
  const { page, total_pages, total } = pagination

  return (
    <div className="flex items-center justify-between px-2 py-3" role="navigation" aria-label="Pagination">
      <p className="text-sm text-gray-500 tabular-nums">
        {total} {total === 1 ? 'result' : 'results'}
      </p>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => onPageChange(1)} aria-label="First page">
          <ChevronsLeft className="size-4" aria-hidden="true" />
        </Button>
        <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label="Previous page">
          <ChevronLeft className="size-4" aria-hidden="true" />
        </Button>
        <span className="px-3 text-sm text-gray-700 tabular-nums">
          {page} / {total_pages}
        </span>
        <Button variant="outline" size="icon" disabled={page >= total_pages} onClick={() => onPageChange(page + 1)} aria-label="Next page">
          <ChevronRight className="size-4" aria-hidden="true" />
        </Button>
        <Button variant="outline" size="icon" disabled={page >= total_pages} onClick={() => onPageChange(total_pages)} aria-label="Last page">
          <ChevronsRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}
