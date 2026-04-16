'use client'

import { createColumnHelper } from '@tanstack/react-table'
import type { Opportunity } from '@/lib/types'
import { TypeBadge } from './type-badge'
import { StatusBadge } from './status-badge'
import { Badge } from '@/components/ui/badge'
import { ExternalLink } from 'lucide-react'
import type { OpportunityType } from '@/lib/types'
import { sizedAvatarUrl } from '@/lib/pure-helpers'

const col = createColumnHelper<Opportunity>()

export const columns = [
  col.accessor('name', {
    header: 'Name',
    size: 280,
    cell: (info) => (
      <span className="font-medium text-gray-800 line-clamp-1">{info.getValue()}</span>
    ),
  }),
  col.accessor('type', {
    header: 'Type',
    size: 100,
    cell: (info) => <TypeBadge type={info.getValue() as OpportunityType} />,
  }),
  col.accessor('creator', {
    id: 'creator',
    header: 'By',
    size: 68,
    enableSorting: false,
    cell: (info) => {
      const creator = info.getValue()
      if (!creator) {
        return (
          <div
            className="flex items-center justify-center w-7 h-7 mx-auto rounded-full bg-gray-100 text-gray-300 text-[11px]"
            title="No creator recorded"
          >
            —
          </div>
        )
      }
      const initials = creator.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
      const sized = sizedAvatarUrl(creator.image, 28)
      return (
        <div
          className="group relative flex items-center justify-center w-7 h-7 mx-auto rounded-full transition-transform duration-150 hover:scale-110"
          title={`Added by ${creator.name}`}
        >
          {sized ? (
            <img
              src={sized}
              alt={creator.name}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-black/5 shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
              referrerPolicy="no-referrer"
              loading="lazy"
              decoding="async"
              width={28}
              height={28}
            />
          ) : (
            <span className="w-7 h-7 rounded-full bg-gradient-to-br from-[#5b21ff] to-[#3c00ff] text-white flex items-center justify-center text-[11px] font-semibold ring-1 ring-white/60">
              {initials}
            </span>
          )}
        </div>
      )
    },
  }),
  col.accessor('status', {
    header: 'Status',
    size: 110,
    cell: (info) => <StatusBadge status={info.getValue()} />,
  }),
  col.accessor('organization', {
    header: 'Organization',
    size: 150,
    cell: (info) => info.getValue() ?? <span className="text-gray-400">—</span>,
  }),
  col.accessor('parent_hackathon_name', {
    header: 'Parent Hackathon',
    size: 160,
    enableSorting: false,
    cell: (info) => {
      const name = info.getValue()
      if (!name) return <span className="text-gray-400">—</span>
      return <span className="text-gray-400 text-xs font-medium">↳ {name}</span>
    },
  }),
  col.accessor('reward_amount', {
    header: 'Reward',
    size: 120,
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
    size: 140,
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
    size: 100,
    cell: (info) => {
      const val = info.getValue()
      return val ? <span className="text-sm tabular-nums">{val}</span> : <span className="text-gray-400">—</span>
    },
  }),
  col.accessor('end_date', {
    header: 'End',
    size: 100,
    cell: (info) => {
      const val = info.getValue()
      return val ? <span className="text-sm tabular-nums">{val}</span> : <span className="text-gray-400">—</span>
    },
  }),
  col.accessor('website_url', {
    header: 'Link',
    size: 50,
    cell: (info) => {
      const url = info.getValue()
      if (!url) return <span className="text-gray-400">—</span>
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-700" aria-label="Visit website">
          <ExternalLink className="size-4" aria-hidden="true" />
        </a>
      )
    },
  }),
]
