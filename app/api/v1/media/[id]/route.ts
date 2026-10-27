import { NextRequest, NextResponse } from 'next/server'

import { isMediaWriteAuthorized } from '@/lib/media-api-auth'
import { readPublishedMediaItem, resolvePublicBaseUrl } from '@/lib/media-api'
import { parseCreditWriteBody } from '@/lib/media-credit-write'
import {
  deleteCreditOverride,
  isMissingRelation,
  upsertCreditOverride,
} from '@/lib/media-credit-store'
import { parseStableMediaId } from '@/lib/media-ids'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!isMediaWriteAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: rawId } = await context.params
  let id = rawId
  try {
    id = decodeURIComponent(rawId)
  } catch {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  if (!parseStableMediaId(id)) {
    return NextResponse.json({ error: 'Unknown media id' }, { status: 404 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = parseCreditWriteBody(body)
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  let supabase
  try {
    supabase = createAdminClient()
  } catch (error) {
    console.error('PATCH /api/v1/media/:id service role unavailable', error)
    return NextResponse.json({ error: 'Credit updates are unavailable' }, { status: 503 })
  }

  const baseUrl = resolvePublicBaseUrl(request.nextUrl.origin)

  try {
    const existing = await readPublishedMediaItem(supabase, id, baseUrl)
    if (!existing) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    if (parsed.credit === null) {
      await deleteCreditOverride(supabase, id)
    } else {
      await upsertCreditOverride(supabase, id, parsed.credit)
    }

    const updated = await readPublishedMediaItem(supabase, id, baseUrl)
    return NextResponse.json({
      id,
      credit: updated?.credit ?? parsed.credit,
      updated_at: updated?.updated_at ?? new Date().toISOString(),
    })
  } catch (error) {
    const relationError = error as { code?: string; message?: string }
    if (isMissingRelation(relationError)) {
      return NextResponse.json(
        { error: 'Credit overrides are not available yet' },
        { status: 503 }
      )
    }
    console.error('PATCH /api/v1/media/:id failed:', error)
    return NextResponse.json({ error: 'Failed to update credit' }, { status: 500 })
  }
}
