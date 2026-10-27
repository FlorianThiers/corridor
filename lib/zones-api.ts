import type { SupabaseClient } from '@supabase/supabase-js'

import { getZones } from '@/lib/database'
import { resolveZonePhotoCredit } from '@/lib/media-credit'
import { resolvePublicBaseUrl } from '@/lib/media-api'
import type { User, Zone, ZonePhoto } from '@/types'

export type ZonesQuery = {
  zoneNumber?: number
  photosLimit: number
}

export type ZonesApiPhoto = {
  id: string
  url: string
  width: number | null
  height: number | null
  photographer: string | null
  artist_tag: string | null
  credit: string
  created_at: string
}

export type ZonesApiZone = {
  number: number
  slug: string
  name: string
  description: string | null
  url: string
  cover_url: string | null
  photos: ZonesApiPhoto[]
}

type ZonePhotoRow = ZonePhoto & {
  width?: number | null
  height?: number | null
  artist_tag?: string | null
  credit?: string | null
  media_source?: string | null
  alt?: string | null
  has_recognisable_people?: boolean | null
}

export const DEFAULT_PHOTOS_PER_ZONE = 48
export const MAX_PHOTOS_PER_ZONE = 200

const FLORIAN_NAME = 'Florian Thiers'

export function parseZonesQuery(searchParams: URLSearchParams): ZonesQuery {
  const zoneRaw = searchParams.get('zone')
  let zoneNumber: number | undefined
  if (zoneRaw != null && zoneRaw !== '') {
    const n = Number(zoneRaw)
    if (Number.isInteger(n) && n > 0) {
      zoneNumber = n
    }
  }

  const limitRaw = searchParams.get('limit')
  let photosLimit = DEFAULT_PHOTOS_PER_ZONE
  if (limitRaw != null && limitRaw !== '') {
    const n = Number(limitRaw)
    if (Number.isFinite(n) && n > 0) {
      photosLimit = Math.min(MAX_PHOTOS_PER_ZONE, Math.floor(n))
    }
  }

  return { zoneNumber, photosLimit }
}

export function formatZonesApiPhotoCredit(
  resolved: ReturnType<typeof resolveZonePhotoCredit>
): { credit: string; photographer: string | null } {
  if (resolved.source === 'corristories') {
    return { credit: 'Corridor', photographer: null }
  }

  const photographer =
    resolved.source === 'florian'
      ? FLORIAN_NAME
      : resolved.uploader_name?.trim() || null

  if (!photographer) {
    return { credit: 'foto: Onbekend / Corridor', photographer: null }
  }

  return {
    credit: `foto: ${photographer} / Corridor`,
    photographer,
  }
}

function zoneSlug(zone: Zone): string {
  const slug = zone.slug?.trim()
  if (slug) return slug
  return `zone-${zone.zone_number}`
}

function zonePageUrl(baseUrl: string, zoneNumber: number): string {
  const root = baseUrl.replace(/\/$/, '')
  return `${root}/zones/${zoneNumber}`
}

async function loadSubmitterProfiles(
  supabase: SupabaseClient,
  submitterIds: string[]
): Promise<Map<string, Pick<User, 'id' | 'full_name' | 'email'>>> {
  const unique = [...new Set(submitterIds.filter(Boolean))]
  if (unique.length === 0) return new Map()

  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, email')
    .in('id', unique)

  if (error) {
    console.warn('zones-api: could not load uploader profiles', error.message)
    return new Map()
  }

  return new Map((data || []).map((row) => [row.id, row]))
}

export function zonePhotoToApiPhoto(
  photo: ZonePhotoRow,
  submitter: Pick<User, 'full_name' | 'email'> | null
): ZonesApiPhoto {
  const resolved = resolveZonePhotoCredit(photo, submitter)
  const { credit, photographer } = formatZonesApiPhotoCredit(resolved)

  return {
    id: photo.id,
    url: photo.public_url,
    width: photo.width ?? null,
    height: photo.height ?? null,
    photographer,
    artist_tag: resolved.artist_tag,
    credit,
    created_at: photo.created_at || new Date(0).toISOString(),
  }
}

export async function queryZonesForApi(
  supabase: SupabaseClient,
  query: ZonesQuery,
  options?: { baseUrl?: string }
): Promise<ZonesApiZone[]> {
  const baseUrl = options?.baseUrl ?? resolvePublicBaseUrl()
  let zones = await getZones(supabase)

  if (query.zoneNumber != null) {
    zones = zones.filter((z) => z.zone_number === query.zoneNumber)
  }

  if (zones.length === 0) {
    return []
  }

  const zoneIds = zones.map((z) => z.id)
  const { data, error } = await supabase
    .from('zone_photos')
    .select('*')
    .in('zone_id', zoneIds)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  if (error) throw error

  const photos = (data || []) as ZonePhotoRow[]
  const profiles = await loadSubmitterProfiles(
    supabase,
    photos.map((p) => p.submitted_by || '')
  )

  const photosByZone = new Map<string, ZonesApiPhoto[]>()
  for (const photo of photos) {
    const list = photosByZone.get(photo.zone_id) || []
    if (list.length >= query.photosLimit) continue
    const submitter = photo.submitted_by
      ? profiles.get(photo.submitted_by) ?? null
      : null
    list.push(zonePhotoToApiPhoto(photo, submitter))
    photosByZone.set(photo.zone_id, list)
  }

  return zones.map((zone) => ({
    number: zone.zone_number,
    slug: zoneSlug(zone),
    name: zone.name,
    description: zone.description ?? null,
    url: zonePageUrl(baseUrl, zone.zone_number),
    cover_url: zone.cover_url ?? null,
    photos: photosByZone.get(zone.id) || [],
  }))
}

export function toZonesResponse(zones: ZonesApiZone[]) {
  return { zones }
}

export const ZONES_API_CACHE_CONTROL =
  'public, s-maxage=300, stale-while-revalidate=600'
