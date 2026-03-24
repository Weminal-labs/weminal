import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { rateLimiter } from './middleware/rate-limiter'
import { requestLogger } from './middleware/logger'
import { handleError } from './middleware/error-handler'
import { securityHeaders } from './middleware/security-headers'
import { checkDbHealth } from './lib/supabase'
import opportunities from './routes/opportunities'
import meta from './routes/meta'

const app = new Hono().basePath('/api/v1')

// Middleware
app.use('*', rateLimiter)
app.use('*', securityHeaders)
app.use('*', requestLogger)
app.use(
  '*',
  cors({
    origin: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:3000'],
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
  })
)

// Routes
app.route('/opportunities', opportunities)
app.route('/meta', meta)

// Health check
app.get('/health', async (c) => {
  const dbHealthy = await checkDbHealth()
  const status = dbHealthy ? 'ok' : 'degraded'
  const statusCode = dbHealthy ? 200 : 503

  return c.json(
    {
      status,
      db: dbHealthy ? 'connected' : 'unreachable',
      timestamp: new Date().toISOString(),
    },
    statusCode
  )
})

// Global error handler
app.onError(handleError)

export default app
