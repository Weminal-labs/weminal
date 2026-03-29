import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { WeeklySnapshot } from '@/lib/types'

async function fetchWeeklyReview(weekStart: string): Promise<WeeklySnapshot | null> {
  const res = await fetch(`/api/v1/weekly-reviews/${weekStart}`)
  if (!res.ok) throw new Error('Failed to fetch weekly review')
  const json = await res.json()
  return json.data
}

async function generateWeeklyReview(weekStart: string): Promise<WeeklySnapshot> {
  const res = await fetch('/api/v1/weekly-reviews/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ week_start: weekStart }),
  })
  if (!res.ok) throw new Error('Failed to generate weekly review')
  const json = await res.json()
  return json.data
}

export function useWeeklyReview(weekStart: string) {
  return useQuery({
    queryKey: ['weekly-review', weekStart],
    queryFn: () => fetchWeeklyReview(weekStart),
    staleTime: 60_000,
  })
}

export function useGenerateWeeklyReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: generateWeeklyReview,
    onSuccess: (_, weekStart) => {
      queryClient.invalidateQueries({ queryKey: ['weekly-review', weekStart] })
    },
  })
}
