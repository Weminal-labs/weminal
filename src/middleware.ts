import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

// Edge runtime — required by Cloudflare Pages (next-on-pages)
export const runtime = 'experimental-edge'

// Simple i18n middleware - English default, no auto-detection
// Users can manually switch via /vi or /zh
export default createMiddleware(routing)

export const config = {
  // Exclude API routes, static assets, and Next internals from i18n routing.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
