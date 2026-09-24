import { createClient } from '@/lib/supabase/server'
import { getPartners } from '@/lib/database'
import {
  SITE_PARTNER_SECTIONS,
  buildPartnerLogoMap,
  getSitePartnersByCategory,
  resolveSitePartnerLogo,
} from '@/lib/site-partners'
import { PageSection } from '@/components/PageSection'
import { PageContainer } from '@/components/PageContainer'
import { PageTitle } from '@/components/PageTitle'
import { SitePartnerCard } from '@/components/SitePartnerCard'
import { Footer } from '@/components/Footer'
import { BackgroundImage } from '@/components/BackgroundImage'

export const revalidate = 60
export const dynamic = 'force-dynamic'

export default async function PartnersPage() {
  let logoMap = new Map<string, string>()

  try {
    const supabase = await createClient()
    const dbPartners = await getPartners(supabase)
    logoMap = buildPartnerLogoMap(dbPartners)
  } catch (error) {
    console.error('Error loading partner logos:', error)
  }

  return (
    <div className="page-background">
      <BackgroundImage />
      <PageSection className="min-h-screen">
        <PageContainer>
          <PageTitle>Onze Partners</PageTitle>

          <div className="bg-white/40 backdrop-blur-sm rounded-3xl p-8 text-center card-hover mb-12 max-w-3xl mx-auto">
            <p className="text-gray-700 leading-relaxed">
              Corri d&apos;Or is een ecosysteem van sportclubs, buurtpartners, onderwijs en
              overheden. Samen met bewoners, sporters en jongeren maken we onder het viaduct een
              warme, overdekte plek om te bewegen en elkaar te ontmoeten.
            </p>
            <div className="mt-8">
              <a
                href="/LogoCorridor.png"
                download="Corridor-logo-corri-dor.png"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/40 backdrop-blur-sm rounded-3xl text-gray-800 hover:bg-white/60 hover:scale-105 transition-all shadow-lg card-hover font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download Corridor-logo
              </a>
            </div>
          </div>

          {SITE_PARTNER_SECTIONS.map((section) => {
            const partners = getSitePartnersByCategory(section.category)
            return (
              <section key={section.category} className="mb-14">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 graffiti-text text-center mb-3">
                  {section.title}
                </h2>
                {section.intro && (
                  <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">{section.intro}</p>
                )}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {partners.map((partner) => (
                    <SitePartnerCard
                      key={partner.id}
                      partner={partner}
                      logoUrl={resolveSitePartnerLogo(partner, logoMap)}
                    />
                  ))}
                </div>
              </section>
            )
          })}

          <p className="text-center text-sm text-gray-600 mt-4">
            Staat je organisatie er niet bij of klopt iets niet? Mail{' '}
            <a href="mailto:info@sportaround.be" className="underline hover:text-gray-800">
              info@sportaround.be
            </a>
            .
          </p>
        </PageContainer>
      </PageSection>
      <Footer />
    </div>
  )
}
