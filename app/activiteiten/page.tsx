import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getEvenementen } from '@/lib/database'
import type { Evenement } from '@/types'
import { PageSection } from '@/components/PageSection'
import { PageContainer } from '@/components/PageContainer'
import { PageTitle } from '@/components/PageTitle'
import { ActivityCard } from '@/components/ActivityCard'
import { SportFilter } from '@/components/SportFilter'
import { Footer } from '@/components/Footer'
import { BackgroundImage } from '@/components/BackgroundImage'
import { PromoGate, hasActivePromoFloatings } from '@/components/PromoGate'
import { groupActiviteiten, splitByKind } from '@/lib/agenda-helpers'
import { isSportSlug } from '@/lib/sports'

export const revalidate = 60
export const dynamic = 'force-dynamic'

interface ActiviteitenPageProps {
  searchParams: Promise<{ sport?: string }>
}

export default async function ActiviteitenPage({ searchParams }: ActiviteitenPageProps) {
  const { sport } = await searchParams
  const activeSport = isSportSlug(sport) ? sport : undefined

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

  const opkomende = groupActiviteiten(opkomendeRaw, now).filter(
    (activity) => !activeSport || activity.sportSlug === activeSport
  )
  const afgelopen = groupActiviteiten(afgelopenRaw, now).filter(
    (activity) => !activeSport || activity.sportSlug === activeSport
  )
  const showPromoFloatings = hasActivePromoFloatings()

  return (
    <div className="page-background">
      <BackgroundImage />
      <PageSection className="min-h-screen">
        <PageContainer className={showPromoFloatings ? 'lg:px-56' : undefined}>
          <PageTitle>Activiteiten</PageTitle>
          <p className="text-center text-gray-700 max-w-3xl mx-auto mb-6 -mt-6">
            Terugkerend sport- en animatieaanbod. Filter op sport om snel te vinden wat je zoekt.
          </p>

          <Suspense fallback={null}>
            <SportFilter activeSport={activeSport} />
          </Suspense>

          <PromoGate variant="floatings" anchorOverrides={{ summer: '#zomer-activiteiten' }} />

          <div className="mb-12" id="zomer-activiteiten">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Komende activiteiten</h2>
            {opkomende.length === 0 ? (
              <p className="text-gray-600 text-center bg-white/60 backdrop-blur-sm rounded-3xl p-6">
                Geen komende activiteiten{activeSport ? ' voor deze sport' : ''}.
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
                Geen afgelopen activiteiten{activeSport ? ' voor deze sport' : ''}.
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
