#!/usr/bin/env node
// One-shot: apply all supabase/migrations/*.sql to the DATABASE_URL in order.
import { readFile, readdir } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import postgres from 'postgres'

const __dirname = dirname(fileURLToPath(import.meta.url))
const migrationsDir = resolve(__dirname, '..', 'supabase', 'migrations')

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL not set')
  process.exit(1)
}

// SQL splitter that respects: $$ dollar-quoted bodies, '…' strings,
// "…" idents, -- line comments, /* … */ block comments.
function splitSQL(src) {
  const out = []
  let buf = ''
  let i = 0
  while (i < src.length) {
    const c = src[i]
    const n = src[i + 1]
    // -- line comment (preserve in output so line numbers stay sane)
    if (c === '-' && n === '-') {
      const nl = src.indexOf('\n', i)
      const end = nl === -1 ? src.length : nl
      buf += src.slice(i, end)
      i = end
      continue
    }
    // /* block comment */
    if (c === '/' && n === '*') {
      const close = src.indexOf('*/', i + 2)
      const end = close === -1 ? src.length : close + 2
      buf += src.slice(i, end)
      i = end
      continue
    }
    // $$ dollar-quoted string (tagged or untagged)
    if (c === '$') {
      const m = src.slice(i).match(/^\$([A-Za-z0-9_]*)\$/)
      if (m) {
        const tag = m[0]
        const closeIdx = src.indexOf(tag, i + tag.length)
        const end = closeIdx === -1 ? src.length : closeIdx + tag.length
        buf += src.slice(i, end)
        i = end
        continue
      }
    }
    // 'single-quoted string' — handle doubled '' escapes
    if (c === "'") {
      buf += c
      i += 1
      while (i < src.length) {
        if (src[i] === "'" && src[i + 1] === "'") { buf += "''"; i += 2; continue }
        buf += src[i]
        if (src[i] === "'") { i += 1; break }
        i += 1
      }
      continue
    }
    // "double-quoted identifier"
    if (c === '"') {
      buf += c
      i += 1
      while (i < src.length && src[i] !== '"') { buf += src[i]; i += 1 }
      if (i < src.length) { buf += '"'; i += 1 }
      continue
    }
    if (c === ';') {
      out.push(buf)
      buf = ''
      i += 1
      continue
    }
    buf += c
    i += 1
  }
  if (buf.trim()) out.push(buf)
  return out
}

const sql = postgres(url, { prepare: false, max: 1 })

try {
  const files = (await readdir(migrationsDir))
    .filter((f) => f.endsWith('.sql'))
    .sort()

  for (const f of files) {
    const path = resolve(migrationsDir, f)
    const body = await readFile(path, 'utf8')
    process.stdout.write(`· ${f} ... `)
    try {
      // Split on ';' while respecting $$-quoted function bodies.
      // Each statement runs in its own implicit transaction, which is required for
      // ALTER TYPE ADD VALUE (new enum values can't be used in the same tx that adds them).
      const statements = splitSQL(body)
      for (const stmt of statements) {
        if (stmt.trim()) await sql.unsafe(stmt)
      }
      console.log(`ok (${statements.length} stmt)`)
    } catch (e) {
      console.log('FAIL')
      console.error(`  ${e.message}`)
      process.exit(1)
    }
  }

  const tables = await sql`SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename`
  console.log(`\nDone. ${tables.length} tables in public: ${tables.map((t) => t.tablename).join(', ')}`)
} finally {
  await sql.end()
}
