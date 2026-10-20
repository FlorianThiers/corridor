import type { NextRequest } from 'next/server'

export function isAgendaApiAuthorized(request: NextRequest): boolean {
  const expected = process.env.CORRIDOR_AGENDA_API_KEY
  if (!expected) return false
  const header = request.headers.get('authorization')
  return header === `Bearer ${expected}`
}
