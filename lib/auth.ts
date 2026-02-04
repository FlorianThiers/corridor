import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
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
