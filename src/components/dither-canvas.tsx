'use client'

import { useRef, useEffect, useCallback } from 'react'

type Particle = {
  // Target (original) position
  tx: number
  ty: number
  // Current position
  x: number
  y: number
  // Velocity
  vx: number
  vy: number
  // Size
  size: number
}

type Props = {
  src: string
  className?: string
  /** Particle sample scale — lower = more particles. Default: 3 */
  particleScale?: number
  /** Particle dot size. Default: 2 */
  dotSize?: number
  /** Mouse repulsion radius. Default: 80 */
  repulsionRadius?: number
  /** Mouse repulsion force. Default: 8 */
  repulsionForce?: number
  /** Spring stiffness (0-1). Default: 0.08 */
  spring?: number
  /** Friction (0-1). Default: 0.85 */
  friction?: number
}

export function DitherCanvas({
  src,
  className = '',
  particleScale = 3,
  dotSize = 2,
  repulsionRadius = 80,
  repulsionForce = 8,
  spring = 0.08,
  friction = 0.85,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const animRef = useRef<number>(0)
  const initializedRef = useRef(false)

  // Initialize particles from image
  const initParticles = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const w = canvas.width
      const h = canvas.height

      // Rasterize to offscreen canvas
      const offscreen = document.createElement('canvas')
      offscreen.width = w
      offscreen.height = h
      const octx = offscreen.getContext('2d')!
      octx.fillStyle = '#ffffff'
      octx.fillRect(0, 0, w, h)
      octx.drawImage(img, 0, 0, w, h)

      const imageData = octx.getImageData(0, 0, w, h)
      const data = imageData.data
      const particles: Particle[] = []

      // Sample pixels at intervals
      const step = particleScale
      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          const i = (y * w + x) * 4
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114

          // Only create particles for dark pixels (the logo)
          if (gray < 140) {
            particles.push({
              tx: x,
              ty: y,
              // Start scattered randomly
              x: x + (Math.random() - 0.5) * w * 0.6,
              y: y + (Math.random() - 0.5) * h * 0.6,
              vx: 0,
              vy: 0,
              size: dotSize,
            })
          }
        }
      }

      particlesRef.current = particles
      initializedRef.current = true
    }
    img.src = src
  }, [src, particleScale, dotSize])

  // Animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height
    const mouse = mouseRef.current
    const particles = particlesRef.current

    // Clear
    ctx.clearRect(0, 0, w, h)

    // Update & draw particles
    ctx.fillStyle = '#0a0a0a'

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]

      // Spring force toward target
      const dx = p.tx - p.x
      const dy = p.ty - p.y
      p.vx += dx * spring
      p.vy += dy * spring

      // Mouse repulsion
      const mx = p.x - mouse.x
      const my = p.y - mouse.y
      const dist = Math.sqrt(mx * mx + my * my)

      if (dist < repulsionRadius && dist > 0) {
        const force = (repulsionRadius - dist) / repulsionRadius * repulsionForce
        p.vx += (mx / dist) * force
        p.vy += (my / dist) * force
      }

      // Apply friction
      p.vx *= friction
      p.vy *= friction

      // Update position
      p.x += p.vx
      p.y += p.vy

      // Draw round dot
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2)
      ctx.fill()
    }

    animRef.current = requestAnimationFrame(animate)
  }, [spring, friction, repulsionRadius, repulsionForce])

  // Setup canvas size and init
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const updateSize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio, 2)
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      const ctx = canvas.getContext('2d')
      if (ctx) ctx.scale(dpr, dpr)
      // Re-adjust canvas internal size for drawing
      canvas.width = rect.width
      canvas.height = rect.height
      initParticles()
    }

    updateSize()

    const observer = new ResizeObserver(updateSize)
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [initParticles])

  // Start animation
  useEffect(() => {
    if (!initializedRef.current) return
    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [animate])

  // Also start when particles load
  useEffect(() => {
    const check = setInterval(() => {
      if (initializedRef.current && particlesRef.current.length > 0) {
        clearInterval(check)
        cancelAnimationFrame(animRef.current)
        animRef.current = requestAnimationFrame(animate)
      }
    }, 100)
    return () => clearInterval(check)
  }, [animate])

  // Mouse tracking
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }

    const handleLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 }
    }

    // Click explosion
    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const cx = e.clientX - rect.left
      const cy = e.clientY - rect.top

      for (const p of particlesRef.current) {
        const dx = p.x - cx
        const dy = p.y - cy
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 150 && dist > 0) {
          const force = (150 - dist) / 150 * 25
          p.vx += (dx / dist) * force
          p.vy += (dy / dist) * force
        }
      }
    }

    canvas.addEventListener('mousemove', handleMove)
    canvas.addEventListener('mouseleave', handleLeave)
    canvas.addEventListener('click', handleClick)

    return () => {
      canvas.removeEventListener('mousemove', handleMove)
      canvas.removeEventListener('mouseleave', handleLeave)
      canvas.removeEventListener('click', handleClick)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ cursor: 'pointer', aspectRatio: '2 / 1' }}
    />
  )
}
