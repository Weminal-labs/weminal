'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import dynamic from 'next/dynamic'
import { ParticleLogo } from '@/components/particle-logo'
import StaggeredMenu from '@/components/staggered-menu/StaggeredMenu'
import { useSession } from '@/lib/auth-client'

const PixelBlast = dynamic(() => import('@/components/pixel-blast'), { ssr: false })

export default function Home() {
  const { data: session, isPending } = useSession()

  const items = [
    { label: 'Opportunities', ariaLabel: 'Go to opportunities', link: '/hack' },
    { label: 'Ideas',         ariaLabel: 'Explore ideas',       link: '/ideas' },
    { label: 'Review',        ariaLabel: 'Weekly review',       link: '/review' },
    ...(!isPending
      ? [session
          ? { label: 'Profile', ariaLabel: 'Your profile',    link: '/profile' }
          : { label: 'Login',   ariaLabel: 'Sign in',         link: '/login' }]
      : []),
  ]

  return (
    <>
      {/* StaggeredMenu outside <main> so overflow-hidden doesn't clip the fixed panel */}
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

    <main className="relative min-h-dvh flex flex-col items-center justify-center overflow-hidden">
      {/* PixelBlast background */}
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

      {/* Logo — crop the canvas at ~76% of its native height to remove the
          empty space below the logotype and bring the CTA closer */}
      <div
        className="relative z-10 mx-auto overflow-hidden"
        style={{ width: 'min(92vw, 1100px)', aspectRatio: '966 / 490' }}
      >
        <ParticleLogo src="/hero-frame.svg" className="w-full" />
      </div>

      <Link
        href="/hack"
        className="relative z-10 group mt-6 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-800 transition-[transform,background-color] duration-200 ease-out active:scale-[0.97] shadow-lg shadow-gray-900/10"
      >
        Explore Opportunities
        <ArrowRight className="size-4 transition-transform duration-200 ease-out group-hover:translate-x-1" />
      </Link>
    </main>
    </>
  )
}
