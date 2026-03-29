'use client'

import { useRef, useEffect, useCallback } from 'react'

type Particle = {
  tx: number; ty: number  // target
  x: number; y: number    // current
  vx: number; vy: number  // velocity
  size: number
  gray: number            // brightness 0-1
}

type Props = {
  src: string
  className?: string
}

export function DitherCanvas({ src, className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const animRef = useRef<number>(0)
  const readyRef = useRef(false)

  // Floyd-Steinberg dithering + particle extraction
  const init = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height
    const w = canvas.width
    const h = canvas.height

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      // Rasterize SVG
      const off = document.createElement('canvas')
      off.width = w
      off.height = h
      const octx = off.getContext('2d')!
      octx.fillStyle = '#fff'
      octx.fillRect(0, 0, w, h)
      octx.drawImage(img, 0, 0, w, h)

      const imgData = octx.getImageData(0, 0, w, h)
      const pixels = imgData.data

      // Convert to grayscale float array
      const gray = new Float32Array(w * h)
      for (let i = 0; i < w * h; i++) {
        const r = pixels[i * 4]
        const g = pixels[i * 4 + 1]
        const b = pixels[i * 4 + 2]
        // Apply gamma 1.03
        let val = (r * 0.299 + g * 0.587 + b * 0.114) / 255
        val = Math.pow(val, 1.03)
        gray[i] = val
      }

      // Floyd-Steinberg dithering — scale 1.45, dotScale 1.5
      const step = 2
      const particles: Particle[] = []
      const dithered = new Float32Array(gray)

      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          const idx = y * w + x
          const oldVal = dithered[idx]
          const newVal = oldVal < 0.36 ? 0 : 1 // threshold ~93/255
          const error = oldVal - newVal

          // Distribute error (Floyd-Steinberg)
          if (x + step < w) dithered[idx + step] += error * 7 / 16
          if (y + step < h) {
            if (x - step >= 0) dithered[(y + step) * w + (x - step)] += error * 3 / 16
            dithered[(y + step) * w + x] += error * 5 / 16
            if (x + step < w) dithered[(y + step) * w + (x + step)] += error * 1 / 16
          }

          // Create particle for dark pixels — dotScale 1.5
          if (newVal === 0) {
            const dotSize = 3.0 + (1 - oldVal) * 1.2 // scale 1.45 * dotScale 1.5
            particles.push({
              tx: x, ty: y,
              x: w / 2 + (Math.random() - 0.5) * 40,
              y: h / 2 + (Math.random() - 0.5) * 40,
              vx: (Math.random() - 0.5) * 2,
              vy: (Math.random() - 0.5) * 2,
              size: dotSize,
              gray: oldVal,
            })
          }
        }
      }

      particlesRef.current = particles
      readyRef.current = true
    }
    img.src = src
  }, [src])

  // Animation loop
  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !readyRef.current) {
      animRef.current = requestAnimationFrame(render)
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height
    const mouse = mouseRef.current
    const particles = particlesRef.current

    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = '#000'

    const spring = 0.06
    const friction = 0.88
    const repRadius = 70
    const repForce = 5

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]

      // Spring to target
      p.vx += (p.tx - p.x) * spring
      p.vy += (p.ty - p.y) * spring

      // Mouse repulsion
      const dx = p.x - mouse.x
      const dy = p.y - mouse.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < repRadius && dist > 0.1) {
        const f = ((repRadius - dist) / repRadius) * repForce
        p.vx += (dx / dist) * f
        p.vy += (dy / dist) * f
      }

      p.vx *= friction
      p.vy *= friction
      p.x += p.vx
      p.y += p.vy

      // Round dot with corner radius (0.28)
      const r = p.size * 0.5
      const cr = r * 0.28 // corner radius
      ctx.beginPath()
      ctx.roundRect(p.x - r, p.y - r, p.size, p.size, cr)
      ctx.fill()
    }

    animRef.current = requestAnimationFrame(render)
  }, [])

  // Init on mount
  useEffect(() => {
    init()
  }, [init])

  // Start render loop
  useEffect(() => {
    animRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animRef.current)
  }, [render])

  // Mouse events
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const move = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const leave = () => { mouseRef.current = { x: -9999, y: -9999 } }
    const click = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect()
      const cx = e.clientX - r.left
      const cy = e.clientY - r.top
      for (const p of particlesRef.current) {
        const dx = p.x - cx
        const dy = p.y - cy
        const d = Math.sqrt(dx * dx + dy * dy)
        if (d < 120 && d > 0) {
          const f = ((120 - d) / 120) * 20
          p.vx += (dx / d) * f
          p.vy += (dy / d) * f
        }
      }
    }

    canvas.addEventListener('mousemove', move)
    canvas.addEventListener('mouseleave', leave)
    canvas.addEventListener('click', click)
    return () => {
      canvas.removeEventListener('mousemove', move)
      canvas.removeEventListener('mouseleave', leave)
      canvas.removeEventListener('click', click)
    }
  }, [])

  // Resize
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const obs = new ResizeObserver(() => {
      readyRef.current = false
      init()
    })
    obs.observe(canvas)
    return () => obs.disconnect()
  }, [init])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ cursor: 'pointer', aspectRatio: '2 / 1', width: '100%' }}
    />
  )
}
