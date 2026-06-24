import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getEvenementen } from '@/lib/database'
import { Calendar } from '@/components/Calendar'
import { SportFilter } from '@/components/SportFilter'
import { PageSection } from '@/components/PageSection'
import { PageContainer } from '@/components/PageContainer'
import { PageTitle } from '@/components/PageTitle'
import { Footer } from '@/components/Footer'
import { BackgroundImage } from '@/components/BackgroundImage'
import { PromoGate, hasActivePromoFloatings } from '@/components/PromoGate'
import { isSportSlug } from '@/lib/sports'

import type { Evenement } from '@/types'

export const revalidate = 60
export const dynamic = 'force-dynamic'

interface AgendaPageProps {
  searchParams: Promise<{ sport?: string }>
}

export default async function AgendaPage({ searchParams }: AgendaPageProps) {
  const { sport } = await searchParams
  const activeSport = isSportSlug(sport) ? sport : undefined

  let evenementen: Evenement[] = []

  try {
    const supabase = await createClient()
    evenementen = await getEvenementen(supabase)
  } catch (error) {
    console.error('Error loading evenementen:', error)
  }

  const showPromoFloatings = hasActivePromoFloatings()

  return (
    <div className="page-background">
      <BackgroundImage />
      <PageSection className="min-h-screen">
        <PageContainer maxWidth="7xl" className={showPromoFloatings ? 'lg:px-56' : undefined}>
          <PageTitle>Agenda</PageTitle>
          <p className="text-center text-gray-700 max-w-3xl mx-auto mb-6 -mt-6">
            Kleurcodering per sport · amberen rand = highlight-evenement
          </p>

          <Suspense fallback={null}>
            <SportFilter activeSport={activeSport} basePath="/agenda" />
          </Suspense>

          <PromoGate
            variant="floatings"
            anchorOverrides={{ summer: '/activiteiten#zomer-activiteiten' }}
          />
          <Calendar events={evenementen} sportFilter={activeSport} />
        </PageContainer>
      </PageSection>
      <Footer />
    </div>
  )
}
