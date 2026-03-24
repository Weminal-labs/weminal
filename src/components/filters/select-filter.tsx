'use client'

import { cn } from '@/lib/utils'

type Props = {
  label: string
  value?: string
  options: string[]
  onChange: (value: string | undefined) => void
  formatLabel?: (value: string) => string
}

export function SelectFilter({ label, value, options, onChange, formatLabel }: Props) {
  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value || undefined)}
      className={cn(
        'h-8 rounded-md border border-gray-300 bg-white px-2 text-xs focus:outline-none focus:ring-2 focus:ring-gray-400',
        !value && 'text-gray-500'
      )}
    >
      <option value="">{label}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {formatLabel ? formatLabel(opt) : opt}
        </option>
      ))}
    </select>
  )
}
