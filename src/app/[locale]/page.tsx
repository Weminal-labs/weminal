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
        {/* ── Hero — ParticleLogo with PixelBlast background ───────────── */}
        <section className="relative min-h-dvh flex flex-col items-center justify-center overflow-hidden bg-white">
          {/* PixelBlast shader — purple dot-matrix pattern */}
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

          {/* ParticleLogo — Weminal Labs dither/particle animation */}
          <div
            className="relative z-10 mx-auto overflow-hidden"
            style={{ width: 'min(92vw, 1100px)', aspectRatio: '966 / 490' }}
          >
            <ParticleLogo src="/hero-frame.svg" className="w-full" />
          </div>

          <div className="hero-ctas relative z-10 flex flex-wrap items-center justify-center gap-3 mt-6">
            <Link
              href="/hack"
              className="group inline-flex items-center gap-2 rounded-xl bg-[#5227FF] px-6 py-3 text-sm font-medium text-white hover:bg-[#370edd] transition-all duration-200 ease-out active:scale-[0.97] shadow-lg shadow-purple-500/20"
            >
              Explore Opportunities
              <ArrowRight className="size-4 transition-transform duration-200 ease-out group-hover:translate-x-1" />
            </Link>
            {!isPending && !session && (
              <Link
                href="/login"
                className="inline-flex items-center rounded-xl border border-purple-200/30 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-purple-300/50 hover:bg-purple-50/30"
              >
                Sign in with GitHub
              </Link>
            )}
          </div>

          {/* Scroll cue */}
          <div className="hero-scroll-cue absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-gray-400">
            <ChevronDown className="size-5" aria-hidden="true" />
          </div>

          {/* Bottom gradient fade into transition zone */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[200px] z-[5] pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, transparent 0%, rgba(248, 247, 255, 0.3) 40%, rgba(248, 247, 255, 0.7) 70%, #f8f7ff 100%)'
            }}
          />
        </section>

        {/* ── Transition Zone — Bridge between hero and features ────────── */}
        <section
          className="relative h-[150px] md:h-[250px] overflow-hidden"
          style={{
            background: 'linear-gradient(to bottom, #f8f7ff 0%, #e8e4f8 20%, #2d2440 60%, #0f0d17 100%)'
          }}
        >
          {/* Faded dither pattern echo */}
          <div className="absolute inset-0 opacity-10">
            <PixelBlast
              variant="square"
              pixelSize={8}
              color="#5227FF"
              patternScale={1}
              patternDensity={0.5}
              enableRipples={false}
              speed={0.2}
              transparent
              edgeFade={0.8}
            />
          </div>

          {/* Narrative text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <p
              className="text-sm font-medium uppercase tracking-[0.2em] transition-colors"
              style={{
                background: 'linear-gradient(to bottom, #5227FF 0%, rgba(255,255,255,0.4) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Built for crypto builders who ship.
            </p>
          </div>
        </section>

        {/* ── Features Section ─────────────────────────────────────────── */}
        <section
          className="relative mx-auto w-full px-6 py-20 md:py-28"
          style={{ backgroundColor: 'var(--wm-bg-features)' }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="mb-14 max-w-2xl">
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-purple-400/60">
                Three surfaces. One pipeline.
              </p>
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
          </div>
        </section>

        {/* ── MCP/Agent Section ────────────────────────────────────────── */}
        <section
          className="relative mx-auto w-full px-6 py-20 md:py-28"
          style={{
            backgroundColor: 'var(--wm-bg-mcp)',
            borderTop: '1px solid transparent',
            borderImage: 'linear-gradient(to right, transparent 0%, rgba(82, 39, 255, 0.2) 20%, rgba(82, 39, 255, 0.3) 50%, rgba(82, 39, 255, 0.2) 80%, transparent 100%) 1'
          }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="mb-14 max-w-2xl">
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-purple-500/50">
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
                className="inline-flex items-center rounded-xl border border-purple-500/30 bg-transparent px-5 py-3 text-sm font-medium text-purple-400 transition-colors hover:border-purple-400/50 hover:text-purple-300"
              >
                Generate an API key
              </Link>
            </div>
          </div>
        </section>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <footer
          className="py-10 text-center"
          style={{
            backgroundColor: 'var(--wm-bg-footer)',
            borderTop: '1px solid transparent',
            borderImage: 'linear-gradient(to right, transparent 0%, rgba(82, 39, 255, 0.15) 20%, rgba(82, 39, 255, 0.2) 50%, rgba(82, 39, 255, 0.15) 80%, transparent 100%) 1'
          }}
        >
          <p className="text-purple-400/40 text-xs font-medium">Weminal</p>
          <p className="text-white/25 text-[11px] mt-1">a pipeline for crypto builders</p>
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
