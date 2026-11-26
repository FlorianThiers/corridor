import { NextRequest, NextResponse } from 'next/server'

import { isMediaApiAuthorized } from '@/lib/media-api-auth'
import {
  parseMediaQuery,
  queryMediaItems,
  resolvePublicBaseUrl,
  toMediaResponse,
} from '@/lib/media-api'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  if (!isMediaApiAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let supabase
  try {
    supabase = createAdminClient()
  } catch (adminError) {
    const message =
      adminError instanceof Error
        ? adminError.message
        : 'SUPABASE_SERVICE_ROLE_KEY ontbreekt'
    console.error('GET /api/v1/media: service-role client unavailable:', message)
    return NextResponse.json(
      { error: 'Media API is niet geconfigureerd (server-only service key ontbreekt).' },
      { status: 503 }
    )
  }

  try {
    const query = parseMediaQuery(request.nextUrl.searchParams)
    const baseUrl = resolvePublicBaseUrl(request.nextUrl.origin)
    const items = await queryMediaItems(supabase, query, { baseUrl })
    return NextResponse.json(toMediaResponse(items))
  } catch (error) {
    console.error('GET /api/v1/media failed:', error)
    return NextResponse.json({ error: 'Failed to load media' }, { status: 500 })
  }
}
