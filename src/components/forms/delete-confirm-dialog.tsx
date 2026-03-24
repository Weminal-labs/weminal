'use client'

import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { Button } from '@/components/ui/button'
import { useDeleteOpportunity } from '@/hooks/use-opportunities'
import { toast } from 'sonner'
import type { Opportunity } from '@/lib/types'

type Props = {
  opportunity: Opportunity | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteConfirmDialog({ opportunity, open, onOpenChange }: Props) {
  const mutation = useDeleteOpportunity()

  async function handleDelete() {
    if (!opportunity) return
    try {
      await mutation.mutateAsync(opportunity.id)
      toast.success(`Deleted ${opportunity.type}: "${opportunity.name}"`)
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl">
          <AlertDialog.Title className="text-lg font-semibold">Delete Opportunity</AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-gray-600">
            Are you sure you want to delete <strong>{opportunity?.name}</strong> ({opportunity?.type})?
            This action cannot be undone.
          </AlertDialog.Description>
          <div className="mt-4 flex justify-end gap-2">
            <AlertDialog.Cancel asChild>
              <Button variant="outline">Cancel</Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button variant="destructive" onClick={handleDelete} disabled={mutation.isPending}>
                {mutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
