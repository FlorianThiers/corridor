import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

function isE2EMockEnabled(): boolean {
  return (
    process.env.E2E_MOCK_SUPABASE === '1' ||
    process.env.NEXT_PUBLIC_E2E_MOCK_SUPABASE === '1'
  )
}

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

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

  if (isE2EMockEnabled()) {
    return NextResponse.next()
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next()
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value))
      },
    },
  })

  // Zorgt dat auth-cookies naar SSR-routes (zoals /profiel) mee komen na client-login.
  try {
    await supabase.auth.getUser()
  } catch (error) {
    console.warn('middleware: supabase.auth.getUser() mislukt', error)
  }

  return response
}

export const config = {
  matcher: [
    '/',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
