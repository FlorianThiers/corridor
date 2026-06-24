import Image from 'next/image'
import Link from 'next/link'
import type { SitePromo } from '@/lib/site-promos'
import { posterHref } from '@/lib/site-promos'
import { PageSection } from '@/components/PageSection'
import { PageContainer } from '@/components/PageContainer'

interface PromoBannerProps {
  promo: SitePromo
}

export function PromoBanner({ promo }: PromoBannerProps) {
  const imageLink = posterHref(promo)

  return (
    <PageSection id={`${promo.id}-promo`} className={`${promo.sectionClass} !py-12 md:!py-16`}>
      <PageContainer>
        <div className={`bg-white/70 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden card-hover border ${promo.borderClass}`}>
          <div className="grid md:grid-cols-[minmax(0,280px)_1fr] lg:grid-cols-[minmax(0,320px)_1fr] gap-0 items-stretch">
            <Link
              href={imageLink}
              className="relative block aspect-[3/4] md:aspect-auto md:min-h-full"
              style={{ backgroundColor: promo.imageBg }}
              aria-label={`${promo.title} — ${promo.signupLabel ?? promo.ctaLabel}`}
              {...(promo.signupHref ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              <Image
                src={promo.imageSrc}
                alt={promo.imageAlt}
                fill
                className="object-contain p-3 md:p-4"
                sizes="(max-width: 768px) 100vw, 320px"
                priority={promo.id === 'summer'}
              />
            </Link>

            <div className="flex flex-col justify-center p-6 md:p-10 text-center md:text-left">
              <p className="text-sm font-semibold uppercase tracking-wider text-gray-700/80 mb-2">
                {promo.badgeLabel}
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 graffiti-text mb-3">
                {promo.title}
              </h2>
              <p className="text-lg text-gray-700 mb-2">{promo.tagline}</p>
              <p className="text-gray-600 mb-6">
                <span className="font-medium text-gray-800">{promo.dates}</span>
                {promo.location && (
                  <>
                    <span className="mx-2 text-gray-400">·</span>
                    {promo.location}
                  </>
                )}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <Link
                  href={promo.ctaHref}
                  className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-full font-medium transition-all hover:scale-105 shadow-lg"
                >
                  {promo.ctaLabel}
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                {promo.signupHref && promo.signupLabel && (
                  <Link
                    href={promo.signupHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-6 py-3 bg-white/80 hover:bg-white text-gray-900 rounded-full font-medium transition-all hover:scale-105 shadow-md border border-gray-200"
                  >
                    {promo.signupLabel}
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </PageSection>
  )
}
