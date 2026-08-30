import { HeroSection } from '@/components/HeroSection'
import { PromoGate } from '@/components/PromoGate'
import { IntroAnimation } from '@/components/IntroAnimation'
import { Footer } from '@/components/Footer'
import { EventCard } from '@/components/EventCard'
import { ActivityCard } from '@/components/ActivityCard'
import { PageSection } from '@/components/PageSection'
import { PageContainer } from '@/components/PageContainer'
import { LazyVideo } from '@/components/LazyVideo'
import { createClient } from '@/lib/supabase/server'
import { getEvenementen, getZones } from '@/lib/database'
import { groupActiviteiten, splitByKind } from '@/lib/agenda-helpers'
import { isFestEvent } from '@/lib/site-promos'
import type { Evenement, Zone } from '@/types'
import Image from 'next/image'
import Link from 'next/link'

// Revalidate every 60 seconds to reduce requests while keeping data fresh
export const revalidate = 60
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  // Server-side data fetching with parallel requests
  let evenementen: Evenement[] = []
  let zones: Zone[] = []
  try {
    const supabase = await createClient()
    // Fetch all data in parallel to reduce total request time
    const [evenementenData, zonesData] = await Promise.all([
      getEvenementen(supabase).catch(err => {
        console.error('Error loading evenementen:', err)
        return []
      }),
      getZones(supabase).catch(err => {
        console.error('Error loading zones:', err)
        return []
      }),
    ])
    evenementen = evenementenData
    zones = zonesData
  } catch (error) {
    // Log error but don't crash the page
    console.error('Error initializing Supabase client:', error)
    // In production, we want to show the page even if Supabase fails
    // The page will just show empty states
  }

  const now = new Date()
  const { evenementen: alleEvenementen, activiteiten: alleActiviteiten } = splitByKind(evenementen)
  const opkomendeEvenementen = alleEvenementen
    .filter((event) => new Date(event.start_datetime) >= now)
    .sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime())
  const fest = opkomendeEvenementen.filter((event) => event.is_highlight || isFestEvent(event.title))
  const rest = opkomendeEvenementen.filter((event) => !event.is_highlight && !isFestEvent(event.title))
  const highlightEvenementen = [...fest, ...rest].slice(0, 5)
  const highlightActiviteiten = groupActiviteiten(
    alleActiviteiten.filter((item) => new Date(item.start_datetime) >= now),
    { now, direction: 'upcoming' }
  ).slice(0, 6)
  const toonAgendaOverzicht = highlightEvenementen.length > 0 || highlightActiviteiten.length > 0

  return (
    <div className="page-background">
      <HeroSection />

      <PromoGate variant="banners" />

      {/* Intro Section */}
      <PageSection id="intro" className="section-gradient-1">
        <PageContainer>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 graffiti-text mb-8">
                Een bruisende plek onder het viaduct
              </h2>
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
                Corri d'Or is de urban spot in Gentbrugge waar de stad écht tot leven komt. Onder het E17-viaduct vind je een plek om te bewegen, te chillen, en samen te komen. Voetballen, basketten, dansen, lopen of gewoon genieten — hier kan het allemaal.
              </p>
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
                Terwijl dagelijks duizenden auto's over het viaduct razen, ligt er onder diezelfde brug een verborgen parel: een terrein dat lang braakliggend lag met ongekende mogelijkheden. Wij zien hier de kans om van die plek een levendige urban hub te maken waar creativiteit en energie samenkomen.
              </p>
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                Vanaf 2025 kan je hier terecht voor een drankje en verschillende events met en voor de buurt. Corri d'Or wordt een bruisende plek waar iedereen welkom is en zich thuis voelt.
              </p>
            </div>
            
            {/* Intro Animation Video - Loaded client-side */}
            <IntroAnimation />
          </div>
        </PageContainer>
      </PageSection>

      {/* History Section */}
      <PageSection id="history" className="section-gradient-1">
        <PageContainer>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 graffiti-text text-center mb-12">
            Het Verhaal van Corridor
          </h2>
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 card-hover">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Van Braakliggend Terrein tot Urban Hub</h3>
              <p className="text-gray-700 mb-4">
                Jongeren en buurtbewoners hebben nood aan een overdekte plek om te sporten en elkaar te ontmoeten. Daarom willen we hier een veelzijdige ruimte creëren voor overdekt skaten, rolschaatsen en basketbal.
              </p>
              <p className="text-gray-700">
                Daarnaast leggen we kunstgrasmatten aan voor voetbal en voorzien we een zone voor toegelaten graffiti. Ons doel is een plek te maken voor multifunctioneel gebruik, waar iedereen welkom is.
              </p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 card-hover">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Grote Ambities</h3>
              <p className="text-gray-700 mb-4">
                Met een oppervlakte van maar liefst <strong>19.500 m²</strong> hebben we grote ambities en plannen. We willen minstens 10 jaar aan de slag blijven en dromen van uitbreidingen zoals minigolf en een BMX-parcours.
              </p>
              <p className="text-gray-700">
                Tegelijk geven we het project de tijd en ruimte om organisch te groeien. Dit project bouwt voort op het werk van een bewonersgroep die vorig jaar een eerste stap zette via het burgerbudget.
              </p>
            </div>
          </div>
          <div className="bg-white/40 backdrop-blur-sm rounded-3xl p-8 text-center card-hover">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-600">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Leerecosysteem</h3>
            <p className="text-gray-700 mb-6">
              Deze plek fungeert ook als leerecosysteem, ondersteund door het Europees programma WSE. Samen met organisaties en vrijwilligers bouwen we een netwerk uit dat de ruimte gebruikt als springplank naar levenslang leren en uitwisseling.
            </p>
            <a href="/geschiedenis" className="inline-flex items-center px-6 py-3 bg-white/60 hover:bg-white/80 rounded-full text-gray-800 font-medium transition-all hover:scale-105 mr-4">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Foto&apos;s & geschiedenis
            </a>
            <a href="/corridorGeschiedenis.pdf" target="_blank" className="inline-flex items-center px-6 py-3 bg-white/60 hover:bg-white/80 rounded-full text-gray-800 font-medium transition-all hover:scale-105">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Volledige Geschiedenis (PDF)
            </a>
            
            {/* Floating GIF - Lazy loaded from Supabase Storage */}
            <div className="relative">
              <LazyVideo
                supabaseBucket="videos"
                supabaseFileName="corridorGif.mp4"
                className="floating-gif absolute z-20"
                autoPlay
                muted
                loop
                playsInline
                poster="/herfstplanning.webp"
              />
            </div>
          </div>
        </PageContainer>
      </PageSection>

      {/* Evenementen & activiteiten */}
      {toonAgendaOverzicht && (
        <PageSection id="evenementen" className="section-gradient-2">
          <PageContainer>
            {highlightEvenementen.length > 0 && (
              <div className="mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-800 graffiti-text text-center mb-12">
                  Komende evenementen
                </h2>
                <div className="space-y-4">
                  {highlightEvenementen.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
                <SectionLinks
                  primaryHref="/evenementen"
                  primaryLabel="Alle evenementen"
                  secondaryHref="/agenda"
                  secondaryLabel="Bekijk agenda"
                />
              </div>
            )}

            {highlightActiviteiten.length > 0 && (
              <div id="activiteiten">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-800 graffiti-text text-center mb-12">
                  Komende activiteiten
                </h2>
                <div className="space-y-4">
                  {highlightActiviteiten.map((activity) => (
                    <ActivityCard key={activity.key} activity={activity} />
                  ))}
                </div>
                <SectionLinks
                  primaryHref="/activiteiten"
                  primaryLabel="Alle activiteiten"
                  secondaryHref="/agenda"
                  secondaryLabel="Bekijk agenda"
                />
              </div>
            )}
          </PageContainer>
        </PageSection>
      )}

      {/* Contact Section */}
      <PageSection id="contact" className="section-gradient-2">
        <PageContainer>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 graffiti-text text-center mb-12">
            Kom Langs!
          </h2>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 card-hover">
              <div className="w-8 h-8 mx-auto mb-4 text-gray-600">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Adres</h3>
              <p className="text-gray-700">
                Onder het E17 viaduct<br />
                einde Driebeekstraat<br />
                9050 Gentbrugge
              </p>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 card-hover">
              <div className="w-8 h-8 mx-auto mb-4 text-gray-600">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Contact</h3>
              <p className="text-gray-700 mb-2">
                <strong>Bert</strong> - Verantwoordelijke<br />
                bert@sportaround.be
              </p>
              <p className="text-gray-700">
                info@sportaround.be
              </p>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 card-hover">
              <div className="w-8 h-8 mx-auto mb-4 text-gray-600">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Telefoon</h3>
              <p className="text-gray-700">
                +32 496 90 55 34
              </p>
            </div>
          </div>
        </PageContainer>
      </PageSection>

      <Footer />
    </div>
  )
}

function SectionLinks({
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  primaryHref: string
  primaryLabel: string
  secondaryHref: string
  secondaryLabel: string
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
      <Link
        href={primaryHref}
        className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-full font-medium transition-all hover:scale-105 shadow-lg"
      >
        {primaryLabel}
        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </Link>
      <Link
        href={secondaryHref}
        className="inline-flex items-center justify-center px-6 py-3 bg-white/70 hover:bg-white text-gray-900 rounded-full font-medium transition-all hover:scale-105 border border-gray-200"
      >
        {secondaryLabel}
        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </Link>
    </div>
  )
}
