import { Hono } from 'hono'
import { supabase } from '../lib/supabase'

const stats = new Hono()

// GET /api/v1/stats/updates-per-day?days=30&from=2024-01-01&to=2024-01-31
stats.get('/updates-per-day', async (c) => {
  const fromParam = c.req.query('from')
  const toParam = c.req.query('to')
  const days = Math.min(Number(c.req.query('days') ?? 30), 365)

  const since = fromParam ? new Date(fromParam) : new Date()
  if (!fromParam) since.setDate(since.getDate() - days)
  const until = toParam ? new Date(toParam) : new Date()

  const { data: opps, error: queryErr } = await supabase
    .from('opportunities')
    .select('created_at, updated_at')
    .gte('updated_at', since.toISOString())
    .lte('updated_at', until.toISOString())
    .order('updated_at', { ascending: true })

  if (queryErr) {
    return c.json({ error: queryErr.message }, 500)
  }

  const createdMap: Record<string, number> = {}
  const updatedMap: Record<string, number> = {}

  for (const opp of opps ?? []) {
    const createdDay = opp.created_at?.slice(0, 10)
    const updatedDay = opp.updated_at?.slice(0, 10)

    if (createdDay && createdDay >= since.toISOString().slice(0, 10)) {
      createdMap[createdDay] = (createdMap[createdDay] ?? 0) + 1
    }
    if (updatedDay) {
      updatedMap[updatedDay] = (updatedMap[updatedDay] ?? 0) + 1
    }
  }

  const result: { date: string; created: number; updated: number }[] = []
  const cursor = new Date(since)
  const end = new Date(until)
  end.setHours(23, 59, 59, 999)

  while (cursor <= end) {
    const day = cursor.toISOString().slice(0, 10)
    result.push({
      date: day,
      created: createdMap[day] ?? 0,
      updated: updatedMap[day] ?? 0,
    })
    cursor.setDate(cursor.getDate() + 1)
  }

  return c.json({ data: result })
})

// GET /api/v1/stats/overview — all dashboard data in one call
stats.get('/overview', async (c) => {
  const { data: opps, error } = await supabase
    .from('opportunities')
    .select('type, status, organization, reward_amount, reward_currency, reward_token, blockchains, start_date, end_date, created_at')

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  const all = opps ?? []

  // 1. By type with reward totals
  const byType: Record<string, { count: number; totalReward: number }> = {}
  for (const o of all) {
    const t = o.type ?? 'unknown'
    if (!byType[t]) byType[t] = { count: 0, totalReward: 0 }
    byType[t].count++
    if (o.reward_amount) byType[t].totalReward += Number(o.reward_amount)
  }

  // 2. By status (pipeline funnel)
  const statusOrder = ['discovered', 'evaluating', 'applying', 'accepted', 'in_progress', 'submitted', 'completed', 'rejected', 'cancelled']
  const byStatus: Record<string, number> = {}
  for (const o of all) {
    const s = o.status ?? 'unknown'
    byStatus[s] = (byStatus[s] ?? 0) + 1
  }

  // 3. Top blockchains
  const byChain: Record<string, number> = {}
  for (const o of all) {
    for (const c of o.blockchains ?? []) {
      byChain[c] = (byChain[c] ?? 0) + 1
    }
  }

  // 4. Top organizations
  const byOrg: Record<string, number> = {}
  for (const o of all) {
    const org = o.organization
    if (org) byOrg[org] = (byOrg[org] ?? 0) + 1
  }

  // 5. Upcoming deadlines (end_date in the future)
  const today = new Date().toISOString().slice(0, 10)
  const upcoming = all
    .filter((o) => o.end_date && o.end_date >= today)
    .sort((a, b) => (a.end_date! > b.end_date! ? 1 : -1))
    .slice(0, 10)
    .map((o) => ({ end_date: o.end_date, type: o.type, status: o.status }))

  // 6. Reward distribution by type (for bar chart)
  const rewardByType = Object.entries(byType)
    .map(([type, { count, totalReward }]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count,
      totalReward,
      avgReward: count > 0 ? Math.round(totalReward / count) : 0,
    }))
    .sort((a, b) => b.totalReward - a.totalReward)

  // 7. Pipeline funnel data
  const funnel = statusOrder
    .filter((s) => byStatus[s])
    .map((s) => ({
      label: s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' '),
      value: byStatus[s],
    }))

  // 8. Chain bar chart
  const chainBars = Object.entries(byChain)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([chain, count]) => ({ chain, count }))

  // 9. Org bar chart
  const orgBars = Object.entries(byOrg)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([org, count]) => ({ org, count }))

  return c.json({
    data: {
      total: all.length,
      totalReward: all.reduce((s, o) => s + (Number(o.reward_amount) || 0), 0),
      rewardByType,
      funnel,
      chainBars,
      orgBars,
      upcoming,
    },
  })
})

export default stats
