#!/usr/bin/env node
// Pull every row from Supabase REST API → wipe matching tables on Neon → insert.
// Preserves UUIDs, timestamps, and FK integrity by deleting in reverse topological order.
import postgres from 'postgres'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const NEON_URL = process.env.DATABASE_URL
if (!SUPABASE_URL || !SUPABASE_KEY || !NEON_URL) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / DATABASE_URL')
  process.exit(1)
}

async function fetchAll(table) {
  const out = []
  const pageSize = 1000
  for (let offset = 0; ; offset += pageSize) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/${table}?select=*&limit=${pageSize}&offset=${offset}&order=created_at.asc`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    )
    if (!res.ok) throw new Error(`${table}: ${res.status} ${await res.text()}`)
    const rows = await res.json()
    out.push(...rows)
    if (rows.length < pageSize) break
  }
  return out
}

// Reverse topological order for wipe (children first)
const WIPE_ORDER = ['calendar_blocks', 'proposals', 'milestones', 'opportunities', 'ideas', 'weekly_snapshots']
// Insert order (parents first)
const INSERT_ORDER = ['opportunities', 'ideas', 'milestones', 'proposals', 'calendar_blocks', 'weekly_snapshots']

const sql = postgres(NEON_URL, { prepare: false, max: 1 })

try {
  // 1. Fetch everything from Supabase in parallel
  console.log('→ fetching from Supabase...')
  const data = {}
  for (const table of INSERT_ORDER) {
    try {
      data[table] = await fetchAll(table)
      console.log(`  ${table}: ${data[table].length} rows`)
    } catch (e) {
      console.log(`  ${table}: skipped (${e.message.slice(0, 80)})`)
      data[table] = []
    }
  }

  // 2. Wipe Neon tables in reverse order
  console.log('\n→ wiping Neon tables...')
  for (const table of WIPE_ORDER) {
    await sql.unsafe(`DELETE FROM ${table}`)
    console.log(`  ${table}: cleared`)
  }

  // 3. Insert into Neon in forward order
  console.log('\n→ inserting into Neon...')
  for (const table of INSERT_ORDER) {
    const rows = data[table]
    if (rows.length === 0) continue
    // Drop any columns Neon doesn't have (esp. "fts" which is GENERATED)
    const cols = await sql`
      SELECT column_name, is_generated
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = ${table}
    `
    const writable = new Set(cols.filter((c) => c.is_generated !== 'ALWAYS').map((c) => c.column_name))
    const cleaned = rows.map((r) => {
      const out = {}
      for (const k of Object.keys(r)) if (writable.has(k)) out[k] = r[k]
      return out
    })
    // Chunk inserts to stay under parameter limit
    const CHUNK = 100
    let done = 0
    for (let i = 0; i < cleaned.length; i += CHUNK) {
      const batch = cleaned.slice(i, i + CHUNK)
      await sql`INSERT INTO ${sql(table)} ${sql(batch)}`
      done += batch.length
    }
    console.log(`  ${table}: inserted ${done}`)
  }

  // 4. Verify counts
  console.log('\n→ final counts on Neon:')
  for (const table of INSERT_ORDER) {
    const [{ c }] = await sql.unsafe(`SELECT COUNT(*)::int AS c FROM ${table}`)
    console.log(`  ${table}: ${c}`)
  }
} finally {
  await sql.end()
}
