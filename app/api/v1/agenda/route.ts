import { NextRequest, NextResponse } from 'next/server'

import { isAgendaApiAuthorized } from '@/lib/agenda-api-auth'
import {
  parseAgendaQuery,
  queryAgendaItems,
  toAgendaResponse,
} from '@/lib/agenda-api'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  if (!isAgendaApiAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = await createClient()
    const items = await queryAgendaItems(
      supabase,
      parseAgendaQuery(request.nextUrl.searchParams)
    )
    return NextResponse.json(toAgendaResponse(items))
  } catch (error) {
    console.error('GET /api/v1/agenda failed:', error)
    return NextResponse.json({ error: 'Failed to load agenda' }, { status: 500 })
  }
}
