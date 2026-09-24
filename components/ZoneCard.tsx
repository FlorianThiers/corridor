import Link from 'next/link'
import type { Zone } from '@/types'

interface ZoneCardProps {
  zone: Zone
  href?: string
}

export function ZoneCard({ zone, href }: ZoneCardProps) {
  const target = href ?? `/zones/${zone.zone_number}`
  const labels = zone.field_labels?.filter(Boolean) ?? []

  return (
    <Link
      href={target}
      className="block bg-white/60 backdrop-blur-sm rounded-3xl p-6 card-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500"
    >
      {zone.cover_url ? (
        <div className="mb-4 overflow-hidden rounded-2xl aspect-[16/10] bg-gray-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={zone.cover_url}
            alt={`Zone ${zone.zone_number}: ${zone.name}`}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="w-12 h-12 mx-auto mb-4 text-gray-600">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      )}
      <h3 className="text-2xl font-bold text-gray-800 mb-3 text-center">
        Zone {zone.zone_number}: {zone.name}
      </h3>
      {zone.description && (
        <p className="text-gray-700 text-center whitespace-pre-line">{zone.description}</p>
      )}
      {labels.length > 0 && (
        <ul className="mt-4 flex flex-wrap justify-center gap-2">
          {labels.map((label) => (
            <li
              key={label}
              className="rounded-full bg-pink-100/80 px-3 py-1 text-xs font-medium text-pink-800"
            >
              {label}
            </li>
          ))}
        </ul>
      )}
    </Link>
  )
}
