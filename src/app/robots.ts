import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl =
    process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'https://weminal.dev'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Don't index authed or API surfaces
        disallow: ['/api/', '/profile/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
