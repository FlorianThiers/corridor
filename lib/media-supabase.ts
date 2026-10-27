import type { SupabaseClient } from '@supabase/supabase-js'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

/** Read path for UC feeds. Write paths must use the service role directly. */
export async function createMediaReadClient(): Promise<SupabaseClient> {
  try {
    return createAdminClient()
  } catch (adminError) {
    console.warn(
      'media-api: service role unavailable, falling back to anon client',
      adminError instanceof Error ? adminError.message : adminError
    )
    return createClient()
  }
}
