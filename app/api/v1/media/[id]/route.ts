import { NextRequest, NextResponse } from 'next/server'

import { patchMediaCredit } from '@/lib/media-http'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await context.params
  const result = await patchMediaCredit({
    authorization: request.headers.get('authorization'),
    origin: request.nextUrl.origin,
    rawId,
    readBody: () => request.json(),
    openClient: () => {
      try {
        return createAdminClient()
      } catch (error) {
        console.error('PATCH /api/v1/media/:id service role unavailable', error)
        return null
      }
    },
  })
  return NextResponse.json(result.body, { status: result.status })
}
