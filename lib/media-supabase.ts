import type { SupabaseClient } from '@supabase/supabase-js'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export type MediaReadContext = {
  supabase: SupabaseClient
  /**
   * True only for the service role, which can see pending and rejected photos.
   * The anon fallback cannot; cover selection must then fail closed.
   */
  canModerate: boolean
}

/** Read path for UC feeds. Write paths must use the service role directly. */
export async function createMediaReadContext(): Promise<MediaReadContext> {
  try {
    return { supabase: createAdminClient(), canModerate: true }
  } catch (adminError) {
    console.warn(
      'media-api: service role unavailable, falling back to anon client',
      adminError instanceof Error ? adminError.message : adminError
    )
    return { supabase: await createClient(), canModerate: false }
  }
}
