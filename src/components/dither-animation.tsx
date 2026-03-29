'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

type Props = {
  /** Folder path under /public containing frame images */
  frames: string[]
  /** Milliseconds per frame. Default: 120 */
  interval?: number
  /** Loop animation. Default: true */
  loop?: boolean
  /** Image alt text */
  alt?: string
  className?: string
}

export function DitherAnimation({
  frames,
  interval = 120,
  loop = true,
  alt = 'Dither animation',
  className = '',
}: Props) {
  const [currentFrame, setCurrentFrame] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)

  useEffect(() => {
    if (!isPlaying || frames.length <= 1) return

    const timer = setInterval(() => {
      setCurrentFrame((prev) => {
        const next = prev + 1
        if (next >= frames.length) {
          if (loop) return 0
          setIsPlaying(false)
          return prev
        }
        return next
      })
    }, interval)

    return () => clearInterval(timer)
  }, [frames.length, interval, loop, isPlaying])

  const handleClick = useCallback(() => {
    if (!isPlaying && !loop) {
      setCurrentFrame(0)
      setIsPlaying(true)
    }
  }, [isPlaying, loop])

  if (frames.length === 0) return null

  return (
    <div
      className={`relative cursor-pointer select-none ${className}`}
      onClick={handleClick}
      role="img"
      aria-label={alt}
    >
      <Image
        src={frames[currentFrame]}
        alt={alt}
        width={800}
        height={400}
        className="w-full h-auto"
        priority={currentFrame === 0}
        unoptimized
      />
    </div>
  )
}
