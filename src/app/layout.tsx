import type { Metadata, Viewport } from 'next'
import { Providers } from '@/components/providers'
import './globals.css'

export const viewport: Viewport = {
  themeColor: '#f9fafb',
  colorScheme: 'light',
}

export const metadata: Metadata = {
  title: {
    default: 'Crypto Opportunities Database',
    template: '%s | Crypto Opportunities',
  },
  description: 'Track hackathons, grants, fellowships, and bounties in the crypto ecosystem. Manage your opportunity pipeline with a Notion-like table interface.',
  openGraph: {
    title: 'Crypto Opportunities Database',
    description: 'Track hackathons, grants, fellowships, and bounties in the crypto ecosystem.',
    type: 'website',
    siteName: 'Crypto Opportunities Database',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Crypto Opportunities Database',
    description: 'Track hackathons, grants, fellowships, and bounties in the crypto ecosystem.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-white" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
