'use client'

import { useCallback, useEffect, useState } from 'react'

interface ZoomableLightboxProps {
  src: string
  alt?: string
  className?: string
  /** Thumbnail aspect, e.g. aspect-[4/3] */
  thumbClassName?: string
}

export function ZoomableLightbox({
  src,
  alt = '',
  className = '',
  thumbClassName = 'aspect-[4/3] w-full object-cover',
}: ZoomableLightboxProps) {
  const [open, setOpen] = useState(false)
  const [scale, setScale] = useState(1)

  const close = useCallback(() => {
    setOpen(false)
    setScale(1)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === '+' || e.key === '=') setScale((s) => Math.min(4, s + 0.25))
      if (e.key === '-') setScale((s) => Math.max(1, s - 0.25))
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, close])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`group relative block w-full overflow-hidden rounded-3xl bg-white/50 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 ${className}`}
        aria-label="Vergroot foto"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className={`${thumbClassName} transition group-hover:scale-[1.02]`} />
        <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white opacity-90">
          Vergroten
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-black/90"
          role="dialog"
          aria-modal="true"
          aria-label="Foto vergroten"
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3 text-white">
            <p className="truncate text-sm text-white/80">{alt || 'Foto'}</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-lg bg-white/15 px-3 py-1.5 text-sm hover:bg-white/25"
                onClick={() => setScale((s) => Math.max(1, s - 0.25))}
              >
                −
              </button>
              <span className="min-w-[3rem] text-center text-sm">{Math.round(scale * 100)}%</span>
              <button
                type="button"
                className="rounded-lg bg-white/15 px-3 py-1.5 text-sm hover:bg-white/25"
                onClick={() => setScale((s) => Math.min(4, s + 0.25))}
              >
                +
              </button>
              <button
                type="button"
                className="rounded-lg bg-white/15 px-3 py-1.5 text-sm hover:bg-white/25"
                onClick={() => setScale(1)}
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
            className="relative flex-1 overflow-auto"
            onWheel={(e) => {
              e.preventDefault()
              setScale((s) => {
                const next = e.deltaY < 0 ? s + 0.1 : s - 0.1
                return Math.min(4, Math.max(1, Number(next.toFixed(2))))
              })
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) close()
            }}
          >
            <div className="flex min-h-full min-w-full items-center justify-center p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={alt}
                style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}
                className="max-h-[85vh] max-w-[95vw] object-contain transition-transform duration-150"
                draggable={false}
              />
            </div>
          </div>
          <p className="px-4 py-2 text-center text-xs text-white/60">
            Scroll om te bewegen · + / − om te zoomen · Esc om te sluiten
          </p>
        </div>
      )}
    </>
  )
}
