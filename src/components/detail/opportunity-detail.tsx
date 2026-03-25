'use client'

import type { Opportunity, OpportunityType } from '@/lib/types'
import { TypeBadge } from '@/components/table/type-badge'
import { StatusBadge } from '@/components/table/status-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink, X, Trash2 } from 'lucide-react'

type Props = {
  opportunity: Opportunity
  onClose: () => void
  onDelete: (opp: Opportunity) => void
}

export function OpportunityDetail({ opportunity: opp, onClose, onDelete }: Props) {
  return (
    <>
      {/* Backdrop (mobile only) */}
      <div
        className="fixed inset-0 z-30 bg-black/40 md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />
    <div className="fixed inset-x-0 bottom-0 z-40 max-h-[90dvh] overflow-y-auto rounded-t-2xl bg-white shadow-xl md:inset-y-0 md:inset-x-auto md:right-0 md:w-full md:max-w-md md:max-h-none md:rounded-none md:border-l md:border-gray-200">
      {/* Drag handle — mobile only */}
      <div className="flex justify-center pt-2.5 pb-0 md:hidden" aria-hidden="true">
        <div className="h-1 w-10 rounded-full bg-gray-300" />
      </div>
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TypeBadge type={opp.type as OpportunityType} />
          <StatusBadge status={opp.status} />
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => onDelete(opp)} className="text-red-500 hover:text-red-700" aria-label="Delete opportunity">
            <Trash2 className="size-4" aria-hidden="true" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close detail panel">
            <X className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <h2 className="text-xl font-semibold text-balance">{opp.name}</h2>

        {opp.organization && (
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider">Organization</label>
            <p className="text-sm">{opp.organization}</p>
          </div>
        )}

        {opp.description && (
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider">Description</label>
            <p className="text-sm text-gray-700 whitespace-pre-wrap text-pretty">{opp.description}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {opp.start_date && (
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider">Start Date</label>
              <p className="text-sm">{opp.start_date}</p>
            </div>
          )}
          {opp.end_date && (
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider">End Date</label>
              <p className="text-sm">{opp.end_date}</p>
            </div>
          )}
        </div>

        {opp.reward_amount && (
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider">Reward</label>
            <p className="text-sm font-medium">
              {opp.reward_currency === 'USD' ? '$' : ''}{Number(opp.reward_amount).toLocaleString()} {opp.reward_currency}
              {opp.reward_token ? ` (${opp.reward_token})` : ''}
            </p>
          </div>
        )}

        {opp.blockchains?.length > 0 && (
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider">Blockchains</label>
            <div className="flex flex-wrap gap-1 mt-1">
              {opp.blockchains.map(c => <Badge key={c} className="bg-gray-100 text-gray-700">{c}</Badge>)}
            </div>
          </div>
        )}

        {opp.tags?.length > 0 && (
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider">Tags</label>
            <div className="flex flex-wrap gap-1 mt-1">
              {opp.tags.map(t => <Badge key={t} className="bg-gray-100 text-gray-700">{t}</Badge>)}
            </div>
          </div>
        )}

        {opp.links && opp.links.length > 0 && (
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider">Links</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {opp.links.map((link, i) => (
                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs text-blue-700 hover:bg-blue-100">
                  {link.label} <ExternalLink className="size-3" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        )}

        {opp.notes && (
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider">Notes</label>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{opp.notes}</p>
          </div>
        )}

        {opp.website_url && (
          <a href={opp.website_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
            Visit Website <ExternalLink className="size-3" aria-hidden="true" />
          </a>
        )}

        <div className="pt-4 border-t text-xs text-gray-400">
          <p>Created: {new Date(opp.created_at).toLocaleString()}</p>
          <p>Updated: {new Date(opp.updated_at).toLocaleString()}</p>
          <p className="mt-1 font-mono">{opp.id}</p>
        </div>
      </div>
    </div>
    </>
  )
}
