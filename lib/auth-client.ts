/**
 * Client-side auth helpers (login modal, signup, password reset).
 * Keep in sync with Supabase Auth email handling (trim + lowercase).
 */

export function normalizeAuthEmail(raw: string): string {
  return raw.trim().toLowerCase()
}

export function friendlyAuthError(raw: string, fallback: string): string {
  const msg = raw.toLowerCase()
  if (msg.includes('rate limit') || msg.includes('over_email') || msg.includes('only request this after')) {
    return 'Even geduld: te veel verificatiemails. Wacht even, of log in als je account al bestaat.'
  }
  if (msg.includes('already') || msg.includes('registered') || msg.includes('exists')) {
    return 'Dit e-mailadres heeft al een account. Log in of gebruik "Wachtwoord vergeten".'
  }
  if (
    msg.includes('invalid login') ||
    msg.includes('invalid credentials') ||
    msg.includes('invalid email or password')
  ) {
    return 'Onjuist e-mailadres of wachtwoord. Controleer spaties of hoofdletters in je e-mail.'
  }
  if (msg.includes('email not confirmed')) {
    return 'Je e-mailadres is nog niet bevestigd. Check je inbox (ook spam) of vraag een nieuwe link aan.'
  }
  return raw || fallback
}
