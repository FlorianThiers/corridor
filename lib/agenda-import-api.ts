import type { SupabaseClient } from '@supabase/supabase-js'

import type { EvenementKind } from '@/types'

export const UC_AGENDA_EXTERNAL_SOURCE = 'urbanculture'

export type AgendaImportItem = {
  external_id: string
  kind: EvenementKind
  title: string
  description?: string | null
  start_datetime: string
  end_datetime?: string | null
  sport_slug?: string | null
  for_girls?: boolean
  is_highlight?: boolean
  zone_id?: string | null
}

export type AgendaImportResult = {
  upserted: number
  synced_at: string
}

function rowFromImport(item: AgendaImportItem) {
  return {
    external_source: UC_AGENDA_EXTERNAL_SOURCE,
    external_id: item.external_id,
    kind: item.kind ?? 'evenement',
    title: item.title,
    description: item.description ?? null,
    start_datetime: item.start_datetime,
    end_datetime: item.end_datetime ?? null,
    sport_slug: item.sport_slug ?? null,
    for_girls: item.for_girls ?? false,
    is_highlight: item.is_highlight ?? false,
    zone_id: item.zone_id ?? null,
    updated_at: new Date().toISOString(),
  }
}

export async function upsertAgendaImports(
  supabase: SupabaseClient,
  items: AgendaImportItem[],
): Promise<AgendaImportResult> {
  const syncedAt = new Date().toISOString()
  if (!items.length) {
    return { upserted: 0, synced_at: syncedAt }
  }

  const rows = items.map(rowFromImport)
  const { error } = await supabase
    .from('evenementen')
    .upsert(rows, { onConflict: 'external_source,external_id' })

  if (error) throw error

  return { upserted: rows.length, synced_at: syncedAt }
}

export function parseAgendaImportBody(body: unknown): AgendaImportItem[] {
  if (!body || typeof body !== 'object') {
    throw new Error('Invalid JSON body')
  }
  const raw = (body as { items?: unknown }).items
  if (!Array.isArray(raw)) {
    throw new Error('Expected { items: [...] }')
  }

  return raw.map((entry, index) => {
    if (!entry || typeof entry !== 'object') {
      throw new Error(`items[${index}] must be an object`)
    }
    const row = entry as Record<string, unknown>
    const externalId = row.external_id
    const title = row.title
    const start = row.start_datetime
    if (typeof externalId !== 'string' || !externalId.trim()) {
      throw new Error(`items[${index}].external_id is required`)
    }
    if (typeof title !== 'string' || !title.trim()) {
      throw new Error(`items[${index}].title is required`)
    }
    if (typeof start !== 'string' || !start.trim()) {
      throw new Error(`items[${index}].start_datetime is required`)
    }
    const kind = row.kind
    if (kind !== undefined && kind !== 'evenement' && kind !== 'activiteit') {
      throw new Error(`items[${index}].kind must be evenement or activiteit`)
    }

    return {
      external_id: externalId.trim(),
      kind: (kind as EvenementKind | undefined) ?? 'evenement',
      title: title.trim(),
      description:
        typeof row.description === 'string' ? row.description : null,
      start_datetime: start.trim(),
      end_datetime:
        typeof row.end_datetime === 'string' ? row.end_datetime : null,
      sport_slug:
        typeof row.sport_slug === 'string' ? row.sport_slug : null,
      for_girls: row.for_girls === true,
      is_highlight: row.is_highlight === true,
      zone_id: typeof row.zone_id === 'string' ? row.zone_id : null,
    }
  })
}
