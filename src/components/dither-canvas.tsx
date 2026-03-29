'use client'

import { useRef, useEffect, useState, useCallback } from 'react'

// 4x4 Bayer matrix
const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
]

type Props = {
  src: string
  className?: string
  animationDuration?: number
}

export function DitherCanvas({
  src,
  className = '',
  animationDuration = 2000,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dimensions, setDimensions] = useState({ w: 0, h: 0 })
  const sourceDataRef = useRef<ImageData | null>(null)
  const animRef = useRef<number>(0)

  // Load image → rasterize to offscreen canvas → store pixel data
  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      // Use natural dimensions, capped
      const maxW = Math.min(img.naturalWidth || 900, 1200)
      const ratio = (img.naturalHeight || 450) / (img.naturalWidth || 900)
      const w = maxW
      const h = Math.round(maxW * ratio)

      // Rasterize SVG to offscreen canvas
      const offscreen = document.createElement('canvas')
      offscreen.width = w
      offscreen.height = h
      const octx = offscreen.getContext('2d')!

      // White background for SVG
      octx.fillStyle = '#ffffff'
      octx.fillRect(0, 0, w, h)
      octx.drawImage(img, 0, 0, w, h)

      sourceDataRef.current = octx.getImageData(0, 0, w, h)
      setDimensions({ w, h })
    }
    img.src = src
  }, [src])

  const render = useCallback((progress: number) => {
    const canvas = canvasRef.current
    const sourceData = sourceDataRef.current
    if (!canvas || !sourceData) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width: w, height: h } = sourceData
    const src = sourceData.data
    const output = ctx.createImageData(w, h)
    const out = output.data

    // Animated pixel size: starts large (blocky), shrinks to 1 (crisp)
    const pixelSize = Math.max(1, Math.round(8 * (1 - progress) + 1))
    // Animated threshold: starts at 255 (all white), settles to 128
    const thresh = 128 + 127 * (1 - progress)

    for (let y = 0; y < h; y += pixelSize) {
      for (let x = 0; x < w; x += pixelSize) {
        // Sample center of block
        const cx = Math.min(x + (pixelSize >> 1), w - 1)
        const cy = Math.min(y + (pixelSize >> 1), h - 1)
        const si = (cy * w + cx) * 4

        // Grayscale
        const gray = src[si] * 0.299 + src[si + 1] * 0.587 + src[si + 2] * 0.114

        // Bayer dithering
        const bayer = (BAYER[y % 4][x % 4] / 16 - 0.5) * 255 * 0.5
        const val = gray + bayer > thresh ? 255 : 0

        // Fill block
        for (let dy = 0; dy < pixelSize && y + dy < h; dy++) {
          for (let dx = 0; dx < pixelSize && x + dx < w; dx++) {
            const oi = ((y + dy) * w + (x + dx)) * 4
            out[oi] = val
            out[oi + 1] = val
            out[oi + 2] = val
            out[oi + 3] = 255
          }
        }
      }
    }

    ctx.putImageData(output, 0, 0)
  }, [])

  // Run animation when image is loaded
  useEffect(() => {
    if (dimensions.w === 0) return

    const canvas = canvasRef.current
    if (canvas) {
      canvas.width = dimensions.w
      canvas.height = dimensions.h
    }

    const start = performance.now()

    function animate(now: number) {
      const t = Math.min((now - start) / animationDuration, 1)
      const eased = 1 - Math.pow(1 - t, 3) // ease out cubic
      render(eased)
      if (t < 1) animRef.current = requestAnimationFrame(animate)
    }

    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [dimensions, animationDuration, render])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        width: '100%',
        maxWidth: dimensions.w || 900,
        height: 'auto',
        aspectRatio: dimensions.w && dimensions.h ? `${dimensions.w} / ${dimensions.h}` : '2 / 1',
      }}
    />
  )
}
