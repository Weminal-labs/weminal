'use client'

import { motion } from 'motion/react'
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
  const [isExpanded, setIsExpanded] = useState(false)
  const cards = opportunities.slice(0, 4)

  if (cards.length === 0) return null

  return (
    <button
      type="button"
      aria-label="Toggle card stack"
      className="relative mx-auto cursor-pointer min-h-[220px] w-full flex items-center justify-center bg-transparent border-0 p-0"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {cards.map((opp, index) => {
        const total = cards.length
        const colors = typeColors[opp.type as OpportunityType]
        const centerOffset = (total - 1) * 5
        const reward = opp.reward_amount
          ? `$${Number(opp.reward_amount).toLocaleString()}`
          : null

        // Stacked position
        const stackX = index * 8 - centerOffset
        const stackY = index * 4
        const stackRotate = index * 1.5

        // Expanded position
        const cardWidth = 200
        const overlap = 140
        const totalW = cardWidth + (total - 1) * (cardWidth - overlap)
        const expandOffset = totalW / 2
        const expandX = index * (cardWidth - overlap) - expandOffset + cardWidth / 2
        const expandRotate = index * 4 - (total - 1) * 2

        return (
          <motion.div
            key={opp.id}
            className={cn(
              'absolute rounded-xl p-4 w-[200px]',
              'bg-white border border-gray-100',
              'shadow-[0_4px_12px_rgb(0,0,0,0.06)]',
              'hover:shadow-[0_8px_24px_rgb(0,0,0,0.1)]',
              'transition-shadow duration-300',
            )}
            style={{ zIndex: total - index }}
            animate={{
              x: isExpanded ? expandX : stackX,
              y: isExpanded ? 0 : stackY,
              rotate: isExpanded ? expandRotate : stackRotate,
              scale: isExpanded ? 1 : 1 - index * 0.03,
            }}
            transition={{ type: 'spring', stiffness: 350, damping: 30, mass: 0.8 }}
            onClick={(e) => {
              if (isExpanded) {
                e.stopPropagation()
                onSelect(opp)
              }
            }}
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
          </motion.div>
        )
      })}
    </button>
  )
}
