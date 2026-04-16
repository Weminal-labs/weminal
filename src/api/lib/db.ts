import { Kysely, sql } from 'kysely'
import { PostgresJSDialect } from 'kysely-postgres-js'
import postgres from 'postgres'
import type { Database } from './db-types'

const client = postgres(process.env.DATABASE_URL!, { prepare: false })

export const db = new Kysely<Database>({
  dialect: new PostgresJSDialect({ postgres: client }),
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
