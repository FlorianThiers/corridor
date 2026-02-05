import { createClient } from '@/lib/supabase/server'
import { getEvenementen } from '@/lib/database'
import type { Evenement } from '@/types'
import { PageSection } from '@/components/PageSection'
import { PageContainer } from '@/components/PageContainer'
import { PageTitle } from '@/components/PageTitle'
import { EventCard } from '@/components/EventCard'
import { Footer } from '@/components/Footer'
import { BackgroundImage } from '@/components/BackgroundImage'

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

  // Scheid evenementen in opkomende en afgelopen
  const now = new Date()
  const opkomendeEvenementen = evenementen
    .filter(event => {
      const eventDate = new Date(event.start_datetime)
      return eventDate >= now
    })
    .sort((a, b) => {
      // Sorteer chronologisch (oudste eerst - eerst volgende van boven)
      return new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime()
    })

  const afgelopenEvenementen = evenementen
    .filter(event => {
      const eventDate = new Date(event.start_datetime)
      return eventDate < now
    })
    .sort((a, b) => {
      // Sorteer omgekeerd chronologisch (nieuwste eerst - laatste van boven)
      return new Date(b.start_datetime).getTime() - new Date(a.start_datetime).getTime()
    })

  return (
    <div className="page-background">
      <BackgroundImage />
      <PageSection className="min-h-screen">
        <PageContainer>
          <PageTitle>Evenementen</PageTitle>
          
          {/* Opkomende Evenementen Sectie */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Opkomende Evenementen</h2>
            {opkomendeEvenementen.length === 0 ? (
              <p className="text-gray-600 text-center bg-white/60 backdrop-blur-sm rounded-3xl p-6">
                Geen opkomende evenementen.
              </p>
            ) : (
              <div className="space-y-6">
                {opkomendeEvenementen.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>

          {/* Afgelopen Evenementen Sectie */}
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
