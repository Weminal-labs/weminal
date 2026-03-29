import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6">
      {/* Hero frame */}
      <Image
        src="/hero-frame.svg"
        alt="Weminal Labs"
        width={900}
        height={450}
        className="w-full max-w-2xl h-auto"
        priority
      />

      {/* CTA */}
      <Link
        href="/hack"
        className="group mt-12 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/10"
      >
        Explore Opportunities
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </main>
  )
}
