'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { DitherCanvas } from '@/components/dither-canvas'

export default function Home() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6">
      <DitherCanvas
        src="/hero-frame.svg"
        className="w-full max-w-2xl"
        animationDuration={2000}
      />

      <Link
        href="/hack"
        className="group mt-10 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/10"
      >
        Explore Opportunities
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </main>
  )
}
