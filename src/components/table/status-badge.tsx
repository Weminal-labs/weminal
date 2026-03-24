'use client'

import { Badge } from '@/components/ui/badge'
import { statusColors } from '@/lib/type-colors'

export function StatusBadge({ status }: { status: string }) {
  const color = statusColors[status] ?? 'bg-gray-100 text-gray-700'
  return (
    <Badge className={`${color} capitalize`}>
      {status.replace('_', ' ')}
    </Badge>
  )
}
