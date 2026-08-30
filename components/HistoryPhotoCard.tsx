'use client'

import Image from 'next/image'
import { useState } from 'react'
import type { HistoryPhoto } from '@/lib/geschiedenis'

interface HistoryPhotoCardProps {
  photo: HistoryPhoto
  sizes?: string
  className?: string
}

export function HistoryPhotoCard({
  photo,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  className = '',
}: HistoryPhotoCardProps) {
  const [expanded, setExpanded] = useState(false)
  const showFull = expanded

  return (
    <figure
      className={`group relative overflow-hidden rounded-3xl bg-white/60 shadow-md backdrop-blur-sm card-hover transition-shadow duration-300 ${
        showFull ? 'z-30 shadow-2xl ring-2 ring-pink-400/80' : ''
      } ${className}`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      onClick={() => setExpanded((value) => !value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          setExpanded((value) => !value)
        }
        if (event.key === 'Escape') setExpanded(false)
      }}
      tabIndex={0}
      role="button"
      aria-expanded={showFull}
      aria-label={showFull ? `${photo.caption ?? photo.alt} — volledig beeld` : `${photo.caption ?? photo.alt} — toon volledig beeld`}
    >
      <div
        className={`relative overflow-hidden bg-stone-200/90 transition-all duration-300 ease-out ${
          showFull ? 'min-h-[min(72vh,520px)]' : 'aspect-[4/3]'
        }`}
      >
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          className={`transition-all duration-300 ${
            showFull ? 'object-contain p-2' : 'object-cover'
          }`}
          sizes={sizes}
        />
        {!showFull && (
          <span className="pointer-events-none absolute bottom-2 right-2 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-white opacity-70 md:opacity-0 md:transition-opacity md:group-hover:opacity-100">
            Volledig beeld
          </span>
        )}
      </div>
      {photo.caption && (
        <figcaption className="px-4 py-3 text-sm font-medium text-gray-700">
          {photo.caption}
        </figcaption>
      )}
    </figure>
  )
}
