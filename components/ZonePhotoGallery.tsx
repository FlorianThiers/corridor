'use client'

import { useState } from 'react'
import { ZoomableLightbox } from '@/components/ZoomableLightbox'
import { ZONE_GALLERY_PAGE_SIZE, type ZoneGalleryItem } from '@/lib/zone-gallery'

interface ZonePhotoGalleryProps {
  zoneNumber: number
  zoneName: string
  coverUrl?: string | null
  initialPhotos: ZoneGalleryItem[]
  totalPhotoCount: number
}

export function ZonePhotoGallery({
  zoneNumber,
  zoneName,
  coverUrl,
  initialPhotos,
  totalPhotoCount,
}: ZonePhotoGalleryProps) {
  const [extraPhotos, setExtraPhotos] = useState<ZoneGalleryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadedPhotoCount = initialPhotos.length + extraPhotos.length
  const hasMore = loadedPhotoCount < totalPhotoCount

  const gallery: ZoneGalleryItem[] = [
    ...(coverUrl ? [{ id: 'cover', public_url: coverUrl, caption: 'Cover' }] : []),
    ...initialPhotos,
    ...extraPhotos,
  ]

  const loadMore = async () => {
    setError('')
    setLoading(true)
    try {
      const offset = loadedPhotoCount
      const res = await fetch(
        `/api/zones/${zoneNumber}/photos?offset=${offset}&limit=${ZONE_GALLERY_PAGE_SIZE}`
      )
      if (!res.ok) {
        throw new Error('Kon extra foto’s niet laden')
      }
      const data = (await res.json()) as { photos?: ZoneGalleryItem[] }
      const batch = data.photos ?? []
      if (batch.length === 0) return
      setExtraPhotos((prev) => [...prev, ...batch])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Laden mislukt')
    } finally {
      setLoading(false)
    }
  }

  if (gallery.length === 0) {
    return <p className="mb-12 text-center text-gray-600">Nog geen foto&apos;s voor deze zone.</p>
  }

  return (
    <div className="mb-12">
      {totalPhotoCount > 0 && (
        <p className="mb-4 text-center text-sm text-gray-600">
          {gallery.length - (coverUrl ? 1 : 0)} van {totalPhotoCount} foto&apos;s
          {coverUrl ? ' (+ cover)' : ''}
        </p>
      )}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {gallery.map((item) => (
          <figure key={item.id} className="overflow-hidden rounded-3xl bg-white/50 backdrop-blur-sm">
            <ZoomableLightbox
              src={item.public_url}
              alt={item.caption || zoneName}
              thumbClassName="aspect-[4/3] w-full object-cover"
            />
            {item.caption && item.id !== 'cover' && (
              <figcaption className="px-4 py-3 text-sm text-gray-700">{item.caption}</figcaption>
            )}
          </figure>
        ))}
      </div>
      {hasMore && (
        <div className="mt-8 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => void loadMore()}
            disabled={loading}
            className="rounded-full bg-pink-500 px-8 py-3 font-medium text-white transition hover:bg-pink-600 disabled:cursor-wait disabled:opacity-70"
          >
            {loading ? 'Laden…' : `Meer foto’s (${totalPhotoCount - loadedPhotoCount} resterend)`}
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      )}
    </div>
  )
}
