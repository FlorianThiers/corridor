import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  getApprovedZonePhotoCount,
  getApprovedZonePhotos,
  getEvenementen,
  getZoneByNumber,
  getZones,
} from '@/lib/database'
import { splitByKind } from '@/lib/agenda-helpers'
import { BRAND_FEST, BRAND_FEST_EDITION_2026, SITE_NAME } from '@/lib/brand'
import {
  FEST_2026_DATES_LABEL,
  FEST_2026_INTRO,
  FEST_2026_LOCATION,
  FEST_ARCHIVE_ZONE_NUMBER,
  FEST_GALLERY_TEASER_LIMIT,
} from '@/lib/fest-2026'
import { FEST_PROMO, isFestEvent, TRACK_TRACKS_TICKET_URL } from '@/lib/site-promos'
import { PageSection } from '@/components/PageSection'
import { PageContainer } from '@/components/PageContainer'
import { PageTitle } from '@/components/PageTitle'
import { Footer } from '@/components/Footer'
import { BackgroundImage } from '@/components/BackgroundImage'
import { FestProgramPosters } from '@/components/FestProgramPosters'
import { FestZonePhotoUpload } from '@/components/FestZonePhotoUpload'
import { EventCard } from '@/components/EventCard'
import { ZoomableLightbox } from '@/components/ZoomableLightbox'
import { zoneGalleryAlt } from '@/lib/zone-gallery'

export const revalidate = 60
export const dynamic = 'force-dynamic'

export const metadata = {
  title: `${BRAND_FEST_EDITION_2026} - ${SITE_NAME}`,
  description: `Affiches, programma en foto's van ${BRAND_FEST_EDITION_2026} in Gentbrugge.`,
}

export default async function CorridorfestPage() {
  let zones: Awaited<ReturnType<typeof getZones>> = []
  let teaserPhotos: Awaited<ReturnType<typeof getApprovedZonePhotos>> = []
  let festPhotoTotal = 0
  let festArchiveZoneName: string | null = null
  let festHighlights: Awaited<ReturnType<typeof getEvenementen>> = []

  try {
    const supabase = await createClient()
    const [zonesData, evenementen, festZone] = await Promise.all([
      getZones(supabase).catch(() => []),
      getEvenementen(supabase).catch(() => []),
      getZoneByNumber(supabase, FEST_ARCHIVE_ZONE_NUMBER).catch(() => null),
    ])
    zones = zonesData
    const { evenementen: events } = splitByKind(evenementen)
    festHighlights = events.filter((e) => e.is_highlight || isFestEvent(e.title))

    if (festZone) {
      festArchiveZoneName = festZone.name
      const [photos, total] = await Promise.all([
        getApprovedZonePhotos(supabase, festZone.id, { limit: FEST_GALLERY_TEASER_LIMIT }).catch(
          () => []
        ),
        getApprovedZonePhotoCount(supabase, festZone.id).catch(() => 0),
      ])
      teaserPhotos = photos
      festPhotoTotal = total
    }
  } catch (error) {
    console.error('Error loading corridorfest page:', error)
  }

  const festGalleryHref = `/zones/${FEST_ARCHIVE_ZONE_NUMBER}`

  return (
    <div className="page-background">
      <BackgroundImage />
      <PageSection className="min-h-screen">
        <PageContainer>
          <p className="mb-4 text-center">
            <Link href="/evenementen" className="font-medium text-pink-600 hover:text-pink-700">
              ← Evenementen
            </Link>
          </p>

          <PageTitle>{BRAND_FEST_EDITION_2026}</PageTitle>
          <p className="text-center text-gray-700 max-w-2xl mx-auto mb-10 -mt-4">
            <span className="font-medium text-gray-800">{FEST_2026_DATES_LABEL}</span>
            <span className="mx-2 text-gray-600" aria-hidden="true">·</span>
            {FEST_2026_LOCATION}
          </p>

          <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-8 mb-12 max-w-3xl mx-auto space-y-4 text-gray-700 leading-relaxed">
            {FEST_2026_INTRO.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>

          <div className="mb-12 flex flex-col sm:flex-row gap-3 justify-center">
            {FEST_PROMO.signupHref && (
              <a
                href={FEST_PROMO.signupHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-full font-medium transition-all hover:scale-105 shadow-lg"
              >
                Inschrijving (archief)
              </a>
            )}
            <a
              href={TRACK_TRACKS_TICKET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 bg-white/70 hover:bg-white text-gray-900 rounded-full font-medium transition-all hover:scale-105 border border-gray-200"
            >
              Track Tracks × Corri d&apos;Or
            </a>
          </div>

          <div className="mb-14">
            <h2 className="text-3xl font-bold text-gray-800 graffiti-text text-center mb-6">Affiche</h2>
            <div className="relative mx-auto max-w-md aspect-[3/4] rounded-3xl overflow-hidden border border-amber-200/70 shadow-xl bg-[#f5e642]">
              <Image
                src="/corri-dor-fest-2026.webp"
                alt={`Affiche ${BRAND_FEST} — ${FEST_2026_DATES_LABEL}`}
                fill
                className="object-contain p-3"
                sizes="(max-width: 768px) 90vw, 400px"
                priority
              />
            </div>
          </div>

          <div className="mb-14">
            <FestProgramPosters />
          </div>

          {festHighlights.length > 0 && (
            <div className="mb-14 space-y-4">
              <h2 className="text-3xl font-bold text-gray-800">In de agenda</h2>
              {festHighlights.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}

          <div id="fotos" className="mb-14 scroll-mt-28">
            <h2 className="text-3xl font-bold text-gray-800 graffiti-text mb-2">Foto&apos;s editie 2026</h2>
            <p className="text-gray-600 mb-6 max-w-2xl">
              Een selectie uit de fest-galerij
              {festArchiveZoneName ? ` (${festArchiveZoneName})` : ''}. Alle beelden staan op zone{' '}
              {FEST_ARCHIVE_ZONE_NUMBER}.
            </p>

            {teaserPhotos.length === 0 ? (
              <p className="text-center text-gray-600 bg-white/60 backdrop-blur-sm rounded-3xl p-8 mb-6">
                Nog geen foto&apos;s in de fest-zone — upload via zone {FEST_ARCHIVE_ZONE_NUMBER} of hieronder.
              </p>
            ) : (
              <>
                <p className="mb-4 text-sm text-gray-600">
                  {festPhotoTotal > teaserPhotos.length
                    ? `${teaserPhotos.length} van ${festPhotoTotal} foto’s hieronder`
                    : `${festPhotoTotal} foto’s`}
                </p>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                  {teaserPhotos.map((photo) => (
                    <figure
                      key={photo.id}
                      className="overflow-hidden rounded-3xl bg-white/50 backdrop-blur-sm"
                    >
                      <ZoomableLightbox
                        src={photo.public_url}
                        alt={zoneGalleryAlt(
                          {
                            id: photo.id,
                            public_url: photo.public_url,
                            caption: photo.caption,
                            storage_path: photo.storage_path,
                            credit: photo.credit,
                            artist_tag: photo.artist_tag,
                            media_source: photo.media_source,
                          },
                          BRAND_FEST_EDITION_2026
                        )}
                        thumbClassName="aspect-[4/3] w-full object-cover"
                      />
                      {photo.caption ? (
                        <figcaption className="px-4 py-3 text-sm text-gray-700">{photo.caption}</figcaption>
                      ) : null}
                    </figure>
                  ))}
                </div>
              </>
            )}

            <div className="flex justify-center">
              <Link
                href={festGalleryHref}
                className="inline-flex items-center justify-center rounded-full bg-amber-500 px-8 py-3 font-semibold text-amber-950 shadow-md transition hover:bg-amber-400 hover:scale-[1.02]"
              >
                Alle fest-foto&apos;s bekijken (zone {FEST_ARCHIVE_ZONE_NUMBER})
              </Link>
            </div>
          </div>

          <FestZonePhotoUpload zones={zones} defaultZoneNumber={FEST_ARCHIVE_ZONE_NUMBER} />
        </PageContainer>
      </PageSection>
      <Footer />
    </div>
  )
}
