// Edge runtime required by @cloudflare/next-on-pages. Compatible because
// Better Auth now runs on @neondatabase/serverless (Web Crypto, not node:crypto).
export const runtime = 'edge'

import { auth } from '@/lib/auth'
import { toNextJsHandler } from 'better-auth/next-js'

export const { GET, POST } = toNextJsHandler(auth)
