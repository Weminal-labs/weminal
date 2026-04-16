// Node runtime: Better Auth's postgres driver needs node:crypto, which isn't
// available on Edge. Cloudflare Pages deployment uses @cloudflare/next-on-pages
// which handles this via the nodejs_compat flag.
export const runtime = 'nodejs'

import { auth } from '@/lib/auth'
import { toNextJsHandler } from 'better-auth/next-js'

export const { GET, POST } = toNextJsHandler(auth)
