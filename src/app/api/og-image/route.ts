import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  if (!url) {
    return Response.json({ error: 'url param required' }, { status: 400 })
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
