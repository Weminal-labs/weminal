import type { MiddlewareHandler } from 'hono'
import { formatError } from './error-handler'

const WINDOW_MS = 60_000 // 1 minute
const MAX_REQUESTS = 100

const clients = new Map<string, { count: number; resetAt: number }>()

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [ip, entry] of clients) {
    if (now > entry.resetAt) {
      clients.delete(ip)
    }
  }
}, WINDOW_MS)

function getClientIp(req: Request): string {
  // Vercel / proxied environments
  const forwarded =
    req.headers.get('x-forwarded-for') ??
    req.headers.get('x-real-ip') ??
    'unknown'
  return forwarded.split(',')[0].trim()
}

export const rateLimiter: MiddlewareHandler = async (c, next) => {
  const ip = getClientIp(c.req.raw)
  const now = Date.now()

  let entry = clients.get(ip)

  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + WINDOW_MS }
    clients.set(ip, entry)
  }

  entry.count++

  if (entry.count > MAX_REQUESTS) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
    c.header('Retry-After', String(retryAfter))
    return c.json(
      formatError('RATE_LIMITED', 'Too many requests. Please try again later.'),
      429
    )
  }

  await next()
}
