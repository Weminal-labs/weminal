import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Database } from 'lucide-react'
import { DitherFrames } from '@/components/dither-frames'

export default function Home() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6 py-20">
      {/* Logo + Title */}
      <div className="flex items-center gap-4 mb-10">
        <Image src="/logo.svg" alt="Weminal Labs" width={48} height={34} />
        <div className="h-8 w-px bg-gray-200" />
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Weminal Labs</h1>
          <p className="text-[11px] text-gray-400">Building tools for the crypto ecosystem</p>
        </div>
      </div>

      {/* Dither Animation */}
      <DitherFrames />

      {/* CTA */}
      <Link
        href="/hack"
        className="group mt-10 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/10"
      >
        <Database className="size-4" />
        Explore Opportunities
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </Link>

      {/* Footer */}
      <p className="mt-16 text-[11px] text-gray-300">Weminal Labs &middot; Open source</p>
    </main>
  )
}
