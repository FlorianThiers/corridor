import type { SupabaseClient } from '@supabase/supabase-js'

export type CreditOverride = {
  media_id: string
  credit: string
  updated_at: string
}

const TABLE = 'media_credit_overrides'

type PostgrestLikeError = { code?: string; message?: string }

export function isMissingRelation(error: PostgrestLikeError | null | undefined): boolean {
  if (!error) return false
  if (error.code === '42P01' || error.code === 'PGRST205' || error.code === 'PGRST204') {
    return true
  }
  const message = error.message ?? ''
  return /does not exist|schema cache|Could not find the table/i.test(message)
}

function rowToOverride(row: {
  media_id?: string | null
  credit?: string | null
  updated_at?: string | null
}): CreditOverride | null {
  if (!row.media_id || !row.credit || !row.updated_at) return null
  return {
    media_id: row.media_id,
    credit: row.credit,
    updated_at: row.updated_at,
  }
}

export async function fetchCreditOverrides(
  supabase: SupabaseClient,
  mediaIds: string[]
): Promise<Map<string, CreditOverride>> {
  const map = new Map<string, CreditOverride>()
  const ids = [...new Set(mediaIds.filter(Boolean))]
  if (ids.length === 0) return map

  const chunkSize = 100
  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize)
    const { data, error } = await supabase
      .from(TABLE)
      .select('media_id, credit, updated_at')
      .in('media_id', chunk)

    if (error) {
      if (!isMissingRelation(error)) {
        console.warn('media-api: credit overrides unavailable', error.message)
      }
      return map
    }

    for (const row of data ?? []) {
      const override = rowToOverride(row)
      if (override) map.set(override.media_id, override)
    }
  }

  return map
}

export async function fetchCreditOverridesUpdatedSince(
  supabase: SupabaseClient,
  updatedSince: string
): Promise<Map<string, CreditOverride>> {
  const map = new Map<string, CreditOverride>()
  const { data, error } = await supabase
    .from(TABLE)
    .select('media_id, credit, updated_at')
    .gte('updated_at', updatedSince)

  if (error) {
    if (!isMissingRelation(error)) {
      console.warn('media-api: credit override sync unavailable', error.message)
    }
    return map
  }

  for (const row of data ?? []) {
    const override = rowToOverride(row)
    if (override) map.set(override.media_id, override)
  }
  return map
}

export async function upsertCreditOverride(
  supabase: SupabaseClient,
  mediaId: string,
  credit: string
): Promise<{ updated_at: string }> {
  const updated_at = new Date().toISOString()
  const { error } = await supabase.from(TABLE).upsert(
    { media_id: mediaId, credit, updated_at },
    { onConflict: 'media_id' }
  )
  if (error) throw error
  return { updated_at }
}

export async function deleteCreditOverride(
  supabase: SupabaseClient,
  mediaId: string
): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq('media_id', mediaId)
  if (error) throw error
}
