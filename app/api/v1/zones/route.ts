import { NextRequest, NextResponse } from 'next/server'

import { getZonesFeed } from '@/lib/media-http'
import { createMediaReadContext } from '@/lib/media-supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const result = await getZonesFeed({
    authorization: request.headers.get('authorization'),
    origin: request.nextUrl.origin,
    openClient: createMediaReadContext,
  })
  return NextResponse.json(result.body, { status: result.status })
}
