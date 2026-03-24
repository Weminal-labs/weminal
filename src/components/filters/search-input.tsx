'use client'

import { useState, useEffect } from 'react'
import { useDebounce } from '@/hooks/use-debounce'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

type Props = {
  value: string
  onChange: (value: string) => void
}

export function SearchInput({ value, onChange }: Props) {
  const [local, setLocal] = useState(value)
  const debounced = useDebounce(local, 300)

  useEffect(() => {
    if (debounced !== value) {
      onChange(debounced)
    }
  }, [debounced, value, onChange])

  useEffect(() => {
    setLocal(value)
  }, [value])

  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" aria-hidden="true" />
      <Input
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder="Search..."
        className="h-8 w-48 pl-8 text-xs"
      />
    </div>
  )
}
