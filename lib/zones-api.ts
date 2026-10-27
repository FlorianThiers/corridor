import type { SupabaseClient } from '@supabase/supabase-js'

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
  baseUrl: string
): Promise<ZoneSpot[]> {
  const { data, error } = await supabase
    .from('zones')
    .select('*')
    .order('zone_number', { ascending: true })

  if (error) throw error
  const rows = (data ?? []) as ZoneSpotRow[]
  const [unapprovedUrls, fallbacks] = await Promise.all([
    loadUnapprovedPhotoUrls(supabase),
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
