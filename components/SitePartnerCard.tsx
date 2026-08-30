import Image from 'next/image'
import type { SitePartner } from '@/lib/site-partners'

interface SitePartnerCardProps {
  partner: SitePartner
  logoUrl?: string
}

export function SitePartnerCard({ partner, logoUrl }: SitePartnerCardProps) {
  const initials = partner.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  return (
    <article className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 card-hover h-full flex flex-col">
      <div className="mb-4 flex justify-center min-h-[6rem] items-center">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={`Logo ${partner.name}`}
            width={120}
            height={96}
            className="h-24 w-auto max-w-full object-contain"
          />
        ) : (
          <div
            className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/80 text-lg font-bold text-gray-700 shadow-inner"
            aria-hidden
          >
            {initials}
          </div>
        )}
      </div>
      <h3 className="text-lg font-bold text-gray-800 mb-2 text-center">{partner.name}</h3>
      <p className="text-gray-700 text-sm text-center flex-1">{partner.description}</p>
      {partner.websiteUrl && (
        <a
          href={partner.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-700 hover:text-blue-900 text-sm underline mt-4 text-center"
        >
          Website
        </a>
      )}
    </article>
  )
}
