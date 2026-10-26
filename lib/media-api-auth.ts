import type { NextRequest } from 'next/server'

function bearerMatches(request: NextRequest, expected: string | undefined): boolean {
  if (!expected) return false
  const header = request.headers.get('authorization')
  return header === `Bearer ${expected}`
}

/** Read-only Corridor APIs (media feed). Accepts dedicated media key or agenda key. */
export function isMediaApiAuthorized(request: NextRequest): boolean {
  if (bearerMatches(request, process.env.CORRIDOR_MEDIA_API_KEY)) {
    return true
  }
  return bearerMatches(request, process.env.CORRIDOR_AGENDA_API_KEY)
}
