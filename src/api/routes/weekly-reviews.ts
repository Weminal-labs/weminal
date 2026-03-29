import { Hono } from 'hono'
import { supabase } from '../lib/supabase'
import { generateWeekSchema } from '../schemas/weekly-review'

const weeklyReviews = new Hono()

// GET /api/v1/weekly-reviews — list all snapshots
weeklyReviews.get('/', async (c) => {
  const { data, error } = await supabase
    .from('weekly_snapshots')
    .select('id, week_start, week_end, created_at')
    .order('week_start', { ascending: false })
    .limit(52)

  if (error) return c.json({ error: error.message }, 500)
  return c.json({ data })
})

// GET /api/v1/weekly-reviews/:week_start — get a specific week
weeklyReviews.get('/:week_start', async (c) => {
  const weekStart = c.req.param('week_start')

  const { data, error } = await supabase
    .from('weekly_snapshots')
    .select('*')
    .eq('week_start', weekStart)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return c.json({ data: null })
    return c.json({ error: error.message }, 500)
  }

  return c.json({ data })
})

// POST /api/v1/weekly-reviews/generate — compute & upsert a snapshot
weeklyReviews.post('/generate', async (c) => {
  const body = await c.req.json()
  const parsed = generateWeekSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: 'Invalid week_start format (YYYY-MM-DD)' }, 400)
  }

  const { week_start } = parsed.data
  const weekStartDate = new Date(week_start + 'T00:00:00Z')
  const weekEndDate = new Date(weekStartDate)
  weekEndDate.setDate(weekEndDate.getDate() + 6)
  const weekEnd = weekEndDate.toISOString().slice(0, 10)

  // Fetch all opportunities
  const { data: allOpps, error: fetchErr } = await supabase
    .from('opportunities')
    .select('*')

  if (fetchErr) return c.json({ error: fetchErr.message }, 500)

  const opps = allOpps ?? []

  // 1. New hacks — created this week
  const newHacks = opps.filter((o) => {
    const created = o.created_at?.slice(0, 10)
    return created && created >= week_start && created <= weekEnd
  })

  // 2. Best grant — highest reward among grants (overall, not just this week)
  const grants = opps.filter((o) => o.type === 'grant' && o.reward_amount)
  const bestGrant = grants.length > 0
    ? grants.reduce((best, o) => (Number(o.reward_amount) > Number(best.reward_amount) ? o : best))
    : null

  // 3. Upcoming deadlines — end_date within this week
  const upcomingDeadlines = opps
    .filter((o) => o.end_date && o.end_date >= week_start && o.end_date <= weekEnd)
    .sort((a, b) => (a.end_date! > b.end_date! ? 1 : -1))

  // 4. Completed this week
  const completedDeadlines = opps.filter((o) => {
    if (o.status !== 'completed') return false
    const updated = o.updated_at?.slice(0, 10)
    return updated && updated >= week_start && updated <= weekEnd
  })

  // 5. Missing deadlines — hackathons without end_date
  const missingDeadlines = opps.filter((o) => o.type === 'hackathon' && !o.end_date)

  // 6. Stats
  const statusOrder = ['discovered', 'evaluating', 'applying', 'accepted', 'in_progress', 'submitted', 'completed', 'rejected', 'cancelled']
  const byStatus: Record<string, number> = {}
  const byType: Record<string, { count: number; totalReward: number }> = {}

  for (const o of opps) {
    const s = o.status ?? 'unknown'
    byStatus[s] = (byStatus[s] ?? 0) + 1

    const t = o.type ?? 'unknown'
    if (!byType[t]) byType[t] = { count: 0, totalReward: 0 }
    byType[t].count++
    if (o.reward_amount) byType[t].totalReward += Number(o.reward_amount)
  }

  const funnel = statusOrder
    .filter((s) => byStatus[s])
    .map((s) => ({
      label: s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' '),
      value: byStatus[s],
    }))

  const rewardByType = Object.entries(byType)
    .map(([type, { count, totalReward }]) => ({ type, count, totalReward }))
    .sort((a, b) => b.totalReward - a.totalReward)

  // Activity per day (within the week)
  const activityPerDay: { date: string; created: number; updated: number }[] = []
  const cursor = new Date(weekStartDate)
  for (let i = 0; i < 7; i++) {
    const day = cursor.toISOString().slice(0, 10)
    activityPerDay.push({
      date: day,
      created: opps.filter((o) => o.created_at?.slice(0, 10) === day).length,
      updated: opps.filter((o) => o.updated_at?.slice(0, 10) === day).length,
    })
    cursor.setDate(cursor.getDate() + 1)
  }

  // Top hacks — highest reward this week (for card stack)
  const topHacks = [...opps]
    .filter((o) => o.reward_amount)
    .sort((a, b) => Number(b.reward_amount) - Number(a.reward_amount))
    .slice(0, 4)

  const snapshot = {
    weekStart: week_start,
    weekEnd: weekEnd,
    newHacks,
    bestGrant,
    topHacks,
    upcomingDeadlines,
    completedDeadlines,
    missingDeadlines,
    stats: {
      totalNew: newHacks.length,
      totalOpportunities: opps.length,
      totalReward: opps.reduce((s, o) => s + (Number(o.reward_amount) || 0), 0),
      byType: rewardByType,
      activityPerDay,
      funnel,
    },
  }

  // Upsert
  const { data, error } = await supabase
    .from('weekly_snapshots')
    .upsert(
      { week_start, week_end: weekEnd, snapshot },
      { onConflict: 'week_start' }
    )
    .select()
    .single()

  if (error) return c.json({ error: error.message }, 500)
  return c.json({ data })
})

export default weeklyReviews
