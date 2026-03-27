'use client'

import { typeColors } from '@/lib/type-colors'
import type { OpportunityType } from '@/lib/types'
import { cn } from '@/lib/utils'

const types: OpportunityType[] = ['hackathon', 'grant', 'fellowship', 'bounty', 'bootcamp']

type Props = {
  value?: string
  onChange: (value: string | undefined) => void
}

export function TypeFilter({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-1">
      {types.map((t) => {
        const colors = typeColors[t]
        const active = value === t
        return (
          <button
            key={t}
            onClick={() => onChange(active ? undefined : t)}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium capitalize transition-all',
              active
                ? `${colors.bg} ${colors.text} ring-2 ring-offset-1 ring-gray-300`
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {t}
          </button>
        )
      })}
    </div>
  )
}
