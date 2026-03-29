import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Database, BarChart3, LayoutGrid, Calendar } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-dvh flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="flex items-center gap-4 mb-8">
          <Image src="/logo.svg" alt="Weminal Labs" width={56} height={40} className="text-gray-900" />
          <div className="h-10 w-px bg-gray-200" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Weminal Labs</h1>
            <p className="text-xs text-gray-400">Building tools for the crypto ecosystem</p>
          </div>
        </div>

        <p className="max-w-lg text-center text-base text-gray-500 leading-relaxed mb-10">
          Track hackathons, grants, fellowships, and bounties across the crypto ecosystem.
          Discover opportunities, manage deadlines, and review your weekly progress.
        </p>

        {/* CTA */}
        <Link
          href="/hack"
          className="group inline-flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/10"
        >
          <Database className="size-4" />
          Explore Opportunities
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-16 max-w-2xl w-full">
          <Link href="/hack" className="rounded-xl border border-gray-100 bg-white p-4 hover:border-gray-200 hover:shadow-sm transition-all group">
            <div className="flex items-center gap-2 mb-2">
              <Database className="size-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-900">Database</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Filter and sort opportunities by type, chain, reward, and status.
            </p>
          </Link>

          <Link href="/charts" className="rounded-xl border border-gray-100 bg-white p-4 hover:border-gray-200 hover:shadow-sm transition-all group">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="size-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-900">Analytics</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Visualize trends, reward pools, and pipeline status.
            </p>
          </Link>

          <Link href="/review" className="rounded-xl border border-gray-100 bg-white p-4 hover:border-gray-200 hover:shadow-sm transition-all group">
            <div className="flex items-center gap-2 mb-2">
              <LayoutGrid className="size-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-900">Weekly Review</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Bento grid summaries with insights, deadlines, and top hacks.
            </p>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center">
        <p className="text-xs text-gray-300">Weminal Labs &middot; Open source</p>
      </footer>
    </main>
  )
}
