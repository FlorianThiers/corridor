import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  
  // Redirect email confirmation codes from homepage to callback route
  if (pathname === '/' && searchParams.has('code')) {
    const code = searchParams.get('code')
    const newUrl = new URL(`/auth/callback`, request.url)
    
    // Copy all query parameters
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
