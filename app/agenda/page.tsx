import { createClient } from '@/lib/supabase/server'
import { getEvenementen } from '@/lib/database'
import { Calendar } from '@/components/Calendar'
import { PageSection } from '@/components/PageSection'
import { PageContainer } from '@/components/PageContainer'
import { PageTitle } from '@/components/PageTitle'
import { Footer } from '@/components/Footer'
import { BackgroundImage } from '@/components/BackgroundImage'
import { PromoGate, hasActivePromoFloatings } from '@/components/PromoGate'

import type { Evenement } from '@/types'

// Revalidate every 60 seconds to reduce requests while keeping data fresh
export const revalidate = 60
export const dynamic = 'force-dynamic'

export default async function AgendaPage() {
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
          <PromoGate
            variant="floatings"
            anchorOverrides={{ summer: '/activiteiten#zomer-activiteiten' }}
          />
          <Calendar events={evenementen} />
        </PageContainer>
      </PageSection>
      <Footer />
    </div>
  )
}
