'use client'

import { ZoomableLightbox } from '@/components/ZoomableLightbox'

const POSTERS = [
  {
    day: 'Vrijdag 25 september',
    src: '/corri-dor-fest-programma-vrijdag.webp',
    alt: "Programma Corri D'Or Fest — vrijdag 25 september",
  },
  {
    day: 'Zaterdag 26 september',
    src: '/corri-dor-fest-programma-zaterdag.webp',
    alt: "Programma Corri D'Or Fest — zaterdag 26 september",
  },
] as const

export function FestProgramPosters() {
  return (
    <div id="fest-programma" className="scroll-mt-28 space-y-4">
      <div>
        <h3 className="text-2xl font-bold text-gray-800">Dagprogramma</h3>
        <p className="text-gray-600 mt-1">
          Het volledige schema per zone — tik een poster om te vergroten.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {POSTERS.map((poster) => (
          <div key={poster.src} className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-700">
              {poster.day}
            </p>
            <ZoomableLightbox
              src={poster.src}
              alt={poster.alt}
              thumbClassName="aspect-[1024/723] w-full object-contain bg-[#f7f0d8]"
              className="border border-amber-200/70 shadow-lg"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
