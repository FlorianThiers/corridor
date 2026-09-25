import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function homeRedirect(origin: string, kind: 'success' | 'error', message: string) {
  const url = new URL('/', origin)
  url.searchParams.set(kind, message)
  return NextResponse.redirect(url)
}

/**
 * Email confirm / magic-link callback.
 * - PKCE: ?code=… → exchangeCodeForSession (cookies must land on the redirect response)
 * - OTP: ?token_hash=…&type=signup → verifyOtp
 * If the mail already confirmed the user but session exchange fails (other browser /
 * missing PKCE verifier), show success + "log in" instead of a scary error.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const error_description = searchParams.get('error_description')

  if (error_description) {
    return homeRedirect(origin, 'error', error_description)
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    return homeRedirect(
      origin,
      'error',
      'Serverconfiguratie ontbreekt. Neem contact op met de beheerder.'
    )
  }

  let response = homeRedirect(
    origin,
    'success',
    'Je email is succesvol bevestigd! Je kunt nu inloggen.'
  )

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  let authError: { message: string } | null = null

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    authError = error
  } else if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    authError = error
  } else {
    return homeRedirect(
      origin,
      'error',
      'Geen verificatiecode gevonden. Controleer of je de juiste link hebt gebruikt.'
    )
  }

  if (authError) {
    console.error('Auth callback session error:', authError.message)
    // Confirm-link often verifies email server-side; PKCE can still fail in another browser.
    // User can password-login — treat as soft success.
    response = homeRedirect(
      origin,
      'success',
      'Je email is bevestigd. Log in met je wachtwoord.'
    )
    return response
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: existingProfile, error: profileError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      console.error('Error checking user profile in callback:', profileError)
    } else if (!existingProfile) {
      const fullName =
        (user.user_metadata?.full_name as string | undefined) ||
        (user.user_metadata?.name as string | undefined) ||
        (user.email?.split('@')[0] ?? 'Gebruiker')

      const { error: insertProfileError } = await supabase.from('users').insert([
        {
          id: user.id,
          email: user.email ?? '',
          full_name: fullName,
          role: 'user',
        },
      ])

      if (insertProfileError) {
        console.error('Error creating missing user profile in callback:', insertProfileError)
      }
    }
  }

  return response
}
