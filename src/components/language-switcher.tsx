'use client'

import { useLocale } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { routing, type Locale } from '@/i18n/routing'
import { Globe } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  vi: 'Tiếng Việt',
  zh: '中文',
}

const LOCALE_FLAGS: Record<Locale, string> = {
  en: '🇺🇸',
  vi: '🇻🇳',
  zh: '🇨🇳',
}

type Props = {
  variant?: 'dropdown' | 'inline'
  className?: string
}

export function LanguageSwitcher({ variant = 'dropdown', className = '' }: Props) {
  const locale = useLocale() as Locale
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {routing.locales.map((l) => (
          <Link
            key={l}
            href={pathname}
            locale={l}
            className={`px-2 py-1 text-sm rounded transition-colors ${
              l === locale
                ? 'bg-purple-500/20 text-purple-300'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            {LOCALE_FLAGS[l]}
          </Link>
        ))}
      </div>
    )
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors text-sm"
        aria-label="Switch language"
      >
        <Globe className="size-4" />
        <span>{LOCALE_FLAGS[locale]}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 py-1 min-w-[140px] rounded-lg bg-gray-900 border border-white/10 shadow-xl z-50">
          {routing.locales.map((l) => (
            <Link
              key={l}
              href={pathname}
              locale={l}
              onClick={() => setOpen(false)}
              className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors ${
                l === locale
                  ? 'bg-purple-500/20 text-purple-300'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span>{LOCALE_FLAGS[l]}</span>
              <span>{LOCALE_LABELS[l]}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
