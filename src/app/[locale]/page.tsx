'use client'

import Link from 'next/link'
import { ArrowRight, ChevronDown } from 'lucide-react'
import dynamic from 'next/dynamic'
import { ParticleLogo } from '@/components/particle-logo'
import StaggeredMenu from '@/components/staggered-menu/StaggeredMenu'
import { useSession } from '@/lib/auth-client'
import {
  PillarCard,
  OpportunitiesGlyph,
  IdeasGlyph,
  ReviewGlyph,
} from '@/components/home/pillar-card'
import { McpDemo } from '@/components/home/mcp-demo'

const PixelBlast = dynamic(() => import('@/components/pixel-blast'), { ssr: false })

export default function Home() {
  const { data: session, isPending } = useSession()

  const items = [
    { label: 'Opportunities', ariaLabel: 'Go to opportunities', link: '/hack' },
    { label: 'Ideas', ariaLabel: 'Explore ideas', link: '/ideas' },
    { label: 'Review', ariaLabel: 'Weekly review', link: '/review' },
    ...(!isPending
      ? [session
          ? { label: 'Profile', ariaLabel: 'Your profile', link: '/profile' }
          : { label: 'Login', ariaLabel: 'Sign in', link: '/login' }]
      : []),
  ]

  return (
    <>
      <StaggeredMenu
        isFixed
        position="right"
        logoUrl="/logo.svg"
        colors={['#B19EEF', '#5227FF']}
        accentColor="#370edd"
        menuButtonColor="#111111"
        openMenuButtonColor="#111111"
        changeMenuColorOnOpen
        displayItemNumbering
        displaySocials={false}
        items={items}
      />

      <main className="relative">
        {/* ── Act 1: Hero — ParticleLogo with PixelBlast background ───── */}
        <section className="relative min-h-dvh flex flex-col items-center justify-center overflow-hidden bg-white">
          {/* PixelBlast shader — purple dot-matrix pattern behind the logo */}
          <div className="absolute inset-0 z-0">
            <PixelBlast
              variant="square"
              pixelSize={3}
              color="#3c00ff"
              patternScale={2}
              patternDensity={1}
              enableRipples
              rippleSpeed={0.3}
              rippleThickness={0.1}
              rippleIntensityScale={1}
              speed={0.5}
              transparent
              edgeFade={0.5}
            />
          </div>

          {/* ParticleLogo — Weminal Labs dither/particle animation (hero-frame.svg) */}
          <div
            className="relative z-10 mx-auto overflow-hidden"
            style={{ width: 'min(92vw, 1100px)', aspectRatio: '966 / 490' }}
          >
            <ParticleLogo src="/hero-frame.svg" className="w-full" />
          </div>

          <div className="hero-ctas relative z-10 flex flex-wrap items-center justify-center gap-3 mt-6">
            <Link
              href="/hack"
              className="group inline-flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-800 transition-[transform,background-color] duration-200 ease-out active:scale-[0.97] shadow-lg shadow-gray-900/10"
            >
              Explore Opportunities
              <ArrowRight className="size-4 transition-transform duration-200 ease-out group-hover:translate-x-1" />
            </Link>
            {!isPending && !session && (
              <Link
                href="/login"
                className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
              >
                Sign in with GitHub
              </Link>
            )}
          </div>

          {/* Scroll cue */}
          <div className="hero-scroll-cue absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-gray-400">
            <ChevronDown className="size-5" aria-hidden="true" />
          </div>
        </section>

        {/* ── Act 2: Pillars ──────────────────────────────────────────── */}
        <section className="relative mx-auto w-full max-w-6xl px-6 py-28 md:py-36 bg-zinc-950">
          <div className="mb-14 max-w-2xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/40">Three surfaces. One pipeline.</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
              Find the work. Capture the spark. Reflect on the week.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <PillarCard
              index={0}
              glyph={<OpportunitiesGlyph />}
              title="Opportunities"
              description="A Notion-like table of every hackathon, grant, fellowship, bounty, and bootcamp worth your time. Filter by chain, status, deadline. Never miss a deadline again."
              href="/hack"
              cta="Open the table"
            />
            <PillarCard
              index={1}
              glyph={<IdeasGlyph />}
              title="Ideas"
              description="A public pool of product ideas you could build into any of those opportunities. Upvote, comment, submit yours — or let a bot drop one from Telegram."
              href="/ideas"
              cta="Browse ideas"
            />
            <PillarCard
              index={2}
              glyph={<ReviewGlyph />}
              title="Weekly Review"
              description="An auto-generated snapshot of the week — new opportunities, upcoming deadlines, completed applications, and what you should ship next."
              href="/review"
              cta="See this week"
            />
          </div>
        </section>

        {/* ── Act 3: MCP ──────────────────────────────────────────────── */}
        <section className="relative mx-auto w-full max-w-6xl px-6 py-28 md:py-36 bg-zinc-950">
          <div className="mb-14 max-w-2xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/40">
              Also accessible by Claude
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
              Let your agent add opportunities while you sleep.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/55 sm:text-base">
              Every write action in Weminal is exposed as an MCP tool. Generate a personal API key on your
              profile, drop it into your Claude config, and treat your agent as a full-access collaborator.
            </p>
          </div>

          <McpDemo />

          <div className="mt-14 flex flex-wrap items-center gap-3">
            <Link
              href="/hack"
              className="group inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-zinc-900 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Start tracking
              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/profile"
              className="inline-flex items-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-white/80 transition-colors hover:border-white/30 hover:text-white"
            >
              Generate an API key
            </Link>
          </div>
        </section>

        <footer className="bg-zinc-950 border-t border-white/5 py-10 text-center text-[11px] text-white/30">
          Weminal · a pipeline for crypto builders
        </footer>

        {/* ── Animations ───────────────────────────────────────────────── */}
        <style>{`
          .hero-ctas {
            opacity: 0;
            transform: translateY(10px);
            animation: hero-rise 0.8s ease-out 2.5s forwards;
          }
          .hero-scroll-cue {
            opacity: 0;
            animation: hero-fade 0.8s ease-out 3s forwards, hero-bounce 2s ease-in-out 3.5s infinite;
          }
          @keyframes hero-fade {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes hero-rise {
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes hero-bounce {
            0%, 100% { transform: translate(-50%, 0); }
            50% { transform: translate(-50%, 6px); }
          }
          @media (prefers-reduced-motion: reduce) {
            .hero-ctas, .hero-scroll-cue {
              opacity: 1 !important;
              transform: none !important;
              animation: none !important;
            }
          }
        `}</style>
      </main>
    </>
  )
}
