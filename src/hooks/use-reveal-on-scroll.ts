'use client'

import { useEffect, useRef, useState } from 'react'

type Options = {
  threshold?: number
  rootMargin?: string
  once?: boolean
}

const getReducedMotion = () => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Returns { ref, revealed } for the first time the element enters the viewport.
 * Honours prefers-reduced-motion by revealing immediately (no animation).
 */
export function useRevealOnScroll<T extends HTMLElement>({
  threshold = 0.2,
  rootMargin = '0px 0px -10% 0px',
  once = true,
}: Options = {}) {
  const ref = useRef<T>(null)
  // Initialize from media query to avoid synchronous setState in effect
  const [reducedMotion, setReducedMotion] = useState(getReducedMotion)
  const [revealed, setRevealed] = useState(getReducedMotion)

  // Listen for changes to reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => {
      setReducedMotion(mq.matches)
      if (mq.matches) setRevealed(true)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // Intersection Observer for scroll reveal
  useEffect(() => {
    const el = ref.current
    if (!el || reducedMotion) return

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setRevealed(true)
            if (once) io.disconnect()
          } else if (!once) {
            setRevealed(false)
          }
        }
      },
      { threshold, rootMargin }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold, rootMargin, once, reducedMotion])

  return { ref, revealed, reducedMotion }
}
