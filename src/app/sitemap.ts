import type { MetadataRoute } from 'next'
import { routing } from '@/i18n/routing'

// Public routes that should be indexed, one entry per locale with hreflang alternates.
const PUBLIC_PATHS = ['', 'hack', 'ideas', 'review', 'login'] as const

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl =
    process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'https://weminal.dev'

  function urlFor(locale: string, path: string) {
    const seg = path ? `/${path}` : ''
    return locale === routing.defaultLocale ? `${siteUrl}${seg}` : `${siteUrl}/${locale}${seg}`
  }

  return PUBLIC_PATHS.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: urlFor(locale, path),
      lastModified: new Date(),
      changeFrequency: path === '' ? ('daily' as const) : ('weekly' as const),
      priority: path === '' ? 1 : 0.8,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [l, urlFor(l, path)])
        ),
      },
    }))
  )
}
