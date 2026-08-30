'use client'

import Image from 'next/image'
import type { HistoryPhoto } from '@/lib/geschiedenis'

interface HistoryPhotoMarqueeProps {
  photos: HistoryPhoto[]
  direction?: 'left' | 'right'
  speedSeconds?: number
}

function MarqueeRow({
  photos,
  direction = 'left',
  speedSeconds = 80,
}: HistoryPhotoMarqueeProps) {
  const duplicated = [...photos, ...photos]

  return (
    <div className="history-marquee overflow-hidden">
      <div
        className={`history-marquee-track flex items-stretch gap-4 ${direction === 'right' ? 'history-marquee-track-reverse' : ''}`}
        style={{ animationDuration: `${speedSeconds}s` }}
      >
        {duplicated.map((photo, index) => (
          <figure
            key={`${photo.src}-${index}`}
            className="history-marquee-item group relative shrink-0 overflow-hidden rounded-2xl bg-stone-200/90 shadow-md"
          >
            <div className="flex h-44 items-center justify-center px-1 md:h-52 md:group-hover:h-64 md:group-hover:min-w-[min(320px,70vw)] transition-all duration-300">
              <Image
                src={photo.src}
                alt={photo.alt}
                width={480}
                height={360}
                className="h-full w-auto max-w-[min(280px,55vw)] object-contain transition-transform duration-300 group-hover:scale-[1.02] md:group-hover:max-w-[min(360px,70vw)]"
                sizes="280px"
              />
            </div>
            {photo.caption && (
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-3 py-2 text-sm text-white">
                {photo.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </div>
  )
}

export function HistoryPhotoMarquee({ photos }: { photos: HistoryPhoto[] }) {
  const firstHalf = photos.slice(0, Math.ceil(photos.length / 2))
  const secondHalf = photos.slice(Math.ceil(photos.length / 2))

  return (
    <div className="space-y-4 py-2">
      <MarqueeRow photos={firstHalf} direction="left" speedSeconds={90} />
      <MarqueeRow photos={secondHalf.length > 0 ? secondHalf : firstHalf} direction="right" speedSeconds={75} />
    </div>
  )
}
