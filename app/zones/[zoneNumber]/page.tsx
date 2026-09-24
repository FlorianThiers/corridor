import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getZoneByNumber, getApprovedZonePhotos } from '@/lib/database'
import type { Zone, ZonePhoto } from '@/types'
import { PageSection } from '@/components/PageSection'
import { PageContainer } from '@/components/PageContainer'
import { PageTitle } from '@/components/PageTitle'
import { Footer } from '@/components/Footer'
import { BackgroundImage } from '@/components/BackgroundImage'
import { ZonePhotoSubmit } from '@/components/ZonePhotoSubmit'
import { ZonePhotoHowTo } from '@/components/ZonePhotoHowTo'
import { ZoomableLightbox } from '@/components/ZoomableLightbox'

export const revalidate = 60
export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ zoneNumber: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { zoneNumber } = await params
  const n = Number(zoneNumber)
  if (!Number.isFinite(n)) return { title: 'Zone - Corridor' }

  try {
    const supabase = await createClient()
    const zone = await getZoneByNumber(supabase, n)
    if (!zone) return { title: 'Zone - Corridor' }
    return {
      title: `Zone ${zone.zone_number}: ${zone.name} - Corridor`,
      description: zone.description || `Corridor zone ${zone.zone_number}`,
    }
  } catch {
    return { title: 'Zone - Corridor' }
  }
}

export default async function ZoneDetailPage({ params }: PageProps) {
  const { zoneNumber } = await params
  const n = Number(zoneNumber)
  if (!Number.isInteger(n) || n < 1) notFound()

  let zone: Zone | null = null
  let photos: ZonePhoto[] = []

  try {
    const supabase = await createClient()
    zone = await getZoneByNumber(supabase, n)
    if (zone) {
      try {
        photos = await getApprovedZonePhotos(supabase, zone.id)
      } catch {
        photos = []
      }
    }
  } catch (error) {
    console.error('Error loading zone:', error)
  }

  if (!zone) notFound()

  const labels = zone.field_labels?.filter(Boolean) ?? []
  const gallery = [
    ...(zone.cover_url
      ? [{ id: 'cover', public_url: zone.cover_url, caption: 'Cover' } as const]
      : []),
    ...photos.map((p) => ({ id: p.id, public_url: p.public_url, caption: p.caption })),
  ]

  return (
    <div className="page-background">
      <BackgroundImage />
      <PageSection className="min-h-screen">
        <PageContainer>
          <p className="mb-4 text-center">
            <Link href="/zones" className="font-medium text-pink-600 hover:text-pink-700">
              ← Alle zones
            </Link>
          </p>
          <PageTitle>
            Zone {zone.zone_number}: {zone.name}
          </PageTitle>
          {zone.description && (
            <p className="mx-auto mb-8 max-w-2xl whitespace-pre-line text-center text-lg text-gray-700">
              {zone.description}
            </p>
          )}
          {labels.length > 0 && (
            <ul className="mb-10 flex flex-wrap justify-center gap-2">
              {labels.map((label) => (
                <li
                  key={label}
                  className="rounded-full bg-white/70 px-4 py-2 text-sm font-medium text-gray-800"
                >
                  {label}
                </li>
              ))}
            </ul>
          )}

          <div id="foto-toevoegen" className="mx-auto mb-8 max-w-2xl">
            <ZonePhotoHowTo variant="detail" zoneName={zone.name} />
            <div className="rounded-3xl border-2 border-pink-200 bg-white/80 p-6 shadow-sm backdrop-blur-sm">
              <h3 className="mb-4 text-lg font-bold text-gray-800">Nu uploaden</h3>
              <ZonePhotoSubmit zoneId={zone.id} zoneNumber={zone.zone_number} />
            </div>
          </div>

          {gallery.length === 0 ? (
            <p className="mb-12 text-center text-gray-600">Nog geen foto&apos;s voor deze zone.</p>
          ) : (
            <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((item) => (
                <figure
                  key={item.id}
                  className="overflow-hidden rounded-3xl bg-white/50 backdrop-blur-sm"
                >
                  <ZoomableLightbox
                    src={item.public_url}
                    alt={item.caption || zone.name}
                    thumbClassName="aspect-[4/3] w-full object-cover"
                  />
                  {item.caption && (
                    <figcaption className="px-4 py-3 text-sm text-gray-700">{item.caption}</figcaption>
                  )}
                </figure>
              ))}
            </div>
          )}
        </PageContainer>
      </PageSection>
      <Footer />
    </div>
  )
}
