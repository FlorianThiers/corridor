import { NextRequest, NextResponse } from 'next/server'

import { isMediaApiAuthorized } from '@/lib/media-api-auth'
import { createMediaReadClient } from '@/lib/media-supabase'
import { resolvePublicBaseUrl } from '@/lib/public-url'
import { queryZoneSpots } from '@/lib/zones-api'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  if (!isMediaApiAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const baseUrl = resolvePublicBaseUrl(request.nextUrl.origin)
    const supabase = await createMediaReadClient()
    const zones = await queryZoneSpots(supabase, baseUrl)
    return NextResponse.json({
      synced_at: new Date().toISOString(),
      zones,
    })
  } catch (error) {
    console.error('GET /api/v1/zones failed:', error)
    return NextResponse.json({ error: 'Failed to load zones' }, { status: 500 })
  }
}
