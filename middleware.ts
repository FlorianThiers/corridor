import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // Email confirmation / magic link sometimes lands on / with ?code= or ?token_hash=
  if (
    pathname === '/' &&
    (searchParams.has('code') || searchParams.has('token_hash'))
  ) {
    const newUrl = new URL('/auth/callback', request.url)
    searchParams.forEach((value, key) => {
      newUrl.searchParams.set(key, value)
    })
    return NextResponse.redirect(newUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/',
}
