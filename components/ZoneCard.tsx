import Link from 'next/link'
import type { Zone } from '@/types'

interface ZoneCardProps {
  zone: Zone
  href?: string
  /** When false, render a non-link card (admin edit grid). Default true. */
  asLink?: boolean
  /** Override cover (e.g. first approved photo). */
  coverUrl?: string | null
}

export function ZoneCard({ zone, href, asLink = true, coverUrl }: ZoneCardProps) {
  const target = href ?? `/zones/${zone.zone_number}`
  const image = coverUrl || zone.cover_url || null
  const label = `Zone ${zone.zone_number}: ${zone.name}`

  const inner = image ? (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image}
        alt=""
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
      />
      {/* Thin bottom scrub so small label stays readable */}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/55 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 z-10 p-3">
        <p className="text-sm font-semibold text-white drop-shadow-md">{label}</p>
      </div>
    </>
  ) : (
    <>
      <div className="absolute inset-0 bg-gradient-to-br from-pink-200 via-white/80 to-gray-200" />
      <div className="relative z-10 flex h-full min-h-[200px] flex-col items-center justify-center p-5 text-center">
        <h3 className="text-lg font-bold text-gray-800">{label}</h3>
        {zone.description && (
          <p className="mt-2 line-clamp-2 text-xs text-gray-600 whitespace-pre-line">
            {zone.description}
          </p>
        )}
      </div>
    </>
  )

  const className = image
    ? 'group relative block aspect-[4/3] overflow-hidden rounded-3xl bg-gray-200 shadow-sm card-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500'
    : 'group relative block overflow-hidden rounded-3xl bg-white/40 shadow-sm card-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500'

  if (!asLink) {
    return <div className={className}>{inner}</div>
  }

  return (
    <Link href={target} className={className} aria-label={label}>
      {inner}
    </Link>
  )
}
