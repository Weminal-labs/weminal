'use client'

import {
  Arrow as PopoverArrow,
  Content as PopoverContent,
  Portal as PopoverPortal,
  Root as PopoverRoot,
  Trigger as PopoverTrigger,
} from '@radix-ui/react-popover'
import { Clock, ExternalLink, ArrowRight } from 'lucide-react'
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
  side = 'top',
  align = 'center',
}: RichPopoverProps) {
  const shouldReduceMotion = useReducedMotion()

  const renderAction = () => {
    if (!actionLabel) return null
    const cls = 'inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 font-medium text-gray-900 text-xs transition-colors hover:bg-gray-100'
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
        <PopoverContent align={align} asChild className={`z-50 ${className}`} side={side} sideOffset={8}>
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95, y: 5, filter: 'blur(8px)' }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 5, filter: 'blur(8px)' }}
            transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring' as const, stiffness: 500, damping: 30, duration: 0.2 }}
            className="relative max-w-xs rounded-xl border border-gray-800 bg-gray-900 px-4 py-3 text-white shadow-xl"
          >
            <div className="flex items-center gap-2 text-sm font-medium">
              {icon}
              {href ? (
                <a className="inline-flex items-center gap-1 hover:underline" href={href} rel="noopener noreferrer" target="_blank">
                  <span>{title}</span>
                  <ExternalLink className="size-3 opacity-70" />
                </a>
              ) : (
                <span>{title}</span>
              )}
            </div>
            {description && (
              <p className="mt-2 text-xs text-gray-400 leading-relaxed">{description}</p>
            )}
            {(meta || actionLabel) && (
              <div className="mt-3 flex items-center justify-between gap-3">
                {meta ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[10px] text-gray-300">
                    <Clock className="size-3" /> {meta}
                  </span>
                ) : <span />}
                {renderAction()}
              </div>
            )}
            <PopoverArrow className="fill-gray-900" />
          </motion.div>
        </PopoverContent>
      </PopoverPortal>
    </PopoverRoot>
  )
}
