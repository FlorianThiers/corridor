import { createClient } from '@/lib/supabase/server'
import { getZones } from '@/lib/database'
import type { Zone } from '@/types'
import { PageSection } from '@/components/PageSection'
import { PageContainer } from '@/components/PageContainer'
import { PageTitle } from '@/components/PageTitle'
import { ZoneCard } from '@/components/ZoneCard'
import { Footer } from '@/components/Footer'
import { BackgroundImage } from '@/components/BackgroundImage'

// Revalidate every 60 seconds to reduce requests while keeping data fresh
export const revalidate = 60
export const dynamic = 'force-dynamic'

export default async function ZonesPage() {
  let zones: Zone[] = []
  
  try {
    const supabase = await createClient()
    zones = await getZones(supabase)
  } catch (error) {
    console.error('Error loading zones:', error)
  }

  return (
    <div className="page-background">
      <BackgroundImage />
      <PageSection className="min-h-screen">
        <PageContainer>
          <PageTitle>Zones</PageTitle>
          <p className="mx-auto mb-10 max-w-2xl text-center text-gray-700">
            Klik op een zone voor foto&apos;s en details. Via QR kom je hier of rechtstreeks op een zone terecht.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {zones.length === 0 ? (
              <p className="text-gray-600 text-center col-span-full">Geen zones gevonden.</p>
            ) : (
              zones.map((zone) => (
                <ZoneCard key={zone.id} zone={zone} />
              ))
            )}
          </div>
        </PageContainer>
      </PageSection>
      <Footer />
    </div>
  )
}
