export const runtime = 'edge'

import { NextRequest } from 'next/server'

function isSafeUrl(raw: string): boolean {
  try {
    const u = new URL(raw)
    if (u.protocol !== 'https:') return false
    const host = u.hostname
    // Block localhost and private/loopback ranges
    if (host === 'localhost' || host === '127.0.0.1' || host === '::1') return false
    if (/^10\./.test(host)) return false
    if (/^172\.(1[6-9]|2\d|3[01])\./.test(host)) return false
    if (/^192\.168\./.test(host)) return false
    if (/^169\.254\./.test(host)) return false
    return true
  } catch {
    return false
  }
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  if (!url) {
    return Response.json({ error: 'url param required' }, { status: 400 })
  }

  if (!isSafeUrl(url)) {
    return Response.json({ error: 'invalid url' }, { status: 400 })
  }

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WeminalBot/1.0)' },
      signal: AbortSignal.timeout(5000),
    })

    if (!res.ok) {
      return Response.json({ og_image: null })
    }

    const html = await res.text()

    // Extract og:image from HTML
    const ogMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
      ?? html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i)

    const ogImage = ogMatch?.[1] ?? null

    return Response.json(
      { og_image: ogImage },
      { headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=86400' } }
    )
  } catch {
    return Response.json({ og_image: null })
  }
}
