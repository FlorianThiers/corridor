'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { SPORT_OPTIONS, type SportSlug } from '@/lib/sports'

interface SportFilterProps {
  activeSport?: SportSlug
  basePath?: string
}

export function SportFilter({ activeSport, basePath = '/activiteiten' }: SportFilterProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const path = basePath || pathname

  const buildHref = (sport?: SportSlug) => {
    const params = new URLSearchParams(searchParams.toString())
    if (sport) params.set('sport', sport)
    else params.delete('sport')
    const query = params.toString()
    return query ? `${path}?${query}` : path
  }

  return (
    <div className="flex flex-wrap justify-center gap-2 mb-8">
      <Link
        href={buildHref()}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
          !activeSport
            ? 'bg-gray-900 text-white shadow-md'
            : 'bg-white/70 text-gray-700 hover:bg-white'
        }`}
      >
        Alle sporten
      </Link>
      {SPORT_OPTIONS.map((sport) => (
        <Link
          key={sport.slug}
          href={buildHref(sport.slug)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all border-2 ${
            activeSport === sport.slug
              ? `${sport.badgeClass} ${sport.borderClass}`
              : 'bg-white/70 text-gray-700 border-transparent hover:bg-white'
          }`}
        >
          {sport.label}
        </Link>
      ))}
    </div>
  )
}
