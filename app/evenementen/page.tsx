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
import { isFestEvent, isSummerEvent } from '@/lib/site-promos'

// Revalidate every 60 seconds to reduce requests while keeping data fresh
export const revalidate = 60
export const dynamic = 'force-dynamic'

export default async function EvenementenPage() {
  let evenementen: Evenement[] = []
  
  try {
    const supabase = await createClient()
    evenementen = await getEvenementen(supabase)
  } catch (error) {
    console.error('Error loading evenementen:', error)
  }

  const now = new Date()
  const opkomendeEvenementen = evenementen
    .filter(event => new Date(event.start_datetime) >= now)
    .sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime())

  const afgelopenEvenementen = evenementen
    .filter(event => new Date(event.start_datetime) < now)
    .sort((a, b) => new Date(b.start_datetime).getTime() - new Date(a.start_datetime).getTime())

  const summerOpkomend = opkomendeEvenementen.filter((event) => isSummerEvent(event.description))
  const festOpkomend = opkomendeEvenementen.filter((event) => isFestEvent(event.title))
  const overigeOpkomend = opkomendeEvenementen.filter(
    (event) => !isSummerEvent(event.description) && !isFestEvent(event.title)
  )
  const showPromoFloatings = hasActivePromoFloatings()

  return (
    <div className="page-background">
      <BackgroundImage />
      <PageSection className="min-h-screen">
        <PageContainer className={showPromoFloatings ? 'lg:px-56' : undefined}>
          <PageTitle>Evenementen</PageTitle>

          <PromoGate variant="floatings" anchorOverrides={{ summer: '#zomervakantie' }} />
          
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Opkomende Evenementen</h2>
            {opkomendeEvenementen.length === 0 ? (
              <p className="text-gray-600 text-center bg-white/60 backdrop-blur-sm rounded-3xl p-6">
                Geen opkomende evenementen.
              </p>
            ) : (
              <div className="space-y-6">
                {summerOpkomend.length > 0 && (
                  <div id="zomervakantie" className="scroll-mt-28 space-y-4">
                    <h3 className="text-2xl font-bold text-gray-800">Zomervakantie @ Corrid&apos;Or</h3>
                    {summerOpkomend.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                )}
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

          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Afgelopen Evenementen</h2>
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
