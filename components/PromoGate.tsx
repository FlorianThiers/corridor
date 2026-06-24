import { getActivePromos } from '@/lib/site-promos'
import { PromoBanner } from '@/components/PromoBanner'
import { PromoFloating } from '@/components/PromoFloating'

type PromoVariant = 'banners' | 'floatings'

interface PromoGateProps {
  variant: PromoVariant
  anchorOverrides?: Record<string, string>
}

export function PromoGate({ variant, anchorOverrides }: PromoGateProps) {
  const promos = getActivePromos()
  if (promos.length === 0) return null

  if (variant === 'banners') {
    return (
      <>
        {promos.map((promo) => (
          <PromoBanner key={promo.id} promo={promo} />
        ))}
      </>
    )
  }

  return (
    <>
      {promos.map((promo) => (
        <PromoFloating
          key={promo.id}
          promo={promo}
          ctaHref={anchorOverrides?.[promo.id] ?? `#${promo.anchorId}`}
        />
      ))}
    </>
  )
}

export function hasActivePromoFloatings(): boolean {
  return getActivePromos().length > 0
}
