import { NextRequest, NextResponse } from 'next/server'

import { getMediaFeed } from '@/lib/media-http'
import { createMediaReadContext } from '@/lib/media-supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const result = await getMediaFeed({
    authorization: request.headers.get('authorization'),
    origin: request.nextUrl.origin,
    search: request.nextUrl.search,
    openClient: createMediaReadContext,
  })
  return NextResponse.json(result.body, { status: result.status })
}
