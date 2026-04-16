import type { Viewport, Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Providers } from '@/components/providers'
import { routing } from '@/i18n/routing'
import '../globals.css'

export const viewport: Viewport = {
  themeColor: '#f9fafb',
  colorScheme: 'light',
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

// Per-locale metadata (title/description/OG) driven by translation catalogs.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  const siteUrl =
    process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'https://weminal.dev'

  // hreflang alternates — every locale gets a canonical URL
  const languages: Record<string, string> = {}
  for (const l of routing.locales) {
    languages[l] = l === routing.defaultLocale ? siteUrl : `${siteUrl}/${l}`
  }
  languages['x-default'] = siteUrl

  const canonical = locale === routing.defaultLocale ? siteUrl : `${siteUrl}/${locale}`

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${t('siteName')} — ${t('tagline')}`,
      template: `%s | ${t('siteName')}`,
    },
    description: t('description'),
    alternates: { canonical, languages },
    openGraph: {
      title: `${t('siteName')} — ${t('tagline')}`,
      description: t('description'),
      type: 'website',
      siteName: t('siteName'),
      locale: locale === 'zh' ? 'zh_CN' : locale === 'vi' ? 'vi_VN' : 'en_US',
      url: canonical,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${t('siteName')} — ${t('tagline')}`,
      description: t('description'),
    },
    robots: { index: true, follow: true },
  }
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  // Required for static rendering with next-intl
  setRequestLocale(locale)

  return (
    <html lang={locale}>
      <body className="antialiased bg-white" suppressHydrationWarning>
        <NextIntlClientProvider>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
        {/* Cloudflare Web Analytics — cookieless, privacy-friendly */}
        {process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN && (
          <script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={`{"token":"${process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN}"}`}
          />
        )}
      </body>
    </html>
  )
}
