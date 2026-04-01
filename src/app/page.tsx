'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import dynamic from 'next/dynamic'
import { ParticleLogo } from '@/components/particle-logo'

const PixelBlast = dynamic(() => import('@/components/pixel-blast'), { ssr: false })

export default function Home() {
  return (
    <main className="relative min-h-dvh flex flex-col items-center justify-center overflow-hidden bg-[#3c00ff]">
      {/* PixelBlast background */}
      <div className="absolute inset-0 z-0 opacity-40">
        <PixelBlast
          variant="square"
          pixelSize={3}
          color="#ffffff"
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

      {/* Content */}
      <div className="relative z-10 mx-auto" style={{ width: 'min(92vw, 1100px)' }}>
        <ParticleLogo
          src="/hero-frame.svg"
          color="#ffffff"
          className="w-full"
        />
      </div>

      <Link
        href="/hack"
        className="relative z-10 group mt-10 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#3c00ff] hover:bg-gray-100 transition-[transform,background-color] duration-200 ease-out active:scale-[0.97] shadow-xl shadow-black/10"
      >
        Explore Opportunities
        <ArrowRight className="size-4 transition-transform duration-200 ease-out group-hover:translate-x-1" />
      </Link>
    </main>
  )
}
