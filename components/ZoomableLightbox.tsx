'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface ZoomableLightboxProps {
  src: string
  alt?: string
  className?: string
  /** Thumbnail aspect, e.g. aspect-[4/3] */
  thumbClassName?: string
}

const MIN_SCALE = 1
const MAX_SCALE = 4
const ZOOM_STEP = 0.15

export function ZoomableLightbox({
  src,
  alt = '',
  className = '',
  thumbClassName = 'aspect-[4/3] w-full object-cover',
}: ZoomableLightboxProps) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [scale, setScale] = useState(MIN_SCALE)
  const [pan, setPan] = useState({ x: 0, y: 0 })

  useEffect(() => {
    setMounted(true)
  }, [])

  const viewportRef = useRef<HTMLDivElement>(null)
  const scaleRef = useRef(MIN_SCALE)
  const draggingRef = useRef(false)
  const lastPointerRef = useRef({ x: 0, y: 0 })
  const activePointerIdRef = useRef<number | null>(null)

  scaleRef.current = scale

  const resetView = useCallback(() => {
    setScale(MIN_SCALE)
    setPan({ x: 0, y: 0 })
    scaleRef.current = MIN_SCALE
  }, [])

  const close = useCallback(() => {
    setOpen(false)
    resetView()
  }, [resetView])

  const zoomBy = useCallback((delta: number) => {
    setScale((s) => {
      const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, Number((s + delta).toFixed(2))))
      scaleRef.current = next
      if (next <= MIN_SCALE) {
        setPan({ x: 0, y: 0 })
      }
      return next
    })
  }, [])

  useEffect(() => {
    if (!open) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === '+' || e.key === '=') zoomBy(ZOOM_STEP)
      if (e.key === '-') zoomBy(-ZOOM_STEP)
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)

    const viewport = viewportRef.current
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      zoomBy(e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP)
    }
    viewport?.addEventListener('wheel', onWheel, { passive: false })

    const onPointerMove = (e: PointerEvent) => {
      if (!draggingRef.current || activePointerIdRef.current !== e.pointerId) return
      if (scaleRef.current <= MIN_SCALE) return

      const dx = e.clientX - lastPointerRef.current.x
      const dy = e.clientY - lastPointerRef.current.y
      lastPointerRef.current = { x: e.clientX, y: e.clientY }
      setPan((p) => ({ x: p.x + dx, y: p.y + dy }))
    }

    const endDrag = (e: PointerEvent) => {
      if (activePointerIdRef.current !== e.pointerId) return
      draggingRef.current = false
      activePointerIdRef.current = null
      viewport?.releasePointerCapture(e.pointerId)
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', endDrag)
    window.addEventListener('pointercancel', endDrag)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
      viewport?.removeEventListener('wheel', onWheel)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', endDrag)
      window.removeEventListener('pointercancel', endDrag)
    }
  }, [open, close, zoomBy])

  const onViewportPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    draggingRef.current = true
    activePointerIdRef.current = e.pointerId
    lastPointerRef.current = { x: e.clientX, y: e.clientY }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`group relative block w-full overflow-hidden rounded-3xl bg-white/50 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 ${className}`}
        aria-label="Vergroot foto"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={`${thumbClassName} transition group-hover:scale-[1.02]`}
        />
        <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white opacity-90">
          Vergroten
        </span>
      </button>

      {open &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex h-[100dvh] w-[100vw] flex-col bg-black"
            role="dialog"
            aria-modal="true"
            aria-label="Foto vergroten"
          >
          <div className="relative z-30 flex shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-black px-4 py-3 text-white">
            <p className="truncate text-sm text-white/80">{alt || 'Foto'}</p>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                className="rounded-lg bg-white/15 px-3 py-1.5 text-sm hover:bg-white/25"
                onClick={() => zoomBy(-ZOOM_STEP)}
              >
                −
              </button>
              <span className="min-w-[3rem] text-center text-sm">{Math.round(scale * 100)}%</span>
              <button
                type="button"
                className="rounded-lg bg-white/15 px-3 py-1.5 text-sm hover:bg-white/25"
                onClick={() => zoomBy(ZOOM_STEP)}
              >
                +
              </button>
              <button
                type="button"
                className="rounded-lg bg-white/15 px-3 py-1.5 text-sm hover:bg-white/25"
                onClick={resetView}
              >
                Reset
              </button>
              <button
                type="button"
                className="rounded-lg bg-pink-500 px-3 py-1.5 text-sm font-medium hover:bg-pink-600"
                onClick={close}
              >
                Sluiten
              </button>
            </div>
          </div>

          <div
            ref={viewportRef}
            className={`relative z-0 min-h-0 flex-1 overflow-hidden touch-none select-none isolate ${
              scale > MIN_SCALE ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
            }`}
            onPointerDown={onViewportPointerDown}
          >
            <div
              className="absolute inset-0 z-0 will-change-transform"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
                transformOrigin: 'center center',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={alt}
                draggable={false}
                className="pointer-events-none h-full w-full object-contain"
              />
            </div>
          </div>

          <p className="relative z-30 shrink-0 bg-black px-4 py-2 text-center text-xs text-white/60">
            Scroll of + / − om te zoomen · sleep ingezoomd om te verplaatsen · Esc sluiten
          </p>
          </div>,
          document.body
        )}
    </>
  )
}
