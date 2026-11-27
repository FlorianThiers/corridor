import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

import { createE2ESupabase } from '@/lib/supabase/e2e-mock'

function isE2EMockEnabled(): boolean {
  return (
    process.env.E2E_MOCK_SUPABASE === '1' ||
    process.env.NEXT_PUBLIC_E2E_MOCK_SUPABASE === '1'
  )
}

export async function createClient() {
  if (isE2EMockEnabled()) {
    return createE2ESupabase() as unknown as Awaited<ReturnType<typeof createServerClient>>
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // Log error for debugging
    const errorMsg = 'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your Vercel project settings (Environment Variables).'
    
    console.error('Missing Supabase environment variables:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      env: process.env.NODE_ENV,
      error: errorMsg,
    })
    
    // During build time or runtime, throw error
    // This will be caught by error boundaries or try-catch blocks
    throw new Error(errorMsg)
  }

  const cookieStore = await cookies()

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
