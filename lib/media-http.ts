import type { SupabaseClient } from '@supabase/supabase-js'

import { isMediaApiAuthorized, isMediaWriteAuthorized } from './media-api-auth'
import {
  MediaQueryError,
  parseMediaQuery,
  queryMediaItems,
  readPublishedMediaItem,
  resolvePublicBaseUrl,
  toMediaResponse,
} from './media-api'
import { parseCreditWriteBody } from './media-credit-write'
import {
  deleteCreditOverride,
  isMissingRelation,
  upsertCreditOverride,
} from './media-credit-store'
import { canonicalMediaId } from './media-ids'
import { queryZoneSpots } from './zones-api'

export type ApiResult = {
  status: number
  body: unknown
}

type HeaderSource = {
  headers: { get(name: string): string | null }
}

function asRequest(authorization: string | null): HeaderSource {
  return {
    headers: {
      get(name: string) {
        return name.toLowerCase() === 'authorization' ? authorization : null
      },
    },
  }
}

export async function getMediaFeed(input: {
  authorization: string | null
  origin: string
  search: string
  openClient: () => Promise<{ supabase: SupabaseClient; canModerate: boolean }>
}): Promise<ApiResult> {
  if (!isMediaApiAuthorized(asRequest(input.authorization))) {
    return { status: 401, body: { error: 'Unauthorized' } }
  }

  try {
    const search = input.search.startsWith('?') ? input.search.slice(1) : input.search
    const query = parseMediaQuery(new URLSearchParams(search))
    const { supabase, canModerate } = await input.openClient()
    const items = await queryMediaItems(supabase, query, {
      baseUrl: resolvePublicBaseUrl(input.origin),
      canModerate,
    })
    return { status: 200, body: toMediaResponse(items) }
  } catch (error) {
    if (error instanceof MediaQueryError) {
      return { status: 400, body: { error: error.message } }
    }
    console.error('GET /api/v1/media failed:', error)
    return { status: 500, body: { error: 'Failed to load media' } }
  }
}

export async function getZonesFeed(input: {
  authorization: string | null
  origin: string
  openClient: () => Promise<{ supabase: SupabaseClient; canModerate: boolean }>
}): Promise<ApiResult> {
  if (!isMediaApiAuthorized(asRequest(input.authorization))) {
    return { status: 401, body: { error: 'Unauthorized' } }
  }

  try {
    const { supabase, canModerate } = await input.openClient()
    const zones = await queryZoneSpots(supabase, resolvePublicBaseUrl(input.origin), {
      canModerate,
    })
    return {
      status: 200,
      body: { synced_at: new Date().toISOString(), zones },
    }
  } catch (error) {
    console.error('GET /api/v1/zones failed:', error)
    return { status: 500, body: { error: 'Failed to load zones' } }
  }
}

export async function patchMediaCredit(input: {
  authorization: string | null
  origin: string
  rawId: string
  readBody: () => Promise<unknown>
  openClient: () => SupabaseClient | null
}): Promise<ApiResult> {
  if (!isMediaWriteAuthorized(asRequest(input.authorization))) {
    return { status: 401, body: { error: 'Unauthorized' } }
  }

  let decoded = input.rawId
  try {
    decoded = decodeURIComponent(input.rawId)
  } catch {
    return { status: 400, body: { error: 'Invalid id' } }
  }

  const id = canonicalMediaId(decoded)
  if (!id) {
    return { status: 404, body: { error: 'Unknown media id' } }
  }

  let body: unknown
  try {
    body = await input.readBody()
  } catch {
    return { status: 400, body: { error: 'Invalid JSON body' } }
  }

  const parsed = parseCreditWriteBody(body)
  if (!parsed.ok) {
    return { status: 400, body: { error: parsed.error } }
  }

  const supabase = input.openClient()
  if (!supabase) {
    return { status: 503, body: { error: 'Credit updates are unavailable' } }
  }

  const baseUrl = resolvePublicBaseUrl(input.origin)

  try {
    const existing = await readPublishedMediaItem(supabase, id, baseUrl)
    if (!existing) {
      return { status: 404, body: { error: 'Media not found' } }
    }

    if (parsed.credit === null) {
      await deleteCreditOverride(supabase, id)
    } else {
      await upsertCreditOverride(supabase, id, parsed.credit)
    }

    const updated = await readPublishedMediaItem(supabase, id, baseUrl)
    return {
      status: 200,
      body: {
        id,
        credit: updated?.credit ?? parsed.credit,
        updated_at: updated?.updated_at ?? new Date().toISOString(),
      },
    }
  } catch (error) {
    const relationError = error as { code?: string; message?: string }
    if (isMissingRelation(relationError)) {
      return {
        status: 503,
        body: { error: 'Credit overrides are not available yet' },
      }
    }
    console.error('PATCH /api/v1/media/:id failed:', error)
    return { status: 500, body: { error: 'Failed to update credit' } }
  }
}
