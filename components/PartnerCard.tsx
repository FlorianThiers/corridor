import Image from 'next/image'
import type { Partner } from '@/types'

interface PartnerCardProps {
  partner: Partner
}

export function PartnerCard({ partner }: PartnerCardProps) {
  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 card-hover text-center">
      {partner.logo_url && (
        <div className="mb-4 flex justify-center">
          <Image
            src={partner.logo_url}
            alt={partner.name}
            width={96}
            height={96}
            className="h-24 w-auto object-contain max-w-full"
          />
        </div>
      )}
      <h3 className="text-xl font-bold text-gray-800 mb-2">{partner.name}</h3>
      {partner.description && (
        <p className="text-gray-700 text-sm mb-3">{partner.description}</p>
      )}
      {partner.zones && (
        <p className="text-sm text-gray-600 mt-2">
          Zone {partner.zones.zone_number}: {partner.zones.name}
        </p>
      )}
      {partner.website_url && (
        <a
          href={partner.website_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 text-sm underline mt-2 inline-block"
        >
          Bezoek website
        </a>
      )}
    </div>
  )
}
