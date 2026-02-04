import { createClient } from '@/lib/supabase/server'
import { getPartners } from '@/lib/database'
import type { Partner } from '@/types'
import { PageSection } from '@/components/PageSection'
import { PageContainer } from '@/components/PageContainer'
import { PageTitle } from '@/components/PageTitle'
import { PartnerCard } from '@/components/PartnerCard'
import { Footer } from '@/components/Footer'
import { BackgroundImage } from '@/components/BackgroundImage'

// Revalidate every 60 seconds to reduce requests while keeping data fresh
export const revalidate = 60
export const dynamic = 'force-dynamic'

export default async function PartnersPage() {
  let partners: Partner[] = []
  
  try {
    const supabase = await createClient()
    partners = await getPartners(supabase)
  } catch (error) {
    console.error('Error loading partners:', error)
  }

  const internPartners = partners.filter((p) => !p.type || p.type === 'intern')
  const externPartners = partners.filter((p) => p.type === 'extern')

  return (
    <div className="page-background">
      <BackgroundImage />
      <PageSection className="min-h-screen">
        <PageContainer>
          <PageTitle>Onze Partners</PageTitle>
          
          <div className="bg-white/40 backdrop-blur-sm rounded-3xl p-8 text-center card-hover mb-8">
            <p className="text-gray-700 mb-4">
              Het ecosysteem Corri d'Or bestaat uit partners, buurtbewoners, sporters, jongeren, samen met iedereen creëren we warme welkomplek.
            </p>
            <p className="text-gray-700 mb-4">
              Deze organisaties zijn betrokken in het leerecosysteem: <strong>Sportaround</strong>, <strong>Ghent Basketball</strong>, <strong>Skateboard Academy</strong>, <strong>Lejo vzw</strong> en <strong>FROS</strong> met de ondersteuning van <strong>Arteveldehogeschool</strong> en <strong>Matty Zighem</strong>.
            </p>
            <p className="text-gray-700 mb-4">
              We werken nauw samen met <strong>RC17</strong>, <strong>Flow de Gand</strong>, <strong>Asgaard</strong>, <strong>de vierde zaal</strong>, <strong>de volkstuinen</strong> en de oorspronkelijke wijkbudget indieners om deze droom waar te maken.
            </p>
            <p className="text-sm text-gray-600 mb-6">
              Corridor wordt mede mogelijk gemaakt door het <strong>Fonds Tijdelijke invullingen van Stad Gent</strong>, de <strong>Warmste Week</strong>, <strong>Streekfonds Oost-Vlaanderen</strong> en <strong>Europa WSE</strong>.
            </p>
            
            <div className="mt-8 text-center">
              <a
                href="/LogoCorridor.webp"
                download="LogoCorridor.webp"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/40 backdrop-blur-sm rounded-3xl text-gray-800 hover:bg-white/60 hover:scale-105 transition-all shadow-lg card-hover font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Logo
              </a>
            </div>
          </div>

          {/* Intern Partners */}
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 graffiti-text text-center mb-8">
              Interne Partners
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {internPartners.length === 0 ? (
                <p className="text-gray-600 text-center col-span-full">Geen interne partners gevonden.</p>
              ) : (
                internPartners.map((partner) => (
                  <PartnerCard key={partner.id} partner={partner} />
                ))
              )}
            </div>
          </div>

          {/* Extern Partners */}
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 graffiti-text text-center mb-8">
              Externe Partners
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {externPartners.length === 0 ? (
                <p className="text-gray-600 text-center col-span-full">Geen externe partners gevonden.</p>
              ) : (
                externPartners.map((partner) => (
                  <PartnerCard key={partner.id} partner={partner} />
                ))
              )}
            </div>
          </div>
        </PageContainer>
      </PageSection>
      <Footer />
    </div>
  )
}
