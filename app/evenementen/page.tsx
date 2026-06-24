import { createClient } from '@/lib/supabase/server'
import { getEvenementen } from '@/lib/database'
import type { Evenement } from '@/types'
import { PageSection } from '@/components/PageSection'
import { PageContainer } from '@/components/PageContainer'
import { PageTitle } from '@/components/PageTitle'
import { EventCard } from '@/components/EventCard'
import { Footer } from '@/components/Footer'
import { BackgroundImage } from '@/components/BackgroundImage'
import { PromoGate, hasActivePromoFloatings } from '@/components/PromoGate'
import { isFestEvent } from '@/lib/site-promos'
import { splitByKind } from '@/lib/agenda-helpers'
import Link from 'next/link'

export const revalidate = 60
export const dynamic = 'force-dynamic'

export default async function EvenementenPage() {
  let items: Evenement[] = []

  try {
    const supabase = await createClient()
    items = await getEvenementen(supabase)
  } catch (error) {
    console.error('Error loading evenementen:', error)
  }

  const now = new Date()
  const upcoming = items
    .filter((item) => new Date(item.start_datetime) >= now)
    .sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime())

  const past = items
    .filter((item) => new Date(item.start_datetime) < now)
    .sort((a, b) => new Date(b.start_datetime).getTime() - new Date(a.start_datetime).getTime())

  const { evenementen: opkomendeEvenementen, activiteiten: opkomendeActiviteiten } = splitByKind(upcoming)
  const { evenementen: afgelopenEvenementen } = splitByKind(past)

  const festOpkomend = opkomendeEvenementen.filter(
    (event) => event.is_highlight || isFestEvent(event.title)
  )
  const overigeOpkomend = opkomendeEvenementen.filter(
    (event) => !event.is_highlight && !isFestEvent(event.title)
  )
  const showPromoFloatings = hasActivePromoFloatings()

  return (
    <div className="page-background">
      <BackgroundImage />
      <PageSection className="min-h-screen">
        <PageContainer className={showPromoFloatings ? 'lg:px-56' : undefined}>
          <PageTitle>Evenementen</PageTitle>
          <p className="text-center text-gray-700 max-w-3xl mx-auto mb-10 -mt-6">
            Hoogtepunten en eenmalige momenten — van het festival tot speciale acties in de buurt.
          </p>

          <PromoGate variant="floatings" anchorOverrides={{ summer: '/activiteiten#zomer-activiteiten' }} />

          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Opkomende evenementen</h2>
            {opkomendeEvenementen.length === 0 ? (
              <p className="text-gray-600 text-center bg-white/60 backdrop-blur-sm rounded-3xl p-6">
                Geen opkomende evenementen.
              </p>
            ) : (
              <div className="space-y-6">
                {festOpkomend.length > 0 && (
                  <div id="corri-dor-fest" className="scroll-mt-28 space-y-4">
                    <h3 className="text-2xl font-bold text-gray-800">Corri D&apos;Or Fest</h3>
                    {festOpkomend.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                )}
                {overigeOpkomend.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>

          {opkomendeActiviteiten.length > 0 && (
            <div className="mb-12 bg-white/40 backdrop-blur-sm rounded-3xl p-6 border border-teal-200/40">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Terugkerende activiteiten</h2>
              <p className="text-gray-600 mb-4">
                Zomersport en wekelijks aanbod staan apart — niet als evenementenlijst.
              </p>
              <Link
                href="/activiteiten"
                className="inline-flex items-center px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-full font-medium transition-all hover:scale-105"
              >
                Bekijk alle activiteiten
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}

          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Afgelopen evenementen</h2>
            {afgelopenEvenementen.length === 0 ? (
              <p className="text-gray-600 text-center bg-white/60 backdrop-blur-sm rounded-3xl p-6">
                Geen afgelopen evenementen.
              </p>
            ) : (
              <div className="space-y-6">
                {afgelopenEvenementen.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>
        </PageContainer>
      </PageSection>
      <Footer />
    </div>
  )
}
