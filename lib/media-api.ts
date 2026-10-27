import { readFile } from 'node:fs/promises'
import path from 'node:path'

import type { SupabaseClient } from '@supabase/supabase-js'

import {
  FEST_2026_GALLERY_FROM,
  FEST_2026_GALLERY_TO,
  FEST_ARCHIVE_ZONE_NUMBER,
} from '@/lib/fest-2026'
import { applyCreditOverride, fallbackCredit, resolveZonePhotoCredit } from '@/lib/media-credit'
import {
  fetchCreditOverrides,
  fetchCreditOverridesUpdatedSince,
} from '@/lib/media-credit-store'
import { parseStableMediaId } from '@/lib/media-ids'
import { resolvePublicBaseUrl, toAbsoluteUrl } from '@/lib/public-url'
import {
  loadUnapprovedPhotoUrls,
  resolveZoneCoverUrl,
} from '@/lib/zone-covers'
import type { User, Zone, ZonePhoto } from '@/types'

export { resolvePublicBaseUrl, toAbsoluteUrl } from '@/lib/public-url'

export type MediaKind = 'zone' | 'history' | 'event'

export type MediaZoneRef = {
  id: string
  slug: string | null
  zone_number: number
  name: string
}

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
  zone: MediaZoneRef | null
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
  has_recognisable_people?: boolean
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

type ZoneFilter = {
  zoneIds: string[] | null
  zoneById: Map<string, Zone>
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

export function toMediaZoneRef(zone: Zone | undefined | null): MediaZoneRef | null {
  if (!zone) return null
  return {
    id: zone.id,
    slug: zone.slug?.trim() || null,
    zone_number: zone.zone_number,
    name: zone.name,
  }
}

function historyEntryToItem(entry: HistoryManifestEntry, baseUrl: string): MediaItem {
  return {
    id: entry.id,
    kind: 'history',
    zone_slug: null,
    zone: null,
    url: toAbsoluteUrl(baseUrl, entry.path),
    width: null,
    height: null,
    alt: entry.alt,
    credit: fallbackCredit('corristories', null, entry.credit),
    uploader_name: null,
    artist_tag: null,
    source: 'corristories',
    license: null,
    has_recognisable_people: entry.has_recognisable_people ?? true,
    is_cover: false,
    sort: entry.sort,
    updated_at: '1970-01-01T00:00:00.000Z',
  }
}

function historyItems(manifest: HistoryManifest, baseUrl: string, query: MediaQuery): MediaItem[] {
  if (query.zone || query.featured) return []

  const updatedSinceMs = query.updatedSince ? Date.parse(query.updatedSince) : NaN
  return manifest.items
    .map((entry) => historyEntryToItem(entry, baseUrl))
    .filter((item) => {
      if (!Number.isFinite(updatedSinceMs)) return true
      return Date.parse(item.updated_at) >= updatedSinceMs
    })
}

async function resolveZoneFilter(
  supabase: SupabaseClient,
  zoneParam?: string
): Promise<ZoneFilter> {
  const { data: zones, error } = await supabase
    .from('zones')
    .select('*')
    .order('zone_number', { ascending: true })

  if (error) throw error
  const list = (zones || []) as Zone[]
  const zoneById = new Map(list.map((zone) => [zone.id, zone]))

  if (!zoneParam) {
    return { zoneIds: null, zoneById }
  }

  if (UUID_RE.test(zoneParam)) {
    const match = list.find((zone) => zone.id === zoneParam)
    return { zoneIds: match ? [match.id] : [], zoneById }
  }

  const slugMatch = list.find(
    (zone) => (zone.slug || '').toLowerCase() === zoneParam.toLowerCase()
  )
  if (slugMatch) {
    return { zoneIds: [slugMatch.id], zoneById }
  }

  const asNumber = Number(zoneParam)
  if (Number.isInteger(asNumber)) {
    const numMatch = list.find((zone) => zone.zone_number === asNumber)
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
  sortIndex: number,
  baseUrl: string
): MediaItem {
  const resolved = resolveZonePhotoCredit(photo, submitter)
  const isCover =
    photo.storage_path.includes('/cover-') ||
    (coverUrl != null && photo.public_url === coverUrl)
  const zoneRef = toMediaZoneRef(zone)

  return {
    id: photo.id,
    kind,
    zone_slug: zoneRef?.slug ?? null,
    zone: zoneRef,
    url: toAbsoluteUrl(baseUrl, photo.public_url),
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

function coverItemFromZone(
  zone: Zone,
  kind: MediaKind,
  sort: number,
  baseUrl: string,
  unapprovedUrls: Set<string> | null,
  matched: { photo: ZonePhotoRow; submitter: Pick<User, 'full_name' | 'email'> | null } | null
): MediaItem | null {
  const publishable = resolveZoneCoverUrl({
    coverUrl: zone.cover_url,
    approvedFallbackUrl: matched?.photo.public_url ?? null,
    unapprovedUrls,
  })
  if (!publishable) return null

  const isStatic =
    publishable.startsWith('/zones/') || publishable.startsWith('/geschiedenis/')
  const fromPhoto = matched ? resolveZonePhotoCredit(matched.photo, matched.submitter) : null
  const source = fromPhoto?.source ?? (isStatic ? 'florian' : 'corristories')
  const zoneRef = toMediaZoneRef(zone)

  return {
    id: `zone-cover-${zone.id}`,
    kind,
    zone_slug: zoneRef?.slug ?? null,
    zone: zoneRef,
    url: toAbsoluteUrl(baseUrl, publishable),
    width: null,
    height: null,
    alt: fromPhoto?.alt || (zone.name ? `Coverfoto ${zone.name}` : null),
    credit:
      fromPhoto?.credit ??
      fallbackCredit(source, isStatic ? { full_name: 'Florian Thiers' } : null, null),
    uploader_name: fromPhoto?.uploader_name ?? null,
    artist_tag: fromPhoto?.artist_tag ?? null,
    source,
    license: null,
    has_recognisable_people: fromPhoto?.has_recognisable_people ?? true,
    is_cover: true,
    sort,
    updated_at: zone.updated_at || zone.created_at || new Date().toISOString(),
  }
}

function isEventPhoto(
  photo: { zone_id: string; created_at?: string | null },
  eventZoneId: string | null
): boolean {
  if (eventZoneId && photo.zone_id === eventZoneId) return true
  const created = photo.created_at ? Date.parse(photo.created_at) : NaN
  const from = Date.parse(FEST_2026_GALLERY_FROM)
  const to = Date.parse(FEST_2026_GALLERY_TO)
  return Number.isFinite(created) && created >= from && created < to
}

async function queryZonePhotos(
  supabase: SupabaseClient,
  query: MediaQuery,
  kind: MediaKind,
  zoneFilter: ZoneFilter,
  options: {
    baseUrl: string
    unapprovedUrls: Set<string> | null
    eventZoneId?: string | null
  }
): Promise<MediaItem[]> {
  const { zoneIds, zoneById } = zoneFilter
  if (zoneIds && zoneIds.length === 0) return []

  let dbQuery = supabase
    .from('zone_photos')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  if (zoneIds) {
    dbQuery = dbQuery.in('zone_id', zoneIds)
  }

  if (kind === 'event' && options.eventZoneId) {
    dbQuery = dbQuery.eq('zone_id', options.eventZoneId)
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
    photos.map((photo) => photo.submitted_by || '')
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
          sort,
          options.baseUrl
        )
      )
      sort += 1
    }
  }

  const zonesForCovers = (
    zoneIds ? zoneIds.map((id) => zoneById.get(id)) : [...zoneById.values()]
  ).filter((zone): zone is Zone => Boolean(zone))

  for (const zone of zonesForCovers) {
    if (kind === 'event' && options.eventZoneId && zone.id !== options.eventZoneId) {
      continue
    }
    if (
      kind === 'event' &&
      !options.eventZoneId &&
      !photos.some((photo) => photo.zone_id === zone.id)
    ) {
      continue
    }
    const matchedPhoto = photos.find((photo) => photo.public_url === zone.cover_url)
    const matched = matchedPhoto
      ? {
          photo: matchedPhoto,
          submitter: matchedPhoto.submitted_by
            ? profiles.get(matchedPhoto.submitted_by) ?? null
            : null,
        }
      : null
    const cover = coverItemFromZone(
      zone,
      kind,
      sort,
      options.baseUrl,
      options.unapprovedUrls,
      matched
    )
    if (!cover) continue
    if (query.updatedSince) {
      const since = Date.parse(query.updatedSince)
      if (Number.isFinite(since) && Date.parse(cover.updated_at) < since) continue
    }
    const alreadyListed = photos.some((photo) => photo.public_url === zone.cover_url)
    if (query.featured || !alreadyListed) {
      items.push(cover)
      sort += 1
    }
  }

  if (query.featured) {
    return items.filter((item) => item.is_cover)
  }
  return items
}

function dedupeById(items: MediaItem[]): MediaItem[] {
  const seen = new Set<string>()
  const unique: MediaItem[] = []
  for (const item of items) {
    if (!item.id || seen.has(item.id)) continue
    seen.add(item.id)
    unique.push(item)
  }
  return unique
}

async function withCreditOverrides(
  supabase: SupabaseClient,
  items: MediaItem[]
): Promise<MediaItem[]> {
  const overrides = await fetchCreditOverrides(
    supabase,
    items.map((item) => item.id)
  )
  return items.map((item) => applyCreditOverride(item, overrides.get(item.id)))
}

function itemMatchesZone(item: MediaItem, zoneIds: string[] | null): boolean {
  if (!zoneIds) return true
  if (!item.zone) return false
  return zoneIds.includes(item.zone.id)
}

async function getPublishedMediaItem(
  supabase: SupabaseClient,
  id: string,
  baseUrl: string,
  context: {
    unapprovedUrls: Set<string> | null
    zoneFilter: ZoneFilter
    eventZoneId: string | null
    kindHint?: MediaKind
  }
): Promise<MediaItem | null> {
  const parsed = parseStableMediaId(id)
  if (!parsed) return null

  if (parsed.kind === 'history') {
    if (context.kindHint && context.kindHint !== 'history') return null
    const manifest = await loadHistoryManifest()
    const entry = manifest.items.find((item) => item.id === parsed.id)
    return entry ? historyEntryToItem(entry, baseUrl) : null
  }

  if (context.kindHint === 'history') return null

  if (parsed.kind === 'cover') {
    const zone = context.zoneFilter.zoneById.get(parsed.zoneId)
    if (!zone) return null
    if (
      context.kindHint === 'event' &&
      context.eventZoneId &&
      zone.id !== context.eventZoneId
    ) {
      return null
    }
    const coverKind: MediaKind = context.kindHint === 'event' ? 'event' : 'zone'
    return coverItemFromZone(zone, coverKind, 0, baseUrl, context.unapprovedUrls, null)
  }

  const { data, error } = await supabase
    .from('zone_photos')
    .select('*')
    .eq('id', parsed.id)
    .eq('status', 'approved')
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  const photo = data as ZonePhotoRow
  if (context.kindHint === 'event' && !isEventPhoto(photo, context.eventZoneId)) {
    return null
  }
  const zone = context.zoneFilter.zoneById.get(photo.zone_id)
  const profiles = await loadSubmitterProfiles(supabase, [photo.submitted_by || ''])
  const kind: MediaKind = context.kindHint === 'event' ? 'event' : 'zone'
  return zonePhotoToItem(
    photo,
    zone,
    kind,
    photo.submitted_by ? profiles.get(photo.submitted_by) ?? null : null,
    zone?.cover_url ?? null,
    0,
    baseUrl
  )
}

export async function readPublishedMediaItem(
  supabase: SupabaseClient,
  id: string,
  baseUrl: string
): Promise<MediaItem | null> {
  const [zoneFilter, unapprovedUrls, eventZone] = await Promise.all([
    resolveZoneFilter(supabase),
    loadUnapprovedPhotoUrls(supabase),
    supabase
      .from('zones')
      .select('id')
      .eq('zone_number', FEST_ARCHIVE_ZONE_NUMBER)
      .maybeSingle(),
  ])

  const item = await getPublishedMediaItem(supabase, id, baseUrl, {
    unapprovedUrls,
    zoneFilter,
    eventZoneId: eventZone.data?.id ?? null,
  })
  if (!item) return null
  const [withCredit] = await withCreditOverrides(supabase, [item])
  return withCredit ?? null
}

export async function queryMediaItems(
  supabase: SupabaseClient,
  query: MediaQuery,
  options?: { baseUrl?: string; eventArchiveZoneId?: string | null }
): Promise<MediaItem[]> {
  const baseUrl = options?.baseUrl ?? ''
  const kinds: MediaKind[] = query.kind ? [query.kind] : ['zone', 'history', 'event']
  const zoneFilter = await resolveZoneFilter(supabase, query.zone)
  const unapprovedUrls = await loadUnapprovedPhotoUrls(supabase)

  let eventZoneId = options?.eventArchiveZoneId ?? null
  if (kinds.includes('event') && !eventZoneId) {
    const { data } = await supabase
      .from('zones')
      .select('id')
      .eq('zone_number', FEST_ARCHIVE_ZONE_NUMBER)
      .maybeSingle()
    eventZoneId = data?.id ?? null
  }

  const chunks: MediaItem[] = []

  if (kinds.includes('history')) {
    const manifest = await loadHistoryManifest()
    chunks.push(...historyItems(manifest, baseUrl, query))
  }

  const photoOptions = { baseUrl, unapprovedUrls, eventZoneId }

  if (kinds.includes('zone')) {
    chunks.push(...(await queryZonePhotos(supabase, query, 'zone', zoneFilter, photoOptions)))
  }

  if (kinds.includes('event')) {
    chunks.push(...(await queryZonePhotos(supabase, query, 'event', zoneFilter, photoOptions)))
  }

  let items = await withCreditOverrides(supabase, dedupeById(chunks))

  if (query.updatedSince) {
    const recent = await fetchCreditOverridesUpdatedSince(supabase, query.updatedSince)
    const have = new Set(items.map((item) => item.id))
    const missing = [...recent.keys()].filter((id) => !have.has(id))
    for (const id of missing) {
      const parsed = parseStableMediaId(id)
      if (!parsed) continue
      if (query.featured && parsed.kind !== 'cover') continue

      const extra = await getPublishedMediaItem(supabase, id, baseUrl, {
        unapprovedUrls,
        zoneFilter,
        eventZoneId,
        kindHint: query.kind,
      })
      if (!extra) continue
      if (!itemMatchesZone(extra, zoneFilter.zoneIds)) continue
      if (query.featured && !extra.is_cover) continue
      items.push(applyCreditOverride(extra, recent.get(id)))
    }

    const since = Date.parse(query.updatedSince)
    if (Number.isFinite(since)) {
      items = items.filter((item) => Date.parse(item.updated_at) >= since)
    }
  }

  items = dedupeById(items)
  items.sort((a, b) => a.sort - b.sort || a.id.localeCompare(b.id))

  const limit = query.limit ?? DEFAULT_LIMIT
  return items.slice(0, limit)
}

export function toMediaResponse(items: MediaItem[]) {
  return {
    synced_at: new Date().toISOString(),
    items,
  }
}
