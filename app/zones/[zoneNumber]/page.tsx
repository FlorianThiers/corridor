import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  getApprovedZonePhotoCount,
  getApprovedZonePhotosPage,
  getZoneByNumber,
} from '@/lib/database'
import type { Zone } from '@/types'
import { PageSection } from '@/components/PageSection'
import { PageContainer } from '@/components/PageContainer'
import { PageTitle } from '@/components/PageTitle'
import { Footer } from '@/components/Footer'
import { BackgroundImage } from '@/components/BackgroundImage'
import { ZonePhotoSubmit } from '@/components/ZonePhotoSubmit'
import { ZonePhotoHowTo } from '@/components/ZonePhotoHowTo'
import { ZonePhotoGallery } from '@/components/ZonePhotoGallery'
import { ZONE_GALLERY_PAGE_SIZE } from '@/lib/zone-gallery'

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
  let initialPhotos: Awaited<ReturnType<typeof getApprovedZonePhotosPage>> = []
  let totalPhotoCount = 0

  try {
    const supabase = await createClient()
    zone = await getZoneByNumber(supabase, n)
    if (zone) {
      try {
        const [photos, total] = await Promise.all([
          getApprovedZonePhotosPage(supabase, zone.id, {
            offset: 0,
            limit: ZONE_GALLERY_PAGE_SIZE,
          }),
          getApprovedZonePhotoCount(supabase, zone.id),
        ])
        initialPhotos = photos
        totalPhotoCount = total
      } catch {
        initialPhotos = []
        totalPhotoCount = 0
      }
    }
  } catch (error) {
    console.error('Error loading zone:', error)
  }

  if (!zone) notFound()

  const labels = zone.field_labels?.filter(Boolean) ?? []

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

          <ZonePhotoGallery
            zoneNumber={zone.zone_number}
            zoneName={zone.name}
            coverUrl={zone.cover_url}
            initialPhotos={initialPhotos.map((p) => ({
              id: p.id,
              public_url: p.public_url,
              caption: p.caption,
            }))}
            totalPhotoCount={totalPhotoCount}
          />
        </PageContainer>
      </PageSection>
      <Footer />
    </div>
  )
}
