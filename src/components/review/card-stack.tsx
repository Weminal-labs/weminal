'use client'

import { motion, AnimatePresence } from 'motion/react'
import { useState } from 'react'
import type { Opportunity, OpportunityType } from '@/lib/types'
import { typeColors } from '@/lib/type-colors'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type Props = {
  opportunities: Opportunity[]
  onSelect: (opp: Opportunity) => void
}

export function CardStack({ opportunities, onSelect }: Props) {
  const [frontIndex, setFrontIndex] = useState(0)
  const cards = opportunities.slice(0, 4)

  if (cards.length === 0) return null

  const handleClick = () => {
    setFrontIndex((prev) => (prev + 1) % cards.length)
  }

  return (
    <div
      className="relative mx-auto min-h-[200px] w-full flex items-center justify-center"
      role="group"
      aria-label="Top hacks card stack"
    >
      <AnimatePresence mode="popLayout">
        {cards.map((opp, i) => {
          // Position relative to front card
          const pos = (i - frontIndex + cards.length) % cards.length
          const colors = typeColors[opp.type as OpportunityType]
          const reward = opp.reward_amount
            ? `$${Number(opp.reward_amount).toLocaleString()}`
            : null

          const isFront = pos === 0

          return (
            <motion.div
              key={opp.id}
              layout
              className={cn(
                'absolute rounded-xl p-4 w-[190px]',
                'bg-white border border-gray-100',
                'shadow-[0_2px_8px_rgb(0,0,0,0.04)]',
                isFront && 'cursor-pointer hover:shadow-[0_8px_24px_rgb(0,0,0,0.08)]',
              )}
              animate={{
                y: pos * 6,
                x: pos * 4,
                scale: 1 - pos * 0.04,
                rotate: pos * 2,
                zIndex: cards.length - pos,
              }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
              onClick={() => {
                if (isFront) {
                  handleClick()
                }
              }}
              onDoubleClick={() => {
                if (isFront) {
                  onSelect(opp)
                }
              }}
              aria-label={`${opp.name}${isFront ? ' — click to see next, double-click for details' : ''}`}
            >
              <div className="flex items-center gap-1.5 mb-2">
                {colors && (
                  <Badge className={`${colors.bg} ${colors.text} text-[9px] px-1.5 py-0`}>
                    {opp.type}
                  </Badge>
                )}
              </div>
              <h4 className="text-xs font-semibold text-gray-800 line-clamp-2 text-left leading-tight mb-2">
                {opp.name}
              </h4>
              {reward && (
                <p className="text-lg font-bold text-gray-900 tabular-nums tracking-tight text-left">
                  {reward}
                </p>
              )}
              {opp.organization && (
                <p className="text-[10px] text-gray-400 text-left mt-1">{opp.organization}</p>
              )}
              {isFront && cards.length > 1 && (
                <p className="text-[9px] text-gray-300 text-center mt-2">
                  {pos + 1}/{cards.length} · tap to cycle
                </p>
              )}
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
