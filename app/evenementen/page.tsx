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

  return (
    <div className="page-background">
      <BackgroundImage />
      <PageSection className="min-h-screen">
        <PageContainer>
          <PageTitle>Evenementen</PageTitle>
          <div className="space-y-6">
            {evenementen.length === 0 ? (
              <p className="text-gray-600 text-center">Geen evenementen gevonden.</p>
            ) : (
              evenementen.map((event) => (
                <EventCard key={event.id} event={event} />
              ))
            )}
          </div>
        </PageContainer>
      </PageSection>
      <Footer />
    </div>
  )
}
