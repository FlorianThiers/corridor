import { NextRequest, NextResponse } from 'next/server'

import { isMediaApiAuthorized } from '@/lib/media-api-auth'
import {
  parseMediaQuery,
  queryMediaItems,
  resolvePublicBaseUrl,
  toMediaResponse,
} from '@/lib/media-api'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

function createMediaSupabase() {
  try {
    return createAdminClient()
  } catch (adminError) {
    console.warn(
      'media-api: service role unavailable, falling back to anon client',
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
    const query = parseMediaQuery(request.nextUrl.searchParams)
    const baseUrl = resolvePublicBaseUrl(request.nextUrl.origin)
    const admin = createMediaSupabase()
    const supabase = admin ?? await createClient()

    const items = await queryMediaItems(supabase, query, { baseUrl })
    return NextResponse.json(toMediaResponse(items))
  } catch (error) {
    console.error('GET /api/v1/media failed:', error)
    return NextResponse.json({ error: 'Failed to load media' }, { status: 500 })
  }
}
