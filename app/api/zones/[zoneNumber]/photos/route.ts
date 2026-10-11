import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getApprovedZonePhotosPage, getZoneByNumber } from '@/lib/database'
import { ZONE_GALLERY_PAGE_SIZE } from '@/lib/zone-gallery'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ zoneNumber: string }> }
) {
  const { zoneNumber } = await context.params
  const n = Number(zoneNumber)
  if (!Number.isInteger(n) || n < 1) {
    return NextResponse.json({ error: 'Invalid zone' }, { status: 400 })
  }

  const offset = Math.max(0, Number(request.nextUrl.searchParams.get('offset') || 0))
  const limit = Math.min(
    48,
    Math.max(1, Number(request.nextUrl.searchParams.get('limit') || ZONE_GALLERY_PAGE_SIZE))
  )

  try {
    const supabase = await createClient()
    const zone = await getZoneByNumber(supabase, n)
    if (!zone) {
      return NextResponse.json({ error: 'Zone not found' }, { status: 404 })
    }

    const photos = await getApprovedZonePhotosPage(supabase, zone.id, { offset, limit })
    return NextResponse.json({
      photos: photos.map((p) => ({
        id: p.id,
        public_url: p.public_url,
        caption: p.caption,
      })),
    })
  } catch (error) {
    console.error('GET zone photos failed:', error)
    return NextResponse.json({ error: 'Failed to load photos' }, { status: 500 })
  }
}
