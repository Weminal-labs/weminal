import { useQuery } from '@tanstack/react-query'

export type DailyStat = {
  date: string
  created: number
  updated: number
}

export type OverviewData = {
  total: number
  totalReward: number
  rewardByType: { type: string; count: number; totalReward: number; avgReward: number }[]
  funnel: { label: string; value: number }[]
  chainBars: { chain: string; count: number }[]
  orgBars: { org: string; count: number }[]
  upcoming: { end_date: string; type: string; status: string }[]
}

async function fetchUpdatesPerDay(days: number, from?: string, to?: string): Promise<DailyStat[]> {
  const params = new URLSearchParams({ days: String(days) })
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  const res = await fetch(`/api/v1/stats/updates-per-day?${params}`)
  if (!res.ok) throw new Error('Failed to fetch stats')
  const json = await res.json()
  return json.data
}

async function fetchOverview(): Promise<OverviewData> {
  const res = await fetch('/api/v1/stats/overview')
  if (!res.ok) throw new Error('Failed to fetch overview')
  const json = await res.json()
  return json.data
}

export function useUpdatesPerDay(days = 30, from?: string, to?: string) {
  return useQuery({
    queryKey: ['stats', 'updates-per-day', days, from, to],
    queryFn: () => fetchUpdatesPerDay(days, from, to),
    staleTime: 60_000,
  })
}

export function useOverview() {
  return useQuery({
    queryKey: ['stats', 'overview'],
    queryFn: fetchOverview,
    staleTime: 60_000,
  })
}
