'use client'

import { Badge } from '@/components/ui/badge'
import { typeColors } from '@/lib/type-colors'
import type { OpportunityType } from '@/lib/types'

export function TypeBadge({ type }: { type: OpportunityType }) {
  const colors = typeColors[type]
  return (
    <Badge className={`${colors.bg} ${colors.text} capitalize`}>
      {type}
    </Badge>
  )
}
