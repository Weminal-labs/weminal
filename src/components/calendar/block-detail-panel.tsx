'use client'

import { useState } from 'react'
import type { CalendarBlock } from '@/hooks/use-calendar'
import { useUpdateBlock, useDeleteBlock, useOpportunityMilestones, useProposal, useUpsertProposal } from '@/hooks/use-calendar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TypeBadge } from '@/components/table/type-badge'
import type { OpportunityType } from '@/lib/types'
import { cn } from '@/lib/utils'
import { X, Trash2, Clock, Flag, Check } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

type Props = {
  block: CalendarBlock
  onClose: () => void
}

const blockStatuses = ['planned', 'in_progress', 'done', 'skipped'] as const
const slotOptions = ['AM', 'PM', 'ALL_DAY'] as const

export function BlockDetailPanel({ block, onClose }: Props) {
  const [title, setTitle] = useState(block.title)
  const [date, setDate] = useState(block.date)
  const [slot, setSlot] = useState(block.slot)
  const [hours, setHours] = useState(String(block.hours))
  const [notes, setNotes] = useState(block.notes ?? '')
  const [status, setStatus] = useState(block.status)

  const updateBlock = useUpdateBlock()
  const deleteBlock = useDeleteBlock()

  const oppId = block.opportunity_id
  const { data: milestonesData } = useOpportunityMilestones(oppId ?? '')
  const { data: proposalData } = useProposal(oppId ?? '')
  const upsertProposal = useUpsertProposal()

  const oppType = block.opportunities?.type as OpportunityType | undefined
  const milestones = milestonesData?.data ?? []
  const proposal = proposalData?.data

  async function handleSave() {
    try {
      await updateBlock.mutateAsync({
        id: block.id,
        title,
        date,
        slot: slot as 'AM' | 'PM' | 'ALL_DAY',
        hours: Number(hours),
        notes: notes || null,
        status,
      })
      toast.success('Block updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update')
    }
  }

  async function handleDelete() {
    try {
      await deleteBlock.mutateAsync(block.id)
      toast.success('Block deleted')
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  return (
    <div className="w-80 shrink-0 border-l border-gray-200 bg-white overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10">
        <h2 className="text-sm font-bold text-gray-900 text-balance">Block Details</h2>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close detail panel">
          <X className="size-4" aria-hidden="true" />
        </Button>
      </div>

      <div className="p-4 space-y-4">
        {/* Type badge */}
        {oppType && (
          <div className="flex items-center gap-2">
            <TypeBadge type={oppType} />
            {block.opportunities?.organization && (
              <span className="text-xs text-gray-500">{block.opportunities.organization}</span>
            )}
          </div>
        )}

        {/* Title */}
        <div>
          <label htmlFor="block-title" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Title</label>
          <Input id="block-title" value={title} onChange={e => setTitle(e.target.value)} autoComplete="off" />
        </div>

        {/* Date */}
        <div>
          <label htmlFor="block-date" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Date</label>
          <Input id="block-date" type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>

        {/* Slot + Hours */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="block-slot" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Slot</label>
            <select
              id="block-slot"
              value={slot}
              onChange={e => setSlot(e.target.value as typeof slot)}
              className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
            >
              {slotOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="block-hours" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Hours</label>
            <Input id="block-hours" type="number" min="0.5" max="12" step="0.5" value={hours} onChange={e => setHours(e.target.value)} />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Status</label>
          <div className="flex gap-1">
            {blockStatuses.map(s => (
              <button
                key={s}
                type="button"
                aria-pressed={status === s}
                onClick={() => setStatus(s)}
                className={cn(
                  'rounded-full px-2.5 py-1 text-[10px] font-medium capitalize transition-colors focus-visible:ring-2 focus-visible:ring-gray-400',
                  status === s
                    ? s === 'done' ? 'bg-emerald-100 text-emerald-700'
                    : s === 'in_progress' ? 'bg-blue-100 text-blue-700'
                    : s === 'skipped' ? 'bg-gray-200 text-gray-500'
                    : 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                )}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="block-notes" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Notes</label>
          <textarea
            id="block-notes"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            placeholder="Add notes, learnings, results…"
            className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
          />
        </div>

        {/* Save + Delete */}
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave} disabled={updateBlock.isPending} className="flex-1">
            {updateBlock.isPending ? 'Saving…' : 'Save'}
          </Button>
          <Button variant="destructive" size="icon" onClick={handleDelete} disabled={deleteBlock.isPending} aria-label="Delete block">
            <Trash2 className="size-4" aria-hidden="true" />
          </Button>
        </div>

        {/* Milestones */}
        {oppId && milestones.length > 0 && (
          <div className="pt-3 border-t border-gray-200">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Milestones</h3>
            <div className="space-y-1.5">
              {milestones.map(m => (
                <div key={m.id} className="flex items-center gap-2 text-xs">
                  <div className={cn(
                    'size-2 rounded-full shrink-0',
                    m.completed ? 'bg-emerald-500' :
                    m.type === 'deadline' ? 'bg-red-500' :
                    m.type === 'office_hour' ? 'bg-teal-500' :
                    'bg-gray-400'
                  )} />
                  <span className={cn('truncate', m.completed && 'line-through text-gray-400')}>{m.title}</span>
                  <span className="text-gray-400 tabular-nums shrink-0 ml-auto">{format(new Date(m.date), 'MMM d')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Proposal */}
        {oppId && (
          <div className="pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Proposal</h3>
              {proposal && (
                <span className={cn(
                  'text-[10px] font-medium rounded-full px-2 py-0.5',
                  proposal.status === 'draft' ? 'bg-gray-100 text-gray-600' :
                  proposal.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                  proposal.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                  'bg-red-100 text-red-700'
                )}>
                  {proposal.status}
                </span>
              )}
            </div>
            {proposal?.content ? (
              <p className="text-xs text-gray-600 line-clamp-3 text-pretty">{proposal.content}</p>
            ) : (
              <p className="text-xs text-gray-400 text-pretty">No proposal yet</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
