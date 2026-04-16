'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { useRevealOnScroll } from '@/hooks/use-reveal-on-scroll'

type Props = {
  glyph: ReactNode
  title: string
  description: string
  href: string
  cta: string
  index?: number
}

export function PillarCard({ glyph, title, description, href, cta, index = 0 }: Props) {
  const { ref, revealed } = useRevealOnScroll<HTMLDivElement>({ threshold: 0.3 })
  const delay = `${index * 120}ms`

  return (
    <div
      ref={ref}
      data-revealed={revealed}
      className="group relative flex flex-col gap-5 rounded-2xl border border-purple-500/15 p-7 transition-all duration-500 ease-out hover:border-purple-500/35 hover:-translate-y-0.5 data-[revealed=false]:opacity-0 data-[revealed=false]:translate-y-6 data-[revealed=true]:opacity-100 data-[revealed=true]:translate-y-0"
      style={{
        background: 'linear-gradient(135deg, rgba(82, 39, 255, 0.08) 0%, rgba(177, 158, 239, 0.04) 100%)',
        backdropFilter: 'blur(12px)',
      }}
      style={{ transitionDelay: delay }}
    >
      <div className="text-purple-400/70 group-hover:text-purple-300 transition-colors">
        {glyph}
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-xl font-semibold text-white tracking-tight">{title}</h3>
        <p className="text-sm leading-relaxed text-white/55">{description}</p>
      </div>

      <Link
        href={href}
        className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
      >
        {cta}
        <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
      </Link>
    </div>
  )
}

/**
 * A small SVG glyph whose stroked paths draw themselves in when the parent
 * card enters the viewport. Accepts any inline <path>/<circle>/<line> children.
 * Wraps them in a shared `draw-in` animation via stroke-dashoffset.
 */
export function PillarGlyph({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className="size-10 text-current pillar-glyph"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
      <style>{`
        .pillar-glyph :is(path, circle, line, rect, polyline) {
          stroke-dasharray: 140;
          stroke-dashoffset: 140;
        }
        [data-revealed='true'] .pillar-glyph :is(path, circle, line, rect, polyline) {
          animation: pg-draw 1.2s cubic-bezier(0.65, 0, 0.35, 1) forwards;
        }
        [data-revealed='true'] .pillar-glyph :is(path, circle, line, rect, polyline):nth-child(2) { animation-delay: 0.08s; }
        [data-revealed='true'] .pillar-glyph :is(path, circle, line, rect, polyline):nth-child(3) { animation-delay: 0.16s; }
        [data-revealed='true'] .pillar-glyph :is(path, circle, line, rect, polyline):nth-child(4) { animation-delay: 0.24s; }
        [data-revealed='true'] .pillar-glyph :is(path, circle, line, rect, polyline):nth-child(5) { animation-delay: 0.32s; }
        @keyframes pg-draw {
          to { stroke-dashoffset: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .pillar-glyph :is(path, circle, line, rect, polyline) {
            stroke-dashoffset: 0 !important;
            animation: none !important;
          }
        }
      `}</style>
    </svg>
  )
}

// ── Three inline glyphs ─────────────────────────────────────────────────────

export function OpportunitiesGlyph() {
  return (
    <PillarGlyph>
      {/* Radar / grid of targets — "discover" motif */}
      <circle cx="24" cy="24" r="18" />
      <circle cx="24" cy="24" r="11" />
      <circle cx="24" cy="24" r="4" />
      <path d="M24 6 L24 10 M24 38 L24 42 M6 24 L10 24 M38 24 L42 24" />
    </PillarGlyph>
  )
}

export function IdeasGlyph() {
  return (
    <PillarGlyph>
      {/* Lightbulb — "spark / idea" motif */}
      <path d="M18 29 a8 8 0 1 1 12 0 c-1 1 -2 2 -2 4 v2 h-8 v-2 c0 -2 -1 -3 -2 -4 z" />
      <line x1="20" y1="40" x2="28" y2="40" />
      <line x1="21" y1="43" x2="27" y2="43" />
      <path d="M24 5 L24 8 M10 12 L12 14 M38 12 L36 14" />
    </PillarGlyph>
  )
}

export function ReviewGlyph() {
  return (
    <PillarGlyph>
      {/* Circular arrow — "reflect / re-view" motif */}
      <path d="M38 24 a14 14 0 1 1 -4 -10" />
      <path d="M34 8 L34 14 L40 14" />
      <line x1="18" y1="22" x2="30" y2="22" />
      <line x1="18" y1="28" x2="26" y2="28" />
    </PillarGlyph>
  )
}
