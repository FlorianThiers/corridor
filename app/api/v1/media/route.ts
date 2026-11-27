import { NextRequest, NextResponse } from 'next/server'

import { getMediaFeed } from '@/lib/media-http'
import type { MediaReadContext } from '@/lib/media-supabase'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

async function openMediaAdminClient(): Promise<MediaReadContext> {
  return { supabase: createAdminClient(), canModerate: true }
}

export async function GET(request: NextRequest) {
  try {
    createAdminClient()
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

  const result = await getMediaFeed({
    authorization: request.headers.get('authorization'),
    origin: request.nextUrl.origin,
    search: request.nextUrl.search,
    openClient: openMediaAdminClient,
  })
  return NextResponse.json(result.body, { status: result.status })
}