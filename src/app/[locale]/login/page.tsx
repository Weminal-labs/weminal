'use client'

export const runtime = 'edge'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { signIn } from '@/lib/auth-client'
import { sanitizeNext } from '@/lib/pure-helpers'

function LoginForm() {
  const params = useSearchParams()
  const rawNext = params.get('next')
  const next = sanitizeNext(rawNext)
  const error = params.get('error')
  const [signingIn, setSigningIn] = useState(false)
  const [clientError, setClientError] = useState<string | null>(null)

  async function handleGitHub() {
    setSigningIn(true)
    setClientError(null)
    try {
      const result = (await signIn.social({ provider: 'github', callbackURL: next })) as
        | { error?: { message?: string } | string | null }
        | undefined
      if (result?.error) {
        const msg = typeof result.error === 'string' ? result.error : result.error.message
        setClientError(msg || 'Sign-in failed. Check server config (GitHub OAuth credentials).')
      }
    } catch (e) {
      setClientError(e instanceof Error ? e.message : 'Sign-in failed — see console')
    } finally {
      setSigningIn(false)
    }
  }

  return (
    <main className="relative min-h-dvh flex flex-col items-center justify-center overflow-hidden">
      {/* Background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover object-top z-0 pointer-events-none"
      >
        <source src="/hack-bg.webm" type="video/webm" />
      </video>

      {/* Vignette */}
      <div
        className="pointer-events-none fixed inset-0 z-[1]"
        style={{
          background:
            'linear-gradient(to right, rgba(9,9,11,0.92) 0%, transparent 18%, transparent 82%, rgba(9,9,11,0.92) 100%)',
        }}
      />
      {/* Center darken for card legibility */}
      <div
        className="pointer-events-none fixed inset-0 z-[1]"
        style={{ background: 'rgba(9,9,11,0.45)' }}
      />

      {/* Login card */}
      <div className="relative z-10 w-full max-w-[420px] mx-auto px-6">
        <div className="rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/15 p-10 shadow-2xl">

          {/* Logo mark */}
          <div className="mb-8 flex items-center justify-center">
            <img
              src="/weminal_logo/Logo-white.svg"
              alt="Weminal"
              className="h-12 w-auto"
              draggable={false}
            />
          </div>

          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-white mb-2">
              Sign in to Weminal
            </h1>
            <p className="text-white/55 text-sm leading-relaxed">
              Track crypto opportunities. Use your account to create, update, and manage your pipeline.
            </p>
          </div>

          {/* Error banner */}
          {(error === 'oauth_failed' || clientError) && (
            <div className="mb-5 rounded-xl border border-red-400/30 bg-red-500/15 p-3">
              <p className="text-sm text-red-300 text-center font-medium">
                {clientError ?? 'Sign-in failed. Please try again.'}
              </p>
            </div>
          )}

          {/* GitHub sign-in */}
          <button
            type="button"
            onClick={handleGitHub}
            disabled={signingIn}
            className="w-full flex items-center justify-center gap-3 rounded-xl bg-white/90 px-4 py-3.5 text-sm font-semibold text-gray-900 transition-all duration-200 hover:bg-white hover:scale-[1.01] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <GitHubIcon />
            {signingIn ? 'Redirecting to GitHub…' : 'Continue with GitHub'}
          </button>

          <p className="mt-7 text-center text-xs text-white/30">
            By continuing you agree to our terms of use.
          </p>
        </div>
      </div>
    </main>
  )
}

function GitHubIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23A11.51 11.51 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.29-1.552 3.297-1.23 3.297-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.807 5.625-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-dvh flex items-center justify-center bg-zinc-950">
        <div className="w-full max-w-[420px] mx-auto px-6">
          <div className="rounded-2xl bg-white/10 border border-white/15 p-10 h-72 animate-pulse" />
        </div>
      </main>
    }>
      <LoginForm />
    </Suspense>
  )
}
