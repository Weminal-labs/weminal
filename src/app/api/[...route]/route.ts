// Node runtime — authMiddleware imports better-auth which needs node:crypto.
// Production uses @cloudflare/next-on-pages with nodejs_compat.
export const runtime = 'nodejs'

import app from '@/api'

export const GET = app.fetch.bind(app)
export const POST = app.fetch.bind(app)
export const PUT = app.fetch.bind(app)
export const PATCH = app.fetch.bind(app)
export const DELETE = app.fetch.bind(app)
export const OPTIONS = app.fetch.bind(app)
