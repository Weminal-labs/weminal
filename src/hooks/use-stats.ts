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

async function fetchUpdatesPerDay(days: number): Promise<DailyStat[]> {
  const res = await fetch(`/api/v1/stats/updates-per-day?days=${days}`)
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

export function useUpdatesPerDay(days = 30) {
  return useQuery({
    queryKey: ['stats', 'updates-per-day', days],
    queryFn: () => fetchUpdatesPerDay(days),
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
