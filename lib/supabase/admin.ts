import 'server-only'

import { createClient } from '@supabase/supabase-js'

import { createE2ESupabase } from '@/lib/supabase/e2e-mock'

/**
 * Service-role Supabase client. Bypasses RLS.
 * Server-only: never import this from a Client Component.
 * Reads only SUPABASE_SERVICE_ROLE_KEY — never a NEXT_PUBLIC_ variable.
 */
export function createAdminClient() {
  if (
    process.env.E2E_MOCK_SUPABASE === '1' ||
    process.env.NEXT_PUBLIC_E2E_MOCK_SUPABASE === '1'
  ) {
    return createE2ESupabase() as unknown as ReturnType<typeof createClient>
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

  if (!url || !key) {
    const missing: string[] = []
    if (!url) missing.push('NEXT_PUBLIC_SUPABASE_URL')
    if (!key) missing.push('SUPABASE_SERVICE_ROLE_KEY')
    throw new Error(
      `Missing ${missing.join(' and ')} for the Supabase admin client. ` +
        'SUPABASE_SERVICE_ROLE_KEY is server-only: set it in Vercel for Production, Preview, and Development. ' +
        'Never put the service role key in a NEXT_PUBLIC_ variable; that exposes it to the browser and bypasses row level security.',
    )
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
