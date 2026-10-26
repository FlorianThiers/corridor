import { readFile } from 'node:fs/promises'
import path from 'node:path'

import type { SupabaseClient } from '@supabase/supabase-js'

import {
  FEST_2026_GALLERY_FROM,
  FEST_2026_GALLERY_TO,
  FEST_ARCHIVE_ZONE_NUMBER,
} from '@/lib/fest-2026'
import { resolveZonePhotoCredit } from '@/lib/media-credit'
import type { User, Zone, ZonePhoto } from '@/types'

export type MediaKind = 'zone' | 'history' | 'event'

export type MediaQuery = {
  zone?: string
  kind?: MediaKind
  featured?: boolean
  limit?: number
  updatedSince?: string
}

export type MediaItem = {
  id: string
  kind: MediaKind
  zone_slug: string | null
  url: string
  width: number | null
  height: number | null
  alt: string | null
  credit: string | null
  uploader_name: string | null
  artist_tag: string | null
  source: 'florian' | 'upload' | 'corristories'
  license: string | null
  has_recognisable_people: boolean
  is_cover: boolean
  sort: number
  updated_at: string
}

type HistoryManifestEntry = {
  id: string
  path: string
  alt: string
  credit?: string | null
  sort: number
}

type HistoryManifest = {
  version: number
  items: HistoryManifestEntry[]
}

type ZonePhotoRow = ZonePhoto & {
  alt?: string | null
  credit?: string | null
  artist_tag?: string | null
  has_recognisable_people?: boolean | null
  media_source?: string | null
  width?: number | null
  height?: number | null
  license?: string | null
}

const DEFAULT_LIMIT = 200
const MAX_LIMIT = 500

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function parseMediaQuery(searchParams: URLSearchParams): MediaQuery {
  const kind = searchParams.get('kind')
  const zone = searchParams.get('zone') ?? undefined
  const featuredRaw = searchParams.get('featured')
  const limitRaw = searchParams.get('limit')
  const updatedSince = searchParams.get('updated_since') ?? undefined

  let limit: number | undefined
  if (limitRaw != null && limitRaw !== '') {
    const n = Number(limitRaw)
    if (Number.isFinite(n) && n > 0) {
      limit = Math.min(MAX_LIMIT, Math.floor(n))
    }
  }

  return {
    zone,
    kind:
      kind === 'zone' || kind === 'history' || kind === 'event'
        ? kind
        : undefined,
    featured:
      featuredRaw === '1' ||
      featuredRaw === 'true' ||
      featuredRaw === 'yes',
    limit,
    updatedSince,
  }
}

export function resolvePublicBaseUrl(requestOrigin?: string | null): string {
  const explicit = process.env.CORRIDOR_SITE_URL?.replace(/\/$/, '')
  if (explicit) return explicit
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  if (requestOrigin) {
    return requestOrigin.replace(/\/$/, '')
  }
  return ''
}

export function toAbsoluteUrl(baseUrl: string, href: string): string {
  if (/^https?:\/\//i.test(href)) return href
  if (!baseUrl) return href
  return `${baseUrl}${href.startsWith('/') ? href : `/${href}`}`
}

async function loadHistoryManifest(): Promise<HistoryManifest> {
  const manifestPath = path.join(
    process.cwd(),
    'public',
    'geschiedenis',
    'manifest.json'
  )
  const raw = await readFile(manifestPath, 'utf8')
  return JSON.parse(raw) as HistoryManifest
}

function historyItems(
  manifest: HistoryManifest,
  baseUrl: string,
  query: MediaQuery
): MediaItem[] {
  const updatedSinceMs = query.updatedSince
    ? Date.parse(query.updatedSince)
    : NaN

  return manifest.items
    .filter(() => {
      if (query.featured) return false
      return true
    })
    .map((entry) => {
      const updatedAt = '1970-01-01T00:00:00.000Z'
      return {
        id: entry.id,
        kind: 'history' as const,
        zone_slug: null,
        url: toAbsoluteUrl(baseUrl, entry.path),
        width: null,
        height: null,
        alt: entry.alt,
        credit: entry.credit ?? null,
        uploader_name: null,
        artist_tag: null,
        source: 'corristories' as const,
        license: null,
        has_recognisable_people: true,
        is_cover: false,
        sort: entry.sort,
        updated_at: updatedAt,
      }
    })
    .filter((item) => {
      if (!Number.isFinite(updatedSinceMs)) return true
      return Date.parse(item.updated_at) >= updatedSinceMs
    })
}

async function resolveZoneFilter(
  supabase: SupabaseClient,
  zoneParam?: string
): Promise<{ zoneIds: string[] | null; zoneById: Map<string, Zone> }> {
  const { data: zones, error } = await supabase
    .from('zones')
    .select('*')
    .order('zone_number', { ascending: true })

  if (error) throw error
  const list = (zones || []) as Zone[]
  const zoneById = new Map(list.map((z) => [z.id, z]))

  if (!zoneParam) {
    return { zoneIds: null, zoneById }
  }

  if (UUID_RE.test(zoneParam)) {
    const match = list.find((z) => z.id === zoneParam)
    return { zoneIds: match ? [match.id] : [], zoneById }
  }

  const slugMatch = list.find(
    (z) => (z.slug || '').toLowerCase() === zoneParam.toLowerCase()
  )
  if (slugMatch) {
    return { zoneIds: [slugMatch.id], zoneById }
  }

  const asNumber = Number(zoneParam)
  if (Number.isInteger(asNumber)) {
    const numMatch = list.find((z) => z.zone_number === asNumber)
    return { zoneIds: numMatch ? [numMatch.id] : [], zoneById }
  }

  return { zoneIds: [], zoneById }
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
    console.warn('media-api: could not load uploader profiles', error.message)
    return new Map()
  }

  return new Map((data || []).map((row) => [row.id, row]))
}

function zonePhotoToItem(
  photo: ZonePhotoRow,
  zone: Zone | undefined,
  kind: MediaKind,
  submitter: Pick<User, 'full_name' | 'email'> | null,
  coverUrl: string | null,
  sortIndex: number
): MediaItem {
  const resolved = resolveZonePhotoCredit(photo, submitter)
  const isCover =
    photo.storage_path.includes('/cover-') ||
    (coverUrl != null && photo.public_url === coverUrl)

  return {
    id: photo.id,
    kind,
    zone_slug: zone?.slug ?? null,
    url: photo.public_url,
    width: photo.width ?? null,
    height: photo.height ?? null,
    alt: resolved.alt,
    credit: resolved.credit,
    uploader_name: resolved.uploader_name,
    artist_tag: resolved.artist_tag,
    source: resolved.source,
    license: photo.license ?? null,
    has_recognisable_people: resolved.has_recognisable_people,
    is_cover: isCover,
    sort: sortIndex,
    updated_at:
      photo.updated_at || photo.reviewed_at || photo.created_at || new Date().toISOString(),
  }
}

function coverItemFromZone(zone: Zone, kind: MediaKind, sort: number): MediaItem | null {
  if (!zone.cover_url) return null
  const isStaticCover = zone.cover_url.startsWith('/zones/')
  return {
    id: `zone-cover-${zone.id}`,
    kind,
    zone_slug: zone.slug ?? null,
    url: zone.cover_url,
    width: null,
    height: null,
    alt: zone.name ? `Coverfoto ${zone.name}` : null,
    credit: isStaticCover ? 'foto: Florian Thiers' : null,
    uploader_name: null,
    artist_tag: isStaticCover ? null : null,
    source: isStaticCover ? 'florian' : 'corristories',
    license: null,
    has_recognisable_people: true,
    is_cover: true,
    sort,
    updated_at: zone.updated_at || zone.created_at || new Date().toISOString(),
  }
}

async function queryZonePhotos(
  supabase: SupabaseClient,
  query: MediaQuery,
  kind: MediaKind,
  eventZoneId?: string | null
): Promise<MediaItem[]> {
  const { zoneIds, zoneById } = await resolveZoneFilter(supabase, query.zone)

  if (zoneIds && zoneIds.length === 0) {
    return []
  }

  let dbQuery = supabase
    .from('zone_photos')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  if (zoneIds) {
    dbQuery = dbQuery.in('zone_id', zoneIds)
  }

  if (kind === 'event' && eventZoneId) {
    dbQuery = dbQuery.eq('zone_id', eventZoneId)
  } else if (kind === 'event') {
    dbQuery = dbQuery
      .gte('created_at', FEST_2026_GALLERY_FROM)
      .lt('created_at', FEST_2026_GALLERY_TO)
  }

  if (query.updatedSince) {
    dbQuery = dbQuery.gte('updated_at', query.updatedSince)
  }

  const { data, error } = await dbQuery
  if (error) throw error

  const photos = (data || []) as ZonePhotoRow[]
  const profiles = await loadSubmitterProfiles(
    supabase,
    photos.map((p) => p.submitted_by || '')
  )

  const items: MediaItem[] = []
  let sort = 0

  if (!query.featured) {
    for (const photo of photos) {
      const zone = zoneById.get(photo.zone_id)
      items.push(
        zonePhotoToItem(
          photo,
          zone,
          kind,
          photo.submitted_by ? profiles.get(photo.submitted_by) ?? null : null,
          zone?.cover_url ?? null,
          sort
        )
      )
      sort += 1
    }
  }

  const zonesForCovers = zoneIds
    ? zoneIds.map((id) => zoneById.get(id)).filter(Boolean) as Zone[]
    : [...zoneById.values()]

  for (const zone of zonesForCovers) {
    const cover = coverItemFromZone(zone, kind, sort)
    if (!cover) continue
    if (query.featured && !cover.is_cover) continue
    if (query.updatedSince) {
      const since = Date.parse(query.updatedSince)
      if (Number.isFinite(since) && Date.parse(cover.updated_at) < since) {
        continue
      }
    }
    if (query.featured || !photos.some((p) => p.public_url === zone.cover_url)) {
      items.push(cover)
      sort += 1
    }
  }

  if (query.featured) {
    return items.filter((item) => item.is_cover)
  }

  return items
}

export async function queryMediaItems(
  supabase: SupabaseClient,
  query: MediaQuery,
  options?: { baseUrl?: string; eventArchiveZoneId?: string | null }
): Promise<MediaItem[]> {
  const baseUrl = options?.baseUrl ?? ''
  const kinds: MediaKind[] = query.kind
    ? [query.kind]
    : ['zone', 'history', 'event']

  const chunks: MediaItem[] = []

  if (kinds.includes('history')) {
    const manifest = await loadHistoryManifest()
    chunks.push(...historyItems(manifest, baseUrl, query))
  }

  let eventZoneId = options?.eventArchiveZoneId ?? null
  if (kinds.includes('event') && !eventZoneId) {
    const { data } = await supabase
      .from('zones')
      .select('id')
      .eq('zone_number', FEST_ARCHIVE_ZONE_NUMBER)
      .maybeSingle()
    eventZoneId = data?.id ?? null
  }

  if (kinds.includes('zone')) {
    chunks.push(...(await queryZonePhotos(supabase, query, 'zone')))
  }

  if (kinds.includes('event')) {
    chunks.push(
      ...(await queryZonePhotos(supabase, query, 'event', eventZoneId))
    )
  }

  chunks.sort((a, b) => a.sort - b.sort || a.id.localeCompare(b.id))

  const limit = query.limit ?? DEFAULT_LIMIT
  return chunks.slice(0, limit)
}

export function toMediaResponse(items: MediaItem[]) {
  return {
    synced_at: new Date().toISOString(),
    items,
  }
}
