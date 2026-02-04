import type { Zone } from '@/types'

interface ZoneCardProps {
  zone: Zone
}

export function ZoneCard({ zone }: ZoneCardProps) {
  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 card-hover">
      <div className="w-12 h-12 mx-auto mb-4 text-gray-600">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-3 text-center">
        Zone {zone.zone_number}: {zone.name}
      </h3>
      {zone.description && (
        <p className="text-gray-700 text-center">{zone.description}</p>
      )}
    </div>
  )
}
