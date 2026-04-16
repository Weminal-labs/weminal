import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { routing } from './i18n/routing'

// Edge runtime — required by Cloudflare Pages (next-on-pages)
export const runtime = 'experimental-edge'

const intlMiddleware = createMiddleware(routing)

// Country → locale mapping using Cloudflare's cf-ipcountry edge header.
// Fires only on first visit (no NEXT_LOCALE cookie, no locale in URL).
const COUNTRY_LOCALE: Record<string, 'vi' | 'zh'> = {
  VN: 'vi',
  CN: 'zh',
  HK: 'zh',
  TW: 'zh',
  MO: 'zh',
  SG: 'zh',
}

function detectFromAcceptLanguage(header: string | null): 'vi' | 'zh' | null {
  if (!header) return null
  const first = header.split(',')[0]?.toLowerCase().trim() ?? ''
  if (first.startsWith('vi')) return 'vi'
  if (first.startsWith('zh')) return 'zh'
  return null
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only consider auto-redirect when the visitor has no locale cue at all —
  // no cookie AND no locale prefix in URL. The root '/' with no signals.
  const hasLocalePrefix = routing.locales
    .filter((l) => l !== routing.defaultLocale)
    .some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))
  const hasCookie = request.cookies.has('NEXT_LOCALE')

  if (!hasLocalePrefix && !hasCookie) {
    const country = request.headers.get('cf-ipcountry')?.toUpperCase() ?? ''
    const fromCountry = COUNTRY_LOCALE[country]
    const fromAccept = detectFromAcceptLanguage(request.headers.get('accept-language'))
    const target = fromCountry ?? fromAccept

    if (target && target !== routing.defaultLocale) {
      const url = request.nextUrl.clone()
      url.pathname = `/${target}${pathname === '/' ? '' : pathname}`
      const res = NextResponse.redirect(url)
      // Remember the pick so we don't re-redirect on every request
      res.cookies.set('NEXT_LOCALE', target, { path: '/', maxAge: 60 * 60 * 24 * 365 })
      return res
    }
  }

  return intlMiddleware(request)
}

export const config = {
  // Exclude API routes, static assets, and Next internals from i18n routing.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
