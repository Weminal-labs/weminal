'use client'

import { useState, useEffect } from 'react'
import { useUpsertProposal, type Proposal } from '@/hooks/use-calendar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { FileText, ExternalLink, Save } from 'lucide-react'

type Props = {
  opportunityId: string
  proposal: Proposal | null | undefined
}

const proposalStatuses = ['draft', 'submitted', 'accepted', 'rejected'] as const

export function ProposalEditor({ opportunityId, proposal }: Props) {
  const [editing, setEditing] = useState(false)
  const [content, setContent] = useState(proposal?.content ?? '')
  const [proposalStatus, setProposalStatus] = useState<string>(proposal?.status ?? 'draft')
  const [submissionUrl, setSubmissionUrl] = useState(proposal?.submission_url ?? '')
  const upsertProposal = useUpsertProposal()

  useEffect(() => {
    setContent(proposal?.content ?? '')
    setProposalStatus(proposal?.status ?? 'draft')
    setSubmissionUrl(proposal?.submission_url ?? '')
  }, [proposal])

  async function handleSave() {
    try {
      await upsertProposal.mutateAsync({
        opportunityId,
        content: content || undefined,
        status: proposalStatus as Proposal['status'],
        submission_url: submissionUrl || undefined,
      })
      toast.success('Proposal saved')
      setEditing(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save proposal')
    }
  }

  return (
    <div className="pt-3 border-t border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <FileText className="size-3.5 text-gray-400" aria-hidden="true" />
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Proposal</h3>
        </div>
        {!editing ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-[10px] font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
          >
            {proposal ? 'Edit' : 'Create'}
          </button>
        ) : (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="text-[10px] font-medium text-gray-400 hover:text-gray-600"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <div className="space-y-3">
          {/* Status selector */}
          <div>
            <label htmlFor="proposal-status" className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Status</label>
            <div className="flex gap-1">
              {proposalStatuses.map(s => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={proposalStatus === s}
                  onClick={() => setProposalStatus(s)}
                  className={cn(
                    'rounded-full px-2.5 py-0.5 text-[10px] font-medium capitalize transition-colors focus-visible:ring-2 focus-visible:ring-gray-400',
                    proposalStatus === s
                      ? s === 'draft' ? 'bg-gray-900 text-white'
                      : s === 'submitted' ? 'bg-blue-600 text-white'
                      : s === 'accepted' ? 'bg-emerald-600 text-white'
                      : 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Content editor */}
          <div>
            <label htmlFor="proposal-content" className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Content (Markdown)</label>
            <textarea
              id="proposal-content"
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={8}
              placeholder="Write your proposal in markdown…&#10;&#10;# Project Title&#10;&#10;## What We Built&#10;- Feature 1&#10;- Feature 2&#10;&#10;## Impact&#10;..."
              className="flex w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-mono shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:bg-white resize-y"
            />
          </div>

          {/* Submission URL */}
          <div>
            <label htmlFor="proposal-url" className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Submission URL</label>
            <Input
              id="proposal-url"
              type="url"
              value={submissionUrl}
              onChange={e => setSubmissionUrl(e.target.value)}
              placeholder="https://…"
              className="text-xs"
              autoComplete="off"
            />
          </div>

          {/* Save button */}
          <Button size="sm" onClick={handleSave} disabled={upsertProposal.isPending} className="w-full">
            <Save className="size-3.5 mr-1" aria-hidden="true" />
            {upsertProposal.isPending ? 'Saving…' : 'Save Proposal'}
          </Button>
        </div>
      ) : (
        /* Read-only view */
        <div className="space-y-2">
          {/* Status badge */}
          <span className={cn(
            'inline-flex text-[10px] font-semibold rounded-full px-2 py-0.5',
            (proposal?.status ?? 'draft') === 'draft' ? 'bg-gray-100 text-gray-600' :
            proposal?.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
            proposal?.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
            proposal?.status === 'rejected' ? 'bg-red-100 text-red-700' :
            'bg-gray-100 text-gray-600'
          )}>
            {proposal?.status ?? 'draft'}
          </span>

          {/* Content preview */}
          {proposal?.content ? (
            <div className="text-xs text-gray-600 whitespace-pre-wrap line-clamp-6 text-pretty bg-gray-50 rounded-md p-2 border border-gray-100">
              {proposal.content}
            </div>
          ) : (
            <p className="text-xs text-gray-400 text-pretty py-2">No proposal content yet. Click &quot;Create&quot; to start writing.</p>
          )}

          {/* Submission link */}
          {proposal?.submission_url && (
            <a
              href={proposal.submission_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-700 font-medium"
            >
              View submission <ExternalLink className="size-2.5" aria-hidden="true" />
            </a>
          )}
        </div>
      )}
    </div>
  )
}
