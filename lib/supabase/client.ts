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

const e2eMockEnabled = process.env.NEXT_PUBLIC_E2E_MOCK_SUPABASE === '1'

export function createClient(): BrowserClient {
  const existing = getGlobalClient()
  if (existing) {
    return existing
  }

  if (e2eMockEnabled) {
    // Alleen gebundeld wanneer de publieke e2e-vlag op '1' staat.
    const { createE2ESupabase } = require('./e2e-mock') as typeof import('./e2e-mock')
    const mock = createE2ESupabase() as unknown as BrowserClient
    setGlobalClient(mock)
    return mock
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
