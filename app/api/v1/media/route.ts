import { NextRequest, NextResponse } from 'next/server'

import { isMediaApiAuthorized } from '@/lib/media-api-auth'
import {
  parseMediaQuery,
  queryMediaItems,
  resolvePublicBaseUrl,
  toMediaResponse,
} from '@/lib/media-api'
import { createMediaReadClient } from '@/lib/media-supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  if (!isMediaApiAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const query = parseMediaQuery(request.nextUrl.searchParams)
    const baseUrl = resolvePublicBaseUrl(request.nextUrl.origin)
    const supabase = await createMediaReadClient()
    const items = await queryMediaItems(supabase, query, { baseUrl })
    return NextResponse.json(toMediaResponse(items))
  } catch (error) {
    console.error('GET /api/v1/media failed:', error)
    return NextResponse.json({ error: 'Failed to load media' }, { status: 500 })
  }
}
