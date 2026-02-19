import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/'
  const error_description = requestUrl.searchParams.get('error_description')

  // If there's an error from Supabase, redirect with error message
  if (error_description) {
    const errorMessage = encodeURIComponent(error_description)
    return NextResponse.redirect(new URL(`/?error=${errorMessage}`, requestUrl.origin))
  }

  if (code) {
    try {
      const supabase = await createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Error exchanging code for session:', error)
        const errorMessage = encodeURIComponent('Er is een fout opgetreden bij het bevestigen van je email. Probeer opnieuw of neem contact op met de beheerder.')
        return NextResponse.redirect(new URL(`/?error=${errorMessage}`, requestUrl.origin))
      }

      // Email confirmation successful, redirect to home or specified page with success message
      const successMessage = encodeURIComponent('Je email is succesvol bevestigd! Je kunt nu inloggen.')
      return NextResponse.redirect(new URL(`${next}?success=${successMessage}`, requestUrl.origin))
    } catch (err) {
      console.error('Unexpected error in auth callback:', err)
      const errorMessage = encodeURIComponent('Er is een onverwachte fout opgetreden. Probeer het later opnieuw.')
      return NextResponse.redirect(new URL(`/?error=${errorMessage}`, requestUrl.origin))
    }
  }

  // If there's no code, redirect to home with error message
  const errorMessage = encodeURIComponent('Geen verificatiecode gevonden. Controleer of je de juiste link hebt gebruikt.')
  return NextResponse.redirect(new URL(`/?error=${errorMessage}`, requestUrl.origin))
}
