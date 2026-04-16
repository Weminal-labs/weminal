'use client'

import { useEffect, useRef } from 'react'
import { createPixelReveal } from 'landing-effects'
import { useRevealOnScroll } from '@/hooks/use-reveal-on-scroll'

const MCP_SNIPPET = `// In your Claude config:
{
  "mcpServers": {
    "weminal": {
      "url": "https://weminal.dev/api/mcp",
      "headers": {
        "Authorization": "Bearer wem_…"
      }
    }
  }
}

// Then, inside Claude:
opportunity_create({
  name: "ETHPrague 2026",
  type: "hackathon",
  organization: "ETHPrague",
  reward_amount: 50000
})`

export function McpDemo() {
  const { ref, revealed, reducedMotion } = useRevealOnScroll<HTMLDivElement>({ threshold: 0.25 })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const disposedRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!revealed || reducedMotion) return
    const canvas = canvasRef.current
    if (!canvas) return
    // Tear down any prior instance
    disposedRef.current?.()
    disposedRef.current = createPixelReveal({
      canvas,
      imageSrc: '/weminal_logo/Logo-white.svg',
      blockSize: 6,
      pixelsPerFrame: 60,
      glitchRegion: 0.25,
      delay: 120,
    })
    return () => {
      disposedRef.current?.()
      disposedRef.current = null
    }
  }, [revealed, reducedMotion])

  return (
    <div
      ref={ref}
      data-revealed={revealed}
      className="grid md:grid-cols-[1.4fr_1fr] gap-8 items-center"
    >
      {/* Code block — line-staggered fade-in */}
      <div className="mcp-code rounded-2xl border border-white/10 bg-black/60 backdrop-blur-md overflow-hidden">
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5">
          <span className="size-2.5 rounded-full bg-red-500/70" />
          <span className="size-2.5 rounded-full bg-yellow-500/70" />
          <span className="size-2.5 rounded-full bg-green-500/70" />
          <span className="ml-3 text-[11px] font-mono text-white/40">claude-desktop-config.json</span>
        </div>
        <pre className="px-5 py-5 text-[13px] leading-relaxed font-mono text-white/85 overflow-x-auto">
          {MCP_SNIPPET.split('\n').map((line, i) => (
            <span key={i} className="mcp-line block" style={{ animationDelay: `${i * 35}ms` }}>
              {line || '\u00A0'}
            </span>
          ))}
        </pre>
      </div>

      {/* Pixel-reveal mark */}
      <div className="flex items-center justify-center">
        <div className="relative aspect-square w-48 md:w-64">
          {reducedMotion ? (
            // Static fallback for reduced-motion users
            <img
              src="/weminal_logo/Logo-white.svg"
              alt="Weminal"
              className="w-full h-full object-contain opacity-80"
            />
          ) : (
            <canvas
              ref={canvasRef}
              width={512}
              height={512}
              className="w-full h-full"
              aria-hidden="true"
            />
          )}
        </div>
      </div>

      <style>{`
        .mcp-line {
          opacity: 0;
          transform: translateX(-8px);
          transition: opacity .5s ease-out, transform .5s ease-out;
        }
        [data-revealed='true'] .mcp-line {
          animation: mcp-line-in .55s ease-out forwards;
        }
        @keyframes mcp-line-in {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .mcp-line { opacity: 1 !important; transform: none !important; animation: none !important; }
        }
      `}</style>
    </div>
  )
}
