import { NextRequest, NextResponse } from 'next/server'

import {
  parseAgendaQuery,
  queryAgendaItems,
  toAgendaResponse,
} from '@/lib/agenda-api'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

function isAuthorized(request: NextRequest): boolean {
  const expected = process.env.CORRIDOR_AGENDA_API_KEY
  if (!expected) return false
  const header = request.headers.get('authorization')
  return header === `Bearer ${expected}`
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
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
