import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

/** Survives Next.js HMR — module-level `let` resets but the old client keeps the auth lock. */
const GLOBAL_KEY = '__corridor_supabase_browser_client__'

type BrowserClient = SupabaseClient

function getGlobalClient(): BrowserClient | undefined {
  return (globalThis as typeof globalThis & { [GLOBAL_KEY]?: BrowserClient })[GLOBAL_KEY]
}

function setGlobalClient(client: BrowserClient) {
  ;(globalThis as typeof globalThis & { [GLOBAL_KEY]?: BrowserClient })[GLOBAL_KEY] = client
}

export function createClient(): BrowserClient {
  const existing = getGlobalClient()
  if (existing) {
    return existing
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.'
    )
  }

  const client = createBrowserClient(supabaseUrl, supabaseAnonKey)
  setGlobalClient(client)
  return client
}
