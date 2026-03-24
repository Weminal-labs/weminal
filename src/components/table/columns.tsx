'use client'

import { createColumnHelper } from '@tanstack/react-table'
import type { Opportunity } from '@/lib/types'
import { TypeBadge } from './type-badge'
import { StatusBadge } from './status-badge'
import { Badge } from '@/components/ui/badge'
import { ExternalLink } from 'lucide-react'
import type { OpportunityType } from '@/lib/types'

const col = createColumnHelper<Opportunity>()

export const columns = [
  col.accessor('name', {
    header: 'Name',
    cell: (info) => (
      <span className="font-medium text-gray-900">{info.getValue()}</span>
    ),
  }),
  col.accessor('type', {
    header: 'Type',
    cell: (info) => <TypeBadge type={info.getValue() as OpportunityType} />,
  }),
  col.accessor('status', {
    header: 'Status',
    cell: (info) => <StatusBadge status={info.getValue()} />,
  }),
  col.accessor('organization', {
    header: 'Organization',
    cell: (info) => info.getValue() ?? <span className="text-gray-400">—</span>,
  }),
  col.accessor('reward_amount', {
    header: 'Reward',
    cell: (info) => {
      const amount = info.getValue()
      if (!amount) return <span className="text-gray-400">—</span>
      const currency = info.row.original.reward_currency ?? 'USD'
      const token = info.row.original.reward_token
      return (
        <span className="tabular-nums">
          {currency === 'USD' ? '$' : ''}{Number(amount).toLocaleString()}
          {token ? <span className="ml-1 text-gray-500 text-xs">{token}</span> : null}
        </span>
      )
    },
  }),
  col.accessor('blockchains', {
    header: 'Chains',
    cell: (info) => {
      const chains = info.getValue()
      if (!chains?.length) return <span className="text-gray-400">—</span>
      return (
        <div className="flex flex-wrap gap-1">
          {chains.slice(0, 3).map((c) => (
            <Badge key={c} className="bg-gray-100 text-gray-700 text-xs">{c}</Badge>
          ))}
          {chains.length > 3 && (
            <Badge className="bg-gray-100 text-gray-500 text-xs">+{chains.length - 3}</Badge>
          )}
        </div>
      )
    },
  }),
  col.accessor('start_date', {
    header: 'Start',
    cell: (info) => {
      const val = info.getValue()
      return val ? <span className="text-sm tabular-nums">{val}</span> : <span className="text-gray-400">—</span>
    },
  }),
  col.accessor('end_date', {
    header: 'End',
    cell: (info) => {
      const val = info.getValue()
      return val ? <span className="text-sm tabular-nums">{val}</span> : <span className="text-gray-400">—</span>
    },
  }),
  col.accessor('website_url', {
    header: 'Link',
    cell: (info) => {
      const url = info.getValue()
      if (!url) return <span className="text-gray-400">—</span>
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800" aria-label="Visit website">
          <ExternalLink className="size-4" aria-hidden="true" />
        </a>
      )
    },
  }),
]
