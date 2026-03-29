'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

/**
 * Renders dither animation frames from /public/dither-frames/
 *
 * Place your frame images in public/dither-frames/ named sequentially:
 *   frame-001.png, frame-002.png, frame-003.png, ...
 *
 * Or use a single image: frame-001.png (will display static)
 */
export function DitherFrames() {
  const [frames, setFrames] = useState<string[]>([])
  const [currentFrame, setCurrentFrame] = useState(0)
  const [loaded, setLoaded] = useState(false)

  // Try to load frames on mount
  useEffect(() => {
    async function detectFrames() {
      const found: string[] = []
      // Try up to 60 frames
      for (let i = 1; i <= 60; i++) {
        const num = String(i).padStart(3, '0')
        const path = `/dither-frames/frame-${num}.png`
        try {
          const res = await fetch(path, { method: 'HEAD' })
          if (res.ok) {
            found.push(path)
          } else {
            break
          }
        } catch {
          break
        }
      }
      // Also try single file
      if (found.length === 0) {
        try {
          const res = await fetch('/dither-frames/frame.png', { method: 'HEAD' })
          if (res.ok) found.push('/dither-frames/frame.png')
        } catch { /* ignore */ }
      }
      setFrames(found)
      setLoaded(true)
    }
    detectFrames()
  }, [])

  // Animate through frames
  useEffect(() => {
    if (frames.length <= 1) return
    const timer = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frames.length)
    }, 150)
    return () => clearInterval(timer)
  }, [frames.length])

  // Nothing to show yet or no frames found
  if (!loaded || frames.length === 0) {
    return (
      <div className="w-full max-w-xl">
        <div className="aspect-[2/1] rounded-xl bg-gray-50 flex items-center justify-center">
          <p className="text-xs text-gray-300">
            {loaded ? 'Add frames to public/dither-frames/' : 'Loading...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-xl">
      <Image
        src={frames[currentFrame]}
        alt="Weminal Labs — dithered"
        width={1200}
        height={600}
        className="w-full h-auto rounded-xl"
        priority
        unoptimized
      />
    </div>
  )
}
