'use client'

import { useRef, useEffect, useCallback } from 'react'

/**
 * Interactive particle logo animation
 * Based on: https://www.brydon.io/blog/svg-particle-morphing
 *
 * - Floyd-Steinberg dithered sampling from SVG
 * - Spring-damper physics (spring: 0.03, damping: 0.88)
 * - Mouse repulsion with linear falloff
 * - Click explosion
 * - Float32Array for performance
 * - Idle sine oscillation with per-particle seed
 */

type Props = {
  src: string
  className?: string
}

const SPRING = 0.1
const DAMPING = 0.82
const REPEL_RADIUS = 60
const REPEL_FORCE = 4
const EXPLODE_RADIUS = 120
const EXPLODE_FORCE = 18
const PARTICLE_SIZE = 3.2
const SAMPLE_STEP = 3
const THRESHOLD = 0.36

export function ParticleLogo({ src, className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const animRef = useRef<number>(0)

  // Typed arrays for performance
  const dataRef = useRef<{
    px: Float32Array  // current x
    py: Float32Array  // current y
    tx: Float32Array  // target x
    ty: Float32Array  // target y
    vx: Float32Array  // velocity x
    vy: Float32Array  // velocity y
    seed: Float32Array // motion variance seed
    size: Float32Array // particle size
    count: number
  } | null>(null)

  const init = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio, 2)
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr

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

      // Grayscale + Floyd-Steinberg
      const gray = new Float32Array(w * h)
      for (let i = 0; i < w * h; i++) {
        let val = (pixels[i * 4] * 0.299 + pixels[i * 4 + 1] * 0.587 + pixels[i * 4 + 2] * 0.114) / 255
        val = Math.pow(val, 1.03) // gamma
        gray[i] = val
      }

      // Collect particle positions via Floyd-Steinberg
      const targets: { x: number; y: number; darkness: number }[] = []
      const fs = new Float32Array(gray)

      for (let y = 0; y < h; y += SAMPLE_STEP) {
        for (let x = 0; x < w; x += SAMPLE_STEP) {
          const idx = y * w + x
          const old = fs[idx]
          const newVal = old < THRESHOLD ? 0 : 1
          const err = old - newVal

          if (x + SAMPLE_STEP < w) fs[idx + SAMPLE_STEP] += err * 7 / 16
          if (y + SAMPLE_STEP < h) {
            if (x - SAMPLE_STEP >= 0) fs[(y + SAMPLE_STEP) * w + (x - SAMPLE_STEP)] += err * 3 / 16
            fs[(y + SAMPLE_STEP) * w + x] += err * 5 / 16
            if (x + SAMPLE_STEP < w) fs[(y + SAMPLE_STEP) * w + (x + SAMPLE_STEP)] += err * 1 / 16
          }

          if (newVal === 0) {
            targets.push({ x, y, darkness: 1 - old })
          }
        }
      }

      const count = targets.length
      const px = new Float32Array(count)
      const py = new Float32Array(count)
      const tx = new Float32Array(count)
      const ty = new Float32Array(count)
      const vx = new Float32Array(count)
      const vy = new Float32Array(count)
      const seed = new Float32Array(count)
      const size = new Float32Array(count)

      // Initialize: start at target positions (already formed)
      for (let i = 0; i < count; i++) {
        tx[i] = targets[i].x
        ty[i] = targets[i].y
        px[i] = targets[i].x
        py[i] = targets[i].y
        vx[i] = 0
        vy[i] = 0
        seed[i] = Math.random() * Math.PI * 2
        size[i] = PARTICLE_SIZE * (0.85 + targets[i].darkness * 0.4)
      }

      dataRef.current = { px, py, tx, ty, vx, vy, seed, size, count }
    }
    img.src = src
  }, [src])

  // Render loop
  const render = useCallback((time: number) => {
    const canvas = canvasRef.current
    const data = dataRef.current
    if (!canvas || !data) {
      animRef.current = requestAnimationFrame(render)
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height
    const mouse = mouseRef.current
    const dpr = Math.min(window.devicePixelRatio, 2)
    const mx = mouse.x * dpr
    const my = mouse.y * dpr
    const repR = REPEL_RADIUS * dpr
    const t = time * 0.001

    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = '#0a0a0a'

    const { px, py, tx, ty, vx, vy, seed, size, count } = data

    for (let i = 0; i < count; i++) {
      // Subtle idle oscillation
      const phase = seed[i]
      const idleX = Math.sin(t * 0.5 + phase) * 0.15
      const idleY = Math.cos(t * 0.4 + phase * 1.3) * 0.15

      // Spring toward target + idle offset
      const dx = (tx[i] + idleX) - px[i]
      const dy = (ty[i] + idleY) - py[i]
      vx[i] += dx * SPRING
      vy[i] += dy * SPRING

      // Mouse repulsion
      const mdx = px[i] - mx
      const mdy = py[i] - my
      const dist = Math.sqrt(mdx * mdx + mdy * mdy)
      if (dist < repR && dist > 0.1) {
        const force = (1 - dist / repR) * REPEL_FORCE * dpr
        vx[i] += (mdx / dist) * force
        vy[i] += (mdy / dist) * force
      }

      // Damping
      vx[i] *= DAMPING
      vy[i] *= DAMPING

      // Update
      px[i] += vx[i]
      py[i] += vy[i]

      // Draw rounded rect particle
      const s = size[i]
      const r = s * 0.28 // corner radius
      ctx.beginPath()
      ctx.roundRect(px[i] - s * 0.5, py[i] - s * 0.5, s, s, r)
      ctx.fill()
    }

    animRef.current = requestAnimationFrame(render)
  }, [])

  // Setup
  useEffect(() => {
    init()
    animRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animRef.current)
  }, [init, render])

  // Mouse
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
      const dpr = Math.min(window.devicePixelRatio, 2)
      const cx = (e.clientX - r.left) * dpr
      const cy = (e.clientY - r.top) * dpr
      const data = dataRef.current
      if (!data) return
      const expR = EXPLODE_RADIUS * dpr
      for (let i = 0; i < data.count; i++) {
        const dx = data.px[i] - cx
        const dy = data.py[i] - cy
        const d = Math.sqrt(dx * dx + dy * dy)
        if (d < expR && d > 0.1) {
          const f = ((expR - d) / expR) * EXPLODE_FORCE
          data.vx[i] += (dx / d) * f
          data.vy[i] += (dy / d) * f
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
    const obs = new ResizeObserver(() => init())
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
