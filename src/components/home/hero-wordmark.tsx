'use client'

/**
 * "weminal" wordmark that draws itself in using SVG stroke-dashoffset,
 * then cross-fades to a filled glyph. Honours prefers-reduced-motion —
 * motion-averse users see the final filled state immediately with no animation.
 */
export function HeroWordmark() {
  return (
    <svg
      viewBox="0 0 800 200"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto select-none"
      aria-label="Weminal"
      role="img"
    >
      {/* Stroke (draws in first) */}
      <text
        x="400"
        y="150"
        textAnchor="middle"
        fontFamily="Inter, system-ui, -apple-system, sans-serif"
        fontWeight={900}
        fontSize={168}
        letterSpacing={-8}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.2}
        className="hero-wordmark-stroke"
        style={{ paintOrder: 'stroke' }}
      >
        weminal
      </text>

      {/* Fill (fades in after stroke finishes) */}
      <text
        x="400"
        y="150"
        textAnchor="middle"
        fontFamily="Inter, system-ui, -apple-system, sans-serif"
        fontWeight={900}
        fontSize={168}
        letterSpacing={-8}
        fill="currentColor"
        className="hero-wordmark-fill"
      >
        weminal
      </text>

      <style>{`
        .hero-wordmark-stroke {
          stroke-dasharray: 2400;
          stroke-dashoffset: 2400;
          animation: hwm-draw 2.6s cubic-bezier(0.65, 0, 0.35, 1) forwards;
        }
        .hero-wordmark-fill {
          opacity: 0;
          animation: hwm-fill 1s ease-out 2.2s forwards;
        }
        @keyframes hwm-draw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes hwm-fill {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-wordmark-stroke { animation: none; stroke-dashoffset: 0; }
          .hero-wordmark-fill { animation: none; opacity: 1; }
        }
      `}</style>
    </svg>
  )
}
