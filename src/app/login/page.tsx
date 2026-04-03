'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { ArrowRight } from 'lucide-react'
import { ParticleLogo } from '@/components/particle-logo'

const PixelBlast = dynamic(() => import('@/components/pixel-blast'), { ssr: false })

export default function LoginPage() {
  return (
    <main className="relative min-h-dvh flex flex-col items-center justify-center overflow-hidden bg-[#fafafa] selection:bg-[#3c00ff]/20">
      <style>{`
        @keyframes revealUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-reveal {
          animation: revealUp 800ms cubic-bezier(0.19, 1, 0.22, 1) both;
        }
      `}</style>

      {/* Dynamic Background matching homepage */}
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

      {/* Frame Logo Effect behind the login card */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-auto">
         <div style={{ width: 'min(92vw, 1100px)' }}>
            <ParticleLogo src="/hero-frame.svg" className="w-full opacity-40 mix-blend-multiply" color="#0a0a0a" />
         </div>
      </div>

      {/* Sleek, Modern Login Card */}
      <div className="relative z-10 w-full max-w-[420px] mx-auto px-6 animate-reveal">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-white/70 backdrop-blur-2xl border border-white/80 p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,1)] group hover:bg-white/80 transition-all duration-500">
          
          {/* Subtle noise texture overlay */}
          <div 
            className="absolute inset-0 opacity-[0.02] mix-blend-multiply pointer-events-none" 
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
          />

          <div className="relative z-10">
            {/* Minimalist Logo Mark */}
            <div className="mb-10 flex items-center justify-center">
              <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-[#5b21ff] to-[#3c00ff] text-white flex items-center justify-center shadow-lg shadow-[#3c00ff]/20 ring-1 ring-black/5">
                <span className="font-bold text-xl leading-none -tracking-widest pr-0.5">W</span>
              </div>
            </div>

            <div className="mb-8 text-center">
              <h1 className="text-3xl font-semibold tracking-[-0.03em] leading-[1.2] text-gray-900 mb-2">
                Start Building
              </h1>
              <p className="text-gray-500/90 text-[15px] font-medium tracking-tight">Access your Weminal console</p>
            </div>

            <div className="space-y-3">
              <button type="button" className="w-full group relative flex items-center justify-center gap-3 rounded-2xl bg-white px-4 py-4 text-[15px] font-semibold text-gray-900 transition-all duration-300 hover:bg-gray-50 hover:scale-[1.01] border border-gray-200/80 hover:border-gray-300 shadow-sm hover:shadow-md hover:shadow-black/5 active:scale-[0.99]">
                <GoogleIcon />
                Continue with Google
                <ArrowRight className="absolute right-4 w-4 h-4 opacity-0 -translate-x-2 text-gray-400 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
              </button>
              
              <button type="button" className="w-full relative flex items-center justify-center gap-3 rounded-2xl bg-[#0a0a0a] px-4 py-4 text-[15px] font-semibold text-white transition-all duration-300 hover:bg-[#1a1a1a] hover:scale-[1.01] hover:shadow-lg hover:shadow-[#0a0a0a]/20 active:scale-[0.99]">
                <MailIcon />
                Continue with Email
              </button>
            </div>

            <p className="mt-8 text-center text-[13px] text-gray-400 font-medium tracking-tight">
              By continuing, you agree to our{' '}
              <Link href="#" className="text-gray-600 hover:text-[#3c00ff] underline decoration-gray-300 underline-offset-4 transition-colors">Terms</Link>{' '}
              and{' '}
              <Link href="#" className="text-gray-600 hover:text-[#3c00ff] underline decoration-gray-300 underline-offset-4 transition-colors">Privacy</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

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
