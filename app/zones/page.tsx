import { createClient } from '@/lib/supabase/server'
import { getZones } from '@/lib/database'
import type { Zone } from '@/types'
import { PageSection } from '@/components/PageSection'
import { PageContainer } from '@/components/PageContainer'
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
          <h1 className="mb-2 text-center text-2xl font-bold text-gray-800 md:text-3xl">Zones</h1>
          <p className="mx-auto mb-8 max-w-xl text-center text-sm text-gray-600">
            Klik op een zone voor details en foto&apos;s.
          </p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
