'use client'

import { useEffect, useRef, useState } from 'react'
import { SupabaseVideo } from './SupabaseVideo'

interface LazyVideoProps {
  src?: string
  supabaseBucket?: string
  supabaseFileName?: string
  className?: string
  autoPlay?: boolean
  muted?: boolean
  loop?: boolean
  playsInline?: boolean
  poster?: string
}

export function LazyVideo({
  src,
  supabaseBucket,
  supabaseFileName,
  className = '',
  autoPlay = false,
  muted = true,
  loop = false,
  playsInline = true,
  poster,
}: LazyVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Use Intersection Observer to load video when it's about to enter viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !shouldLoad) {
            setShouldLoad(true)
            observer.disconnect()
          }
        })
      },
      {
        rootMargin: '50px', // Start loading 50px before video enters viewport
      }
    )

    observer.observe(container)

    return () => {
      observer.disconnect()
    }
  }, [shouldLoad])

  return (
    <div ref={containerRef} className={className}>
      {shouldLoad ? (
        supabaseBucket ? (
          <SupabaseVideo
            bucket={supabaseBucket}
            fileName={supabaseFileName}
            fallbackUrl={src || undefined}
            className="w-full h-full object-cover"
            autoPlay={autoPlay}
            muted={muted}
            loop={loop}
            playsInline={playsInline}
            preload="metadata"
            poster={poster}
          />
        ) : (
          <video
            className="w-full h-full object-cover"
            muted={muted}
            loop={loop}
            playsInline={playsInline}
            preload="metadata"
            poster={poster}
            autoPlay={autoPlay}
          >
            <source src={src} type="video/mp4" />
            Je browser ondersteunt geen video.
          </video>
        )
      ) : (
        poster && (
          <img
            src={poster}
            alt="Video poster"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )
      )}
    </div>
  )
}
