import { createClient } from '@supabase/supabase-js'

import { createE2ESupabase } from '@/lib/supabase/e2e-mock'

/** Service-role client for agenda import API — never use in client components. */
export function createAdminClient() {
  if (
    process.env.E2E_MOCK_SUPABASE === '1' ||
    process.env.NEXT_PUBLIC_E2E_MOCK_SUPABASE === '1'
  ) {
    return createE2ESupabase() as unknown as ReturnType<typeof createClient>
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY) for agenda import.',
    )
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
