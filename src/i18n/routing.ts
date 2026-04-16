import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'vi', 'zh'],
  defaultLocale: 'en',
  // EN at pathless root (/), VI at /vi/..., ZH at /zh/...
  localePrefix: 'as-needed',
})

export type Locale = (typeof routing.locales)[number]
