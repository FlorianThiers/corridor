import { createClient } from '@/lib/supabase/server'
import { getCorristories } from '@/lib/database'
import type { Corristory } from '@/types'
import { PageSection } from '@/components/PageSection'
import { PageContainer } from '@/components/PageContainer'
import { PageTitle } from '@/components/PageTitle'
import { CorristoryCard } from '@/components/CorristoryCard'
import { Footer } from '@/components/Footer'
import { BackgroundImage } from '@/components/BackgroundImage'

// Revalidate every 60 seconds to reduce requests while keeping data fresh
export const revalidate = 60
export const dynamic = 'force-dynamic'

export default async function CorristoriesPage() {
  let corristories: Corristory[] = []
  
  try {
    const supabase = await createClient()
    corristories = await getCorristories(supabase)
  } catch (error) {
    console.error('Error loading corristories:', error)
  }

  return (
    <div className="page-background">
      <BackgroundImage />
      <PageSection className="min-h-screen">
        <PageContainer>
          <PageTitle>Corristories</PageTitle>
          <p className="text-center text-lg text-gray-700 mb-8">
            Verhalen van onder de brug
          </p>
          <div className="space-y-8">
            {corristories.length === 0 ? (
              <p className="text-gray-600 text-center">Geen corristories gevonden.</p>
            ) : (
              corristories.map((story) => (
                <CorristoryCard key={story.id} story={story} />
              ))
            )}
          </div>
        </PageContainer>
      </PageSection>
      <Footer />
    </div>
  )
}
