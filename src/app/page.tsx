'use client'

import Link from 'next/link'
import { ArrowRight, ChevronDown } from 'lucide-react'
import StaggeredMenu from '@/components/staggered-menu/StaggeredMenu'
import { useSession } from '@/lib/auth-client'
import { HeroWordmark } from '@/components/home/hero-wordmark'
import {
  PillarCard,
  OpportunitiesGlyph,
  IdeasGlyph,
  ReviewGlyph,
} from '@/components/home/pillar-card'
import { McpDemo } from '@/components/home/mcp-demo'

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
        menuButtonColor="#ffffff"
        openMenuButtonColor="#ffffff"
        changeMenuColorOnOpen={false}
        displayItemNumbering
        displaySocials={false}
        items={items}
      />

      <main className="relative bg-zinc-950 text-white">
        {/* ── Act 1: Hero ─────────────────────────────────────────────── */}
        <section className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6">
          {/* Dithered Weminal Labs animation — the signature background */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover object-center z-0 pointer-events-none"
          >
            <source src="/hack-bg.webm" type="video/webm" />
          </video>
          {/* Side vignette + center darkener so the wordmark reads clearly */}
          <div
            className="pointer-events-none absolute inset-0 z-[1]"
            style={{
              background:
                'linear-gradient(to right, rgba(9,9,11,0.92) 0%, transparent 18%, transparent 82%, rgba(9,9,11,0.92) 100%)',
            }}
          />
          <div
            className="pointer-events-none absolute inset-0 z-[1]"
            style={{
              background:
                'radial-gradient(ellipse at 50% 45%, rgba(9,9,11,0.1) 0%, rgba(9,9,11,0.55) 55%, rgba(9,9,11,0.85) 100%)',
            }}
          />

          <div className="relative z-10 mx-auto flex w-full max-w-[1100px] flex-col items-center gap-10 text-center">
            <div className="w-full max-w-[900px] text-white">
              <HeroWordmark />
            </div>

            <p className="hero-tagline max-w-[32ch] text-balance text-base leading-relaxed text-white/65 sm:text-lg">
              The operating system for crypto builders.
              <br className="hidden sm:inline" />
              Track hackathons, grants, fellowships, and bounties — all in one pipeline.
            </p>

            <div className="hero-ctas flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/hack"
                className="group inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-zinc-900 shadow-[0_10px_30px_-10px_rgba(255,255,255,0.5)] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                Enter Weminal
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
              {!isPending && !session && (
                <Link
                  href="/login"
                  className="inline-flex items-center rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-medium text-white/80 backdrop-blur transition-colors hover:border-white/40 hover:bg-white/10 hover:text-white"
                >
                  Sign in with GitHub
                </Link>
              )}
            </div>
          </div>

          {/* Scroll cue */}
          <div className="hero-scroll-cue absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-white/40">
            <ChevronDown className="size-5" aria-hidden="true" />
          </div>
        </section>

        {/* ── Act 2: Pillars ──────────────────────────────────────────── */}
        <section className="relative mx-auto w-full max-w-6xl px-6 py-28 md:py-36">
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
        <section className="relative mx-auto w-full max-w-6xl px-6 py-28 md:py-36">
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

        <footer className="border-t border-white/5 py-10 text-center text-[11px] text-white/30">
          Weminal · a pipeline for crypto builders
        </footer>

        {/* ── Animations for hero-side elements ───────────────────────── */}
        <style>{`
          .hero-tagline {
            opacity: 0;
            animation: hero-fade 0.8s ease-out 2.8s forwards;
          }
          .hero-ctas {
            opacity: 0;
            transform: translateY(10px);
            animation: hero-rise 0.8s ease-out 3.1s forwards;
          }
          .hero-scroll-cue {
            opacity: 0;
            animation: hero-fade 0.8s ease-out 3.6s forwards, hero-bounce 2s ease-in-out 4s infinite;
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
            .hero-tagline, .hero-ctas, .hero-scroll-cue {
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
