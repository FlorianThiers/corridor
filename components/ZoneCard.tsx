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
  const labels = zone.field_labels?.filter(Boolean) ?? []
  const image = coverUrl || zone.cover_url || null

  const inner = (
    <>
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-pink-200 via-white/80 to-gray-200" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
      <div className="relative z-10 flex h-full min-h-[220px] flex-col justify-end p-6 text-white">
        <h3 className="text-2xl font-bold drop-shadow-sm">
          Zone {zone.zone_number}: {zone.name}
        </h3>
        {zone.description && (
          <p className="mt-2 line-clamp-3 text-sm text-white/90 whitespace-pre-line">
            {zone.description}
          </p>
        )}
        {labels.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {labels.map((label) => (
              <li
                key={label}
                className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm"
              >
                {label}
              </li>
            ))}
          </ul>
        )}
        {asLink && (
          <span className="mt-4 text-sm font-medium text-pink-200 group-hover:text-white">
            Bekijk zone →
          </span>
        )}
      </div>
    </>
  )

  const className =
    'group relative block overflow-hidden rounded-3xl bg-white/40 shadow-sm card-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500'

  if (!asLink) {
    return <div className={className}>{inner}</div>
  }

  return (
    <Link href={target} className={className} aria-label={`Zone ${zone.zone_number}: ${zone.name}`}>
      {inner}
    </Link>
  )
}
