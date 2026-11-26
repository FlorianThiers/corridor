import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { fetchUserProfileById } from '@/lib/user-profile-select'

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
  const { data, error } = await fetchUserProfileById(supabase, user.id, '*')
  if (error || !data || !('email' in data)) return null
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
  
  const { data, error } = await fetchUserProfileById(supabase, user.id, 'role')
  const role = data && 'role' in data ? data.role : null

  if (error || !role || (role !== 'admin' && role !== 'programmer')) {
    redirect('/')
  }

  return user
}
