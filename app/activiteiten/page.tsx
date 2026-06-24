import { createClient } from '@/lib/supabase/server'
import { getEvenementen } from '@/lib/database'
import type { Evenement } from '@/types'
import { PageSection } from '@/components/PageSection'
import { PageContainer } from '@/components/PageContainer'
import { PageTitle } from '@/components/PageTitle'
import { ActivityCard } from '@/components/ActivityCard'
import { Footer } from '@/components/Footer'
import { BackgroundImage } from '@/components/BackgroundImage'
import { PromoGate, hasActivePromoFloatings } from '@/components/PromoGate'
import { groupActiviteiten, splitByKind } from '@/lib/agenda-helpers'

export const revalidate = 60
export const dynamic = 'force-dynamic'

export default async function ActiviteitenPage() {
  let items: Evenement[] = []

  try {
    const supabase = await createClient()
    items = await getEvenementen(supabase)
  } catch (error) {
    console.error('Error loading activiteiten:', error)
  }

  const now = new Date()
  const { activiteiten: opkomendeRaw } = splitByKind(
    items.filter((item) => new Date(item.start_datetime) >= now)
  )
  const { activiteiten: afgelopenRaw } = splitByKind(
    items.filter((item) => new Date(item.start_datetime) < now)
  )

  const opkomende = groupActiviteiten(opkomendeRaw, now)
  const afgelopen = groupActiviteiten(afgelopenRaw, now)
  const showPromoFloatings = hasActivePromoFloatings()

  return (
    <div className="page-background">
      <BackgroundImage />
      <PageSection className="min-h-screen">
        <PageContainer className={showPromoFloatings ? 'lg:px-56' : undefined}>
          <PageTitle>Activiteiten</PageTitle>
          <p className="text-center text-gray-700 max-w-3xl mx-auto mb-10 -mt-6">
            Terugkerend sport- en animatieaanbod. De site blijft ook buiten deze momenten open om te sporten.
          </p>

          <PromoGate variant="floatings" anchorOverrides={{ summer: '#zomer-activiteiten' }} />

          <div className="mb-12" id="zomer-activiteiten">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Komende activiteiten</h2>
            {opkomende.length === 0 ? (
              <p className="text-gray-600 text-center bg-white/60 backdrop-blur-sm rounded-3xl p-6">
                Geen komende activiteiten.
              </p>
            ) : (
              <div className="space-y-4">
                {opkomende.map((activity) => (
                  <ActivityCard key={activity.key} activity={activity} />
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Afgelopen activiteiten</h2>
            {afgelopen.length === 0 ? (
              <p className="text-gray-600 text-center bg-white/60 backdrop-blur-sm rounded-3xl p-6">
                Geen afgelopen activiteiten.
              </p>
            ) : (
              <div className="space-y-4">
                {afgelopen.map((activity) => (
                  <ActivityCard key={activity.key} activity={activity} />
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
