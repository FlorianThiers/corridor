import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function getUser() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    // Ignore refresh token errors - they're expected when tokens are invalid/expired
    if (error && (error.message?.includes('refresh_token') || error.message?.includes('token'))) {
      return null
    }
    
    return user
  } catch (error: any) {
    // Silently handle auth errors (user might not be logged in)
    if (error?.message?.includes('refresh_token') || error?.message?.includes('token')) {
      return null
    }
    console.error('Unexpected error getting user:', error)
    return null
  }
}

export async function getUserProfile() {
  const user = await getUser()
  if (!user) return null

  const supabase = await createClient()
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return data
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) {
    redirect('/')
  }
  return user
}

export async function requireAdmin() {
  const user = await requireAuth()
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!data || (data.role !== 'admin' && data.role !== 'programmer')) {
    redirect('/')
  }

  return user
}
