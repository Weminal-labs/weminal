import { db } from './db'

export async function hashApiKey(raw: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw))
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export type ValidatedApiKey = {
  id: string
  userId: string
  lastUsedAt: string | null
}

export async function validateApiKey(rawKey: string): Promise<ValidatedApiKey | null> {
  const hash = await hashApiKey(rawKey)

  const row = await db
    .selectFrom('api_keys')
    .select(['id', 'user_id', 'revoked_at', 'last_used_at'])
    .where('key_hash', '=', hash)
    .executeTakeFirst()

  if (!row || row.revoked_at !== null) return null

  return {
    id: row.id,
    userId: row.user_id,
    lastUsedAt: (row.last_used_at as string | null) ?? null,
  }
}
