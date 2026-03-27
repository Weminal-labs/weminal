'use client'

import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { typeColors } from '@/lib/type-colors'
import type { OpportunityType } from '@/lib/types'
import { useCreateOpportunity, useOpportunities } from '@/hooks/use-opportunities'
import { toast } from 'sonner'
import { Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const types: OpportunityType[] = ['hackathon', 'grant', 'fellowship', 'bounty', 'bootcamp']
const statuses = ['discovered', 'evaluating', 'applying', 'accepted', 'in_progress', 'submitted', 'completed', 'rejected', 'cancelled']

export function CreateOpportunityDialog() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    name: '',
    type: '' as string,
    description: '',
    status: 'discovered',
    organization: '',
    website_url: '',
    start_date: '',
    end_date: '',
    reward_amount: '',
    reward_currency: 'USD',
    blockchains: '',
    tags: '',
    format: 'online',
    location: '',
    parent_hackathon_id: '',
  })

  const mutation = useCreateOpportunity()
  const { data: hackathonData } = useOpportunities({ type: 'hackathon', per_page: 200 })

  function reset() {
    setForm({ name: '', type: '', description: '', status: 'discovered', organization: '', website_url: '', start_date: '', end_date: '', reward_amount: '', reward_currency: 'USD', blockchains: '', tags: '', format: 'online', location: '', parent_hackathon_id: '' })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.type) {
      toast.error('Name and type are required')
      return
    }

    const input: Record<string, unknown> = {
      name: form.name,
      type: form.type,
      status: form.status,
    }
    if (form.description) input.description = form.description
    if (form.organization) input.organization = form.organization
    if (form.website_url) input.website_url = form.website_url
    if (form.start_date) input.start_date = form.start_date
    if (form.end_date) input.end_date = form.end_date
    if (form.reward_amount) input.reward_amount = Number(form.reward_amount)
    if (form.reward_currency) input.reward_currency = form.reward_currency
    if (form.blockchains) input.blockchains = form.blockchains.split(',').map(s => s.trim()).filter(Boolean)
    if (form.tags) input.tags = form.tags.split(',').map(s => s.trim()).filter(Boolean)
    if (form.format) input.format = form.format
    if (form.location) input.location = form.location
    if (form.type === 'bootcamp' && form.parent_hackathon_id) input.parent_hackathon_id = form.parent_hackathon_id

    try {
      await mutation.mutateAsync(input)
      toast.success(`Created ${form.type}: "${form.name}"`)
      reset()
      setOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create opportunity')
    }
  }

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }))

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button size="sm"><Plus className="size-4 mr-1" aria-hidden="true" /> New</Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl max-h-[85vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-semibold">New Opportunity</Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-gray-400 hover:text-gray-600" aria-label="Close dialog"><X className="size-5" aria-hidden="true" /></button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <fieldset>
              <legend className="block text-sm font-medium text-gray-700 mb-1">Type *</legend>
              <div className="flex gap-2" role="group" aria-label="Opportunity type">
                {types.map(t => {
                  const colors = typeColors[t]
                  return (
                    <button
                      key={t}
                      type="button"
                      aria-pressed={form.type === t}
                      onClick={() => setForm(prev => ({ ...prev, type: t }))}
                      className={cn(
                        'rounded-full px-3 py-1.5 text-sm font-medium capitalize transition-colors focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-1',
                        form.type === t
                          ? `${colors.bg} ${colors.text} ring-2 ring-offset-1 ring-gray-400`
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      )}
                    >
                      {t}
                    </button>
                  )
                })}
              </div>
            </fieldset>

            {form.type === 'bootcamp' && (
              <div>
                <label htmlFor="opp-parent" className="block text-sm font-medium text-gray-700 mb-1">Parent Hackathon</label>
                <select
                  id="opp-parent"
                  value={form.parent_hackathon_id}
                  onChange={set('parent_hackathon_id')}
                  className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
                >
                  <option value="">None (standalone bootcamp)</option>
                  {(hackathonData?.data ?? []).map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label htmlFor="opp-name" className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <Input id="opp-name" value={form.name} onChange={set('name')} placeholder="e.g. ETHGlobal Bangkok" autoComplete="off" />
            </div>

            <div>
              <label htmlFor="opp-desc" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea id="opp-desc" value={form.description} onChange={set('description')} rows={2} className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="opp-org" className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                <Input id="opp-org" value={form.organization} onChange={set('organization')} placeholder="e.g. ETHGlobal" autoComplete="off" />
              </div>
              <div>
                <label htmlFor="opp-status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select id="opp-status" value={form.status} onChange={set('status')} className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400">
                  {statuses.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="opp-format" className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                <select id="opp-format" value={form.format} onChange={set('format')} className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400">
                  <option value="online">Online</option>
                  <option value="in_person">In Person</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <label htmlFor="opp-location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <Input id="opp-location" value={form.location} onChange={set('location')} placeholder="e.g. Prague, Czech Republic" autoComplete="off" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="opp-start" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <Input id="opp-start" type="date" value={form.start_date} onChange={set('start_date')} />
              </div>
              <div>
                <label htmlFor="opp-end" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <Input id="opp-end" type="date" value={form.end_date} onChange={set('end_date')} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="opp-reward" className="block text-sm font-medium text-gray-700 mb-1">Reward Amount</label>
                <Input id="opp-reward" type="number" value={form.reward_amount} onChange={set('reward_amount')} placeholder="10000" />
              </div>
              <div>
                <label htmlFor="opp-url" className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                <Input id="opp-url" type="url" value={form.website_url} onChange={set('website_url')} placeholder="https://…" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="opp-chains" className="block text-sm font-medium text-gray-700 mb-1">Blockchains</label>
                <Input id="opp-chains" value={form.blockchains} onChange={set('blockchains')} placeholder="Ethereum, Polygon" autoComplete="off" />
              </div>
              <div>
                <label htmlFor="opp-tags" className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <Input id="opp-tags" value={form.tags} onChange={set('tags')} placeholder="defi, nft" autoComplete="off" />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
