'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'

const LanyardBadge = dynamic(() => import('@/components/lanyard-badge'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-16 h-16 rounded-full bg-[#3c00ff]/20 animate-pulse" />
    </div>
  ),
})

export default function LoginPage() {
  return (
    <main className="relative min-h-dvh flex flex-col items-center justify-center bg-[#0a0a0a] overflow-hidden">
      {/* 3D Badge — absolute positioned behind the card */}
      <div className="absolute inset-0 z-0">
        <LanyardBadge position={[0, 0, 11.5]} fov={36} transparent />
      </div>

      {/* Login Card — centered with badge hanging above */}
      <div className="relative z-10 w-full max-w-[420px] mx-auto px-6 mt-[28vh]">
        <div className="rounded-2xl bg-[#141414] border border-white/[0.06] p-8 shadow-2xl shadow-black/40">
          {/* Logo */}
          <div className="mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 via-[#7c3aed] to-[#3c00ff] flex items-center justify-center shadow-lg shadow-[#3c00ff]/20">
              <span className="text-white font-bold text-lg">W</span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-[28px] font-bold leading-tight text-white tracking-tight mb-1">
            Start Building
            <br />
            on Weminal
          </h1>
          <p className="text-gray-500 text-sm mb-8">Sign In to Continue</p>

          {/* Google button */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition-colors shadow-sm"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/[0.08]" />
            <span className="text-xs text-gray-600">or</span>
            <div className="flex-1 h-px bg-white/[0.08]" />
          </div>

          {/* Email button */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-white/[0.08] bg-transparent px-4 py-3 text-sm font-medium text-gray-300 hover:bg-white/[0.04] transition-colors"
          >
            <MailIcon />
            Continue with Email
          </button>
        </div>

        {/* Terms */}
        <p className="text-center text-xs text-gray-600 mt-6 px-4">
          Continuing, you agree to the{' '}
          <Link href="#" className="text-gray-400 hover:text-white transition-colors underline underline-offset-2">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="#" className="text-gray-400 hover:text-white transition-colors underline underline-offset-2">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </main>
  )
}

/* ---------- Icons ---------- */

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7" />
    </svg>
  )
}
