import { createClient } from '@supabase/supabase-js'

/** Service-role client for agenda import API — never use in client components. */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      'Missing server-only SUPABASE_SERVICE_ROLE_KEY (set in .env.local / Vercel, never NEXT_PUBLIC_).',
    )
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
