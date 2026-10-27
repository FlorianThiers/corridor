import type { SupabaseClient } from '@supabase/supabase-js'

import { getZones } from '@/lib/database'
import { resolveZonePhotoCredit } from '@/lib/media-credit'
import { resolvePublicBaseUrl } from '@/lib/media-api'
import type { User, Zone, ZonePhoto } from '@/types'

import { toAbsoluteUrl } from './public-url'
import {
  loadApprovedCoverFallbacks,
  loadUnapprovedPhotoUrls,
  resolveZoneCoverUrl,
} from './zone-covers'

export type ZoneSpotRules = {
  spray_allowed: boolean | null
}

export type ZoneSpotCoordinates = {
  lat: number
  lng: number
}

export type ZoneSpotCover = {
  url: string
  alt: string | null
}

export type ZoneSpot = {
  id: string
  slug: string | null
  zone_number: number
  name: string
  description: string | null
  rules: ZoneSpotRules
  coordinates: ZoneSpotCoordinates | null
  cover: ZoneSpotCover | null
}

export type ZoneSpotRow = {
  id: string
  zone_number: number
  name: string
  description?: string | null
  slug?: string | null
  cover_url?: string | null
  spray_allowed?: boolean | null
  latitude?: number | string | null
  longitude?: number | string | null
}

function finiteCoord(value: number | string | null | undefined, min: number, max: number): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value >= min && value <= max ? value : null
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    if (Number.isFinite(parsed) && parsed >= min && parsed <= max) return parsed
  }
  return null
}

export function toZoneSpot(row: ZoneSpotRow, baseUrl: string, coverUrl: string | null): ZoneSpot {
  const lat = finiteCoord(row.latitude, -90, 90)
  const lng = finiteCoord(row.longitude, -180, 180)
  const description = row.description?.trim() || null
  const slug = row.slug?.trim() || null
  const alt = row.name?.trim() ? `Coverfoto ${row.name.trim()}` : null

  return {
    id: row.id,
    slug,
    zone_number: row.zone_number,
    name: row.name,
    description,
    rules: {
      spray_allowed: typeof row.spray_allowed === 'boolean' ? row.spray_allowed : null,
    },
    coordinates: lat != null && lng != null ? { lat, lng } : null,
    cover: coverUrl
      ? { url: toAbsoluteUrl(baseUrl, coverUrl), alt }
      : null,
  }
}

export async function queryZoneSpots(
  supabase: SupabaseClient,
  baseUrl: string,
  options?: { canModerate?: boolean }
): Promise<ZoneSpot[]> {
  const { data, error } = await supabase
    .from('zones')
    .select('*')
    .order('zone_number', { ascending: true })

  if (error) throw error
  const rows = (data ?? []) as ZoneSpotRow[]
  const [unapprovedUrls, fallbacks] = await Promise.all([
    loadUnapprovedPhotoUrls(supabase, options),
    loadApprovedCoverFallbacks(
      supabase,
      rows.map((row) => row.id)
    ),
  ])

  return rows.map((row) => {
    const coverUrl = resolveZoneCoverUrl({
      coverUrl: row.cover_url,
      approvedFallbackUrl: fallbacks.get(row.id) ?? null,
      unapprovedUrls,
    })
    return toZoneSpot(row, baseUrl, coverUrl)
  })
}

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
