export const runtime = 'edge'

import app from '@/api'

export const GET = app.fetch.bind(app)
export const POST = app.fetch.bind(app)
export const PUT = app.fetch.bind(app)
export const PATCH = app.fetch.bind(app)
export const DELETE = app.fetch.bind(app)
export const OPTIONS = app.fetch.bind(app)
