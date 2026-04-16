import { createMiddleware } from 'hono/factory'
import { db } from '@/api/lib/db'
import { validateApiKey } from '@/api/lib/api-key'
import { auth } from '@/lib/auth'

// Extend Hono's variable map for type safety across all routes
declare module 'hono' {
  interface ContextVariableMap {
    userId: string
    userRole: 'admin' | 'member' | 'readonly'
  }
}

async function resolveRole(userId: string): Promise<'admin' | 'member' | 'readonly'> {
  const row = await db
    .selectFrom('user_roles')
    .select('role')
    .where('user_id', '=', userId)
    .executeTakeFirst()
  return (row?.role as 'admin' | 'member' | undefined) ?? 'readonly'
}

export const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header('authorization')

  // Path 1: API key via Bearer header
  if (authHeader?.startsWith('Bearer ')) {
    const raw = authHeader.slice(7)
    const key = await validateApiKey(raw)

    if (!key) {
      return c.json({ error: 'Invalid or revoked API key' }, 401)
    }

    const role = await resolveRole(key.userId)
    c.set('userId', key.userId)
    c.set('userRole', role)

    // Update last_used_at at most once per minute (fire and forget)
    const lastUsed = key.lastUsedAt ? new Date(key.lastUsedAt).getTime() : 0
    if (Date.now() - lastUsed > 60_000) {
      void db
        .updateTable('api_keys')
        .set({ last_used_at: new Date().toISOString() })
        .where('id', '=', key.id)
        .execute()
    }

    return next()
  }

  // Path 2: Session cookie via Better Auth
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (session?.user?.id) {
    const role = await resolveRole(session.user.id)
    c.set('userId', session.user.id)
    c.set('userRole', role)
    return next()
  }

  return c.json({ error: 'Authentication required' }, 401)
})
