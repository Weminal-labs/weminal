'use client'

import { useRef, useEffect, useState, useCallback } from 'react'

// 4x4 Bayer matrix normalized to 0-1
const BAYER_4X4 = [
  [0 / 16, 8 / 16, 2 / 16, 10 / 16],
  [12 / 16, 4 / 16, 14 / 16, 6 / 16],
  [3 / 16, 11 / 16, 1 / 16, 9 / 16],
  [15 / 16, 7 / 16, 13 / 16, 5 / 16],
]

type Props = {
  src: string
  width?: number
  height?: number
  className?: string
  /** Animation duration in ms. Default: 2000 */
  animationDuration?: number
  /** Dither scale (pixel size). Default: 0.75 means more detail */
  scale?: number
  /** Whether to invert. Default: true */
  invert?: boolean
  /** Threshold 0-255. Default: 93 */
  threshold?: number
  /** Blur radius. Default: 3.75 */
  blur?: number
}

export function DitherCanvas({
  src,
  width = 900,
  height = 450,
  className = '',
  animationDuration = 2200,
  scale = 0.75,
  invert = true,
  threshold = 93,
  blur = 3.75,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loaded, setLoaded] = useState(false)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const animFrameRef = useRef<number>(0)

  const render = useCallback((progress: number) => {
    const canvas = canvasRef.current
    const img = imageRef.current
    if (!canvas || !img) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height

    // Clear
    ctx.fillStyle = invert ? '#000' : '#fff'
    ctx.fillRect(0, 0, w, h)

    // Draw image with blur
    ctx.filter = `blur(${blur * (1 - progress * 0.7)}px) contrast(${1 + progress * 0.3})`
    ctx.drawImage(img, 0, 0, w, h)
    ctx.filter = 'none'

    // Get pixel data
    const imageData = ctx.getImageData(0, 0, w, h)
    const data = imageData.data

    // Animated threshold — starts high (all white/black), settles to target
    const animThreshold = threshold + (255 - threshold) * (1 - progress)

    // Bayer dithering
    const pixelSize = Math.max(1, Math.round((1 / scale) * (1 + (1 - progress) * 2)))

    for (let y = 0; y < h; y += pixelSize) {
      for (let x = 0; x < w; x += pixelSize) {
        // Sample center pixel
        const cx = Math.min(x + Math.floor(pixelSize / 2), w - 1)
        const cy = Math.min(y + Math.floor(pixelSize / 2), h - 1)
        const idx = (cy * w + cx) * 4
        const gray = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114

        // Bayer threshold
        const bx = x % 4
        const by = y % 4
        const bayerValue = BAYER_4X4[by][bx] * 255

        let pixel = gray + bayerValue - 128
        const isWhite = pixel > animThreshold

        const color = invert
          ? (isWhite ? 255 : 0)
          : (isWhite ? 255 : 0)

        // Fill block
        for (let dy = 0; dy < pixelSize && y + dy < h; dy++) {
          for (let dx = 0; dx < pixelSize && x + dx < w; dx++) {
            const pi = ((y + dy) * w + (x + dx)) * 4
            data[pi] = color
            data[pi + 1] = color
            data[pi + 2] = color
            data[pi + 3] = 255
          }
        }
      }
    }

    ctx.putImageData(imageData, 0, 0)
  }, [scale, invert, threshold, blur])

  // Load image
  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      imageRef.current = img
      setLoaded(true)
    }
    img.src = src
  }, [src])

  // Animate
  useEffect(() => {
    if (!loaded) return

    const startTime = performance.now()

    function animate(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / animationDuration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)

      render(eased)

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate)
      }
    }

    animFrameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [loaded, animationDuration, render])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`${className}`}
      style={{ imageRendering: 'pixelated' }}
    />
  )
}
