'use client'

import { useRef, useEffect, useCallback } from 'react'

/**
 * Premium particle logo — soft, fluid, interactive
 *
 * - Particles start at rest forming the logo
 * - Mouse repulsion with cubic falloff (gentle edges, strong center)
 * - Smooth spring return (0.08 stiffness, 0.85 damping)
 * - Soft round dots with slight size variation
 * - Subtle idle breathing
 */

type Props = {
  src: string
  className?: string
}

export function ParticleLogo({ src, className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const animRef = useRef<number>(0)
  const dataRef = useRef<{
    px: Float32Array; py: Float32Array
    tx: Float32Array; ty: Float32Array
    vx: Float32Array; vy: Float32Array
    sz: Float32Array; sd: Float32Array
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
      const off = document.createElement('canvas')
      off.width = w; off.height = h
      const octx = off.getContext('2d')!
      octx.fillStyle = '#fff'
      octx.fillRect(0, 0, w, h)
      octx.drawImage(img, 0, 0, w, h)

      const pixels = octx.getImageData(0, 0, w, h).data
      const targets: { x: number; y: number; d: number }[] = []
      const step = Math.round(4 * dpr)

      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          const i = (y * w + x) * 4
          const gray = (pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114) / 255
          if (gray < 0.5) {
            targets.push({ x, y, d: 1 - gray })
          }
        }
      }

      const n = targets.length
      const px = new Float32Array(n)
      const py = new Float32Array(n)
      const tx = new Float32Array(n)
      const ty = new Float32Array(n)
      const vx = new Float32Array(n)
      const vy = new Float32Array(n)
      const sz = new Float32Array(n)
      const sd = new Float32Array(n)

      for (let i = 0; i < n; i++) {
        tx[i] = px[i] = targets[i].x
        ty[i] = py[i] = targets[i].y
        vx[i] = vy[i] = 0
        sz[i] = (8 + targets[i].d * 4) * dpr
        sd[i] = Math.random() * Math.PI * 2
      }

      dataRef.current = { px, py, tx, ty, vx, vy, sz, sd, count: n }
    }
    img.src = src
  }, [src])

  const render = useCallback(function renderFrame(time: number) {
    const canvas = canvasRef.current
    const data = dataRef.current
    if (!canvas || !data) {
      animRef.current = requestAnimationFrame(renderFrame)
      return
    }

    const ctx = canvas.getContext('2d')!
    const w = canvas.width
    const h = canvas.height
    const dpr = Math.min(window.devicePixelRatio, 2)
    const mouse = mouseRef.current
    const mx = mouse.x * dpr
    const my = mouse.y * dpr
    const t = time * 0.001

    ctx.clearRect(0, 0, w, h)

    const { px, py, tx, ty, vx, vy, sz, sd, count } = data
    const repR = 70 * dpr

    for (let i = 0; i < count; i++) {
      // Subtle breathing
      const breathX = Math.sin(t * 0.4 + sd[i]) * 0.12
      const breathY = Math.cos(t * 0.3 + sd[i] * 1.4) * 0.12

      // Spring to home
      vx[i] += ((tx[i] + breathX) - px[i]) * 0.08
      vy[i] += ((ty[i] + breathY) - py[i]) * 0.08

      // Mouse repulsion — CUBIC falloff (gentle edges, strong center)
      const dx = px[i] - mx
      const dy = py[i] - my
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < repR && dist > 0.1) {
        const t = 1 - dist / repR
        const force = t * t * t * 5 * dpr // cubic falloff
        vx[i] += (dx / dist) * force
        vy[i] += (dy / dist) * force
      }

      // Damping
      vx[i] *= 0.85
      vy[i] *= 0.85

      px[i] += vx[i]
      py[i] += vy[i]

      // Draw soft circle
      const s = sz[i]
      ctx.globalAlpha = 0.9
      ctx.fillStyle = '#0a0a0a'
      ctx.beginPath()
      ctx.arc(px[i], py[i], s * 0.5, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.globalAlpha = 1
    animRef.current = requestAnimationFrame(renderFrame)
  }, [])

  useEffect(() => {
    init()
    animRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animRef.current)
  }, [init, render])

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const move = (e: MouseEvent) => {
      const r = c.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const leave = () => { mouseRef.current = { x: -9999, y: -9999 } }
    const click = (e: MouseEvent) => {
      const r = c.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio, 2)
      const cx = (e.clientX - r.left) * dpr
      const cy = (e.clientY - r.top) * dpr
      const d = dataRef.current
      if (!d) return
      const expR = 100 * dpr
      for (let i = 0; i < d.count; i++) {
        const dx = d.px[i] - cx
        const dy = d.py[i] - cy
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < expR && dist > 0.1) {
          const t = 1 - dist / expR
          const f = t * t * 15
          d.vx[i] += (dx / dist) * f
          d.vy[i] += (dy / dist) * f
        }
      }
    }
    c.addEventListener('mousemove', move)
    c.addEventListener('mouseleave', leave)
    c.addEventListener('click', click)
    return () => {
      c.removeEventListener('mousemove', move)
      c.removeEventListener('mouseleave', leave)
      c.removeEventListener('click', click)
    }
  }, [])

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const obs = new ResizeObserver(() => init())
    obs.observe(c)
    return () => obs.disconnect()
  }, [init])

  return (
    <canvas
      ref={canvasRef}
      className={`block w-full max-w-full ${className}`}
      style={{ cursor: 'pointer', aspectRatio: '966 / 644', width: '100%' }}
    />
  )
}
