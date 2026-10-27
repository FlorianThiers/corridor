import { NextRequest, NextResponse } from 'next/server'

import { isMediaApiAuthorized } from '@/lib/media-api-auth'
import { resolvePublicBaseUrl } from '@/lib/media-api'
import {
  parseZonesQuery,
  queryZonesForApi,
  toZonesResponse,
  ZONES_API_CACHE_CONTROL,
} from '@/lib/zones-api'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

function createZonesSupabase() {
  try {
    return createAdminClient()
  } catch (adminError) {
    console.warn(
      'zones-api: service role unavailable, falling back to anon client',
      adminError instanceof Error ? adminError.message : adminError
    )
    return null
  }
}

export async function GET(request: NextRequest) {
  if (!isMediaApiAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const query = parseZonesQuery(request.nextUrl.searchParams)
    const baseUrl = resolvePublicBaseUrl(request.nextUrl.origin)
    const admin = createZonesSupabase()
    const supabase = admin ?? await createClient()

    const zones = await queryZonesForApi(supabase, query, { baseUrl })
    const response = NextResponse.json(toZonesResponse(zones))
    response.headers.set('Cache-Control', ZONES_API_CACHE_CONTROL)
    return response
  } catch (error) {
    console.error('GET /api/v1/zones failed:', error)
    return NextResponse.json({ error: 'Failed to load zones' }, { status: 500 })
  }
}
