import { NextRequest, NextResponse } from 'next/server'

import { isAgendaApiAuthorized } from '@/lib/agenda-api-auth'
import {
  parseAgendaImportBody,
  upsertAgendaImports,
} from '@/lib/agenda-import-api'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  if (!isAgendaApiAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const items = parseAgendaImportBody(body)
    const admin = createAdminClient()
    const result = await upsertAgendaImports(admin, items)
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    console.error('POST /api/v1/agenda/import failed:', error)
    const message =
      error instanceof Error ? error.message : 'Import failed'
    const status = message.startsWith('Expected') || message.includes('items[')
      ? 400
      : 500
    return NextResponse.json({ error: message }, { status })
  }
}
