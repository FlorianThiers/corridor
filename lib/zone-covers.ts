import type { SupabaseClient } from '@supabase/supabase-js'

export function isCuratedStaticCover(url: string): boolean {
  return url.startsWith('/zones/') || url.startsWith('/geschiedenis/')
}

/**
 * Pick a cover UC may publish.
 * `unapprovedUrls === null` means the moderation lookup failed: only curated
 * static paths and the approved-photo fallback are kept.
 */
export function resolveZoneCoverUrl(input: {
  coverUrl?: string | null
  approvedFallbackUrl?: string | null
  unapprovedUrls: Set<string> | null
}): string | null {
  const raw = input.coverUrl?.trim() || ''
  const fallback = input.approvedFallbackUrl?.trim() || ''
  const blocked = input.unapprovedUrls

  const allowed = (url: string): boolean => {
    if (!url) return false
    if (blocked?.has(url)) return false
    if (isCuratedStaticCover(url)) return true
    if (blocked === null) return false
    return true
  }

  if (allowed(raw)) return raw
  if (fallback && !blocked?.has(fallback)) return fallback
  return null
}

export async function loadUnapprovedPhotoUrls(
  supabase: SupabaseClient,
  options?: { canModerate?: boolean }
): Promise<Set<string> | null> {
  // The anon role cannot see pending or rejected rows. An empty result would
  // look like "nothing is blocked" and publish a pending cover URL.
  if (options?.canModerate === false) return null

  const { data, error } = await supabase
    .from('zone_photos')
    .select('public_url')
    .in('status', ['pending', 'rejected'])

  if (error) {
    console.warn('zone covers: could not load unapproved photo urls', error.message)
    return null
  }

  return new Set(
    (data ?? [])
      .map((row) => row.public_url)
      .filter((url): url is string => typeof url === 'string' && url.length > 0)
  )
}

/** Newest approved photo per zone, used when a zone has no publishable cover. */
export async function loadApprovedCoverFallbacks(
  supabase: SupabaseClient,
  zoneIds: string[]
): Promise<Map<string, string>> {
  const map = new Map<string, string>()
  const ids = [...new Set(zoneIds.filter(Boolean))]
  if (ids.length === 0) return map

  const { data, error } = await supabase
    .from('zone_photos')
    .select('zone_id, public_url, created_at')
    .in('zone_id', ids)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  if (error) {
    console.warn('zone covers: could not load approved fallbacks', error.message)
    return map
  }

  for (const row of data ?? []) {
    if (!row.zone_id || !row.public_url || map.has(row.zone_id)) continue
    map.set(row.zone_id, row.public_url)
  }
  return map
}
