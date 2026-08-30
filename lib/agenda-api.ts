import type { SupabaseClient } from '@supabase/supabase-js'

import { SPORT_OPTIONS, isSportSlug, type SportSlug } from '@/lib/sports'
import type { Evenement, EvenementKind } from '@/types'

export type AgendaQuery = {
  kind?: EvenementKind
  sport?: SportSlug
  from?: string
  to?: string
  updatedSince?: string
}

export async function queryAgendaItems(
  supabase: SupabaseClient,
  query: AgendaQuery = {}
): Promise<Evenement[]> {
  let dbQuery = supabase
    .from('evenementen')
    .select('*, zones(*)')
    .order('start_datetime', { ascending: true })

  if (query.kind) {
    dbQuery = dbQuery.eq('kind', query.kind)
  }
  if (query.sport) {
    dbQuery = dbQuery.eq('sport_slug', query.sport)
  }
  if (query.from) {
    dbQuery = dbQuery.gte('start_datetime', query.from)
  }
  if (query.to) {
    dbQuery = dbQuery.lte('start_datetime', query.to)
  }
  if (query.updatedSince) {
    dbQuery = dbQuery.gte('updated_at', query.updatedSince)
  }

  const { data, error } = await dbQuery
  if (error) throw error
  return data ?? []
}

export function toAgendaResponse(items: Evenement[]) {
  return {
    synced_at: new Date().toISOString(),
    sports: SPORT_OPTIONS.map(({ slug, label }) => ({ slug, label })),
    items: items.map((item) => ({
      id: item.id,
      kind: item.kind ?? 'evenement',
      title: item.title,
      description: item.description ?? null,
      start_datetime: item.start_datetime,
      end_datetime: item.end_datetime ?? null,
      sport_slug: item.sport_slug ?? null,
      for_girls: item.for_girls ?? false,
      is_highlight: item.is_highlight ?? false,
      zone_id: item.zone_id ?? null,
      zones: item.zones
        ? {
            id: item.zones.id,
            name: item.zones.name,
            zone_number: item.zones.zone_number,
          }
        : null,
      updated_at: item.updated_at ?? item.created_at ?? null,
    })),
  }
}

export function parseAgendaQuery(searchParams: URLSearchParams): AgendaQuery {
  const kind = searchParams.get('kind')
  const sport = searchParams.get('sport')
  const from = searchParams.get('from') ?? undefined
  const to = searchParams.get('to') ?? undefined
  const updatedSince = searchParams.get('updated_since') ?? undefined

  return {
    kind:
      kind === 'evenement' || kind === 'activiteit' ? kind : undefined,
    sport: sport && isSportSlug(sport) ? sport : undefined,
    from,
    to,
    updatedSince,
  }
}
