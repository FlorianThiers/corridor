import { resolveZonePhotoCredit } from '@/lib/media-credit'
import { altWithCredits } from '@/lib/image-alt'

/** Eerste batch op zone-detail; “Meer laden” haalt volgende pagina via API. */
export const ZONE_GALLERY_PAGE_SIZE = 24

export type ZoneGalleryItem = {
  id: string
  public_url: string
  caption?: string | null
  storage_path?: string | null
  credit?: string | null
  artist_tag?: string | null
  media_source?: string | null
  uploader_name?: string | null
}

/** Alt-tekst voor een zone- of festfoto, inclusief fotograaf en kunstenaar. */
export function zoneGalleryAlt(item: ZoneGalleryItem, zoneName: string): string {
  if (item.id === 'cover') {
    return altWithCredits(`Coverfoto ${zoneName}`, { photographer: item.credit })
  }

  const resolved = resolveZonePhotoCredit(
    {
      storage_path: item.storage_path ?? '',
      caption: item.caption,
      credit: item.credit,
      artist_tag: item.artist_tag,
      media_source: item.media_source,
      alt: item.caption,
    },
    item.uploader_name ? { full_name: item.uploader_name, email: '' } : null
  )

  const description = item.caption?.trim() || resolved.alt?.trim() || zoneName
  return altWithCredits(description, {
    photographer: resolved.credit,
    artist: resolved.artist_tag,
  })
}
