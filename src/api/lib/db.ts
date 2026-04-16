import { Kysely, sql } from 'kysely'
import { NeonDialect } from 'kysely-neon'
import { neon } from '@neondatabase/serverless'
import type { Database } from './db-types'

// Use @neondatabase/serverless: Web-Crypto based, edge-runtime compatible.
// Required for Cloudflare Pages deployment via @cloudflare/next-on-pages.
export const db = new Kysely<Database>({
  dialect: new NeonDialect({
    neon: neon(process.env.DATABASE_URL!),
  }),
})

export { sql }

export async function checkDbHealth(): Promise<boolean> {
  try {
    await db.selectFrom('opportunities').select('id').limit(1).execute()
    return true
  } catch {
    return false
  }
}
