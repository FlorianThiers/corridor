'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { SitePromo } from '@/lib/site-promos'
import { posterHref } from '@/lib/site-promos'

interface PromoFloatingProps {
  promo: SitePromo
  ctaHref?: string
}

export function PromoFloating({ promo, ctaHref }: PromoFloatingProps) {
  const linkHref = ctaHref ?? posterHref(promo)
  const isExternal = linkHref.startsWith('http')
  const hoverLabel = promo.signupHref && !ctaHref ? promo.signupLabel : promo.ctaLabel
  const positionClass = promo.floatingPosition === 'left' ? 'site-promo-floating-left' : 'site-promo-floating-right'

  return (
    <>
      <aside
        className={`site-promo-floating hidden lg:block ${positionClass}`}
        aria-label={`${promo.title} promotie`}
      >
        <Link
          href={linkHref}
          className={`site-promo-float group block relative w-44 xl:w-52 rounded-2xl overflow-hidden shadow-2xl ring-2 ${promo.borderClass} transition-transform hover:scale-105`}
          style={{ backgroundColor: promo.imageBg }}
          title={`${promo.title} — ${promo.dates}`}
          {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          <Image
            src={promo.imageSrc}
            alt={promo.imageAlt}
            width={400}
            height={533}
            className="w-full h-auto object-contain p-2"
          />
          <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-3 py-3 text-center text-xs font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity">
            {hoverLabel}
          </span>
        </Link>
      </aside>

      <div className="lg:hidden mb-8">
        <Link
          href={linkHref}
          className={`block bg-white/70 backdrop-blur-md rounded-3xl overflow-hidden shadow-lg border ${promo.borderClass} card-hover`}
          {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          <div className="grid grid-cols-[120px_1fr] sm:grid-cols-[140px_1fr] gap-0">
            <div className="relative min-h-[160px]" style={{ backgroundColor: promo.imageBg }}>
              <Image
                src={promo.imageSrc}
                alt={promo.imageAlt}
                fill
                className="object-contain p-2"
                sizes="140px"
              />
            </div>
            <div className="p-4 flex flex-col justify-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-700/80 mb-1">
                {promo.badgeLabel}
              </p>
              <h2 className="text-xl font-bold text-gray-800 leading-tight mb-1">{promo.title}</h2>
              <p className="text-sm text-gray-600">{promo.dates}</p>
            </div>
          </div>
        </Link>
      </div>
    </>
  )
}
