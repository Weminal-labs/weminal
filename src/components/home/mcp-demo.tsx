'use client'

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
  const { ref, revealed } = useRevealOnScroll<HTMLDivElement>({ threshold: 0.25 })

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

      {/* Logo with fade-in animation */}
      <div className="flex items-center justify-center">
        <div className="relative aspect-square w-48 md:w-64">
          <img
            src="/weminal_logo/Logo-white.svg"
            alt="Weminal"
            className="mcp-logo w-full h-full object-contain"
          />
        </div>
      </div>

      <style>{`
        .mcp-line {
          opacity: 0;
          transform: translateX(-8px);
        }
        .mcp-logo {
          opacity: 0;
          transform: scale(0.95);
        }
        [data-revealed='true'] .mcp-line {
          animation: mcp-line-in .55s ease-out forwards;
        }
        [data-revealed='true'] .mcp-logo {
          animation: mcp-logo-in 1s ease-out 0.3s forwards;
        }
        @keyframes mcp-line-in {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes mcp-logo-in {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 0.8; transform: scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .mcp-line { opacity: 1 !important; transform: none !important; animation: none !important; }
          .mcp-logo { opacity: 0.8 !important; transform: none !important; animation: none !important; }
        }
      `}</style>
    </div>
  )
}
