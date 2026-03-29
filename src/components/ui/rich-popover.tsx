'use client'

import {
  Arrow as PopoverArrow,
  Content as PopoverContent,
  Portal as PopoverPortal,
  Root as PopoverRoot,
  Trigger as PopoverTrigger,
} from '@radix-ui/react-popover'
import { ExternalLink, ArrowRight } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import type * as React from 'react'

export interface RichPopoverProps {
  trigger: React.ReactNode
  title: string
  description?: string
  icon?: React.ReactNode
  href?: string
  actionLabel?: string
  actionHref?: string
  onActionClick?: () => void
  meta?: string
  className?: string
  side?: 'top' | 'bottom' | 'left' | 'right'
  align?: 'start' | 'center' | 'end'
}

export default function RichPopover({
  trigger,
  title,
  description,
  icon,
  href,
  actionLabel,
  actionHref,
  onActionClick,
  meta,
  className = '',
  side = 'bottom',
  align = 'center',
}: RichPopoverProps) {
  const shouldReduceMotion = useReducedMotion()

  const renderAction = () => {
    if (!actionLabel) return null
    const cls = 'inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-1.5 font-medium text-white text-[11px] transition-colors hover:bg-gray-800'
    if (actionHref) {
      return (
        <a className={cls} href={actionHref} rel="noopener noreferrer" target="_blank">
          {actionLabel} <ArrowRight className="size-3" />
        </a>
      )
    }
    return (
      <button className={cls} onClick={onActionClick} type="button">
        {actionLabel} <ArrowRight className="size-3" />
      </button>
    )
  }

  return (
    <PopoverRoot>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverPortal>
        <PopoverContent
          align={align}
          asChild
          className={`z-50 ${className}`}
          side={side}
          sideOffset={8}
          collisionPadding={12}
        >
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.96, y: 4 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 4 }}
            transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring' as const, stiffness: 500, damping: 35 }}
            className="relative w-72 rounded-xl border border-gray-200 bg-white p-4 shadow-lg shadow-gray-200/50"
          >
            {/* Title */}
            <div className="flex items-start gap-2.5">
              {icon && <div className="mt-0.5 shrink-0">{icon}</div>}
              <div className="flex-1 min-w-0">
                {href ? (
                  <a
                    className="text-sm font-semibold text-gray-900 hover:underline inline-flex items-center gap-1"
                    href={href}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <span className="line-clamp-2">{title}</span>
                    <ExternalLink className="size-3 text-gray-400 shrink-0" />
                  </a>
                ) : (
                  <p className="text-sm font-semibold text-gray-900 line-clamp-2">{title}</p>
                )}
              </div>
            </div>

            {/* Description */}
            {description && (
              <p className="mt-2 text-xs text-gray-500 leading-relaxed line-clamp-3">{description}</p>
            )}

            {/* Footer: meta + action */}
            {(meta || actionLabel) && (
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                {meta ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-900 tabular-nums">
                    {meta}
                  </span>
                ) : <span />}
                {renderAction()}
              </div>
            )}

            <PopoverArrow className="fill-white" style={{ filter: 'drop-shadow(0 1px 0 rgb(229 231 235))' }} />
          </motion.div>
        </PopoverContent>
      </PopoverPortal>
    </PopoverRoot>
  )
}
