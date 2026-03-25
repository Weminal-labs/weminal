import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-gray-900 text-balance">Weminal Labs</h1>
      <p className="mt-4 text-lg text-gray-500 text-pretty">Building tools for the crypto ecosystem</p>
      <Link
        href="/hack"
        className="mt-8 inline-flex items-center rounded-md bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
      >
        Crypto Opportunities Database
      </Link>
    </main>
  )
}
