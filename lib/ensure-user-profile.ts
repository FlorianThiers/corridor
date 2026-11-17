import type { SupabaseClient, User as AuthUser } from '@supabase/supabase-js'

function displayNameFromAuthUser(user: AuthUser): string {
  const metadata = user.user_metadata as Record<string, unknown> | undefined
  const fullName = metadata?.full_name
  if (typeof fullName === 'string' && fullName.trim()) return fullName.trim()
  const name = metadata?.name
  if (typeof name === 'string' && name.trim()) return name.trim()
  const local = user.email?.split('@')[0]
  return local?.trim() || 'Gebruiker'
}

/**
 * Oudere accounts hebben soms wel auth.users maar geen public.users-rij
 * (mislukt handle_new_user, handmatige auth-aanmaak, enz.).
 */
export async function ensureUserProfileRow(
  supabase: SupabaseClient,
  user: AuthUser
): Promise<boolean> {
  const { data: existing, error: selectError } = await supabase
    .from('users')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  if (selectError && selectError.code !== 'PGRST116') {
    console.warn('ensureUserProfileRow: kon profiel niet controleren:', selectError.message)
    return false
  }
  if (existing) return true

  const email = (user.email ?? '').trim().toLowerCase()
  const { error: insertError } = await supabase.from('users').insert([
    {
      id: user.id,
      email,
      full_name: displayNameFromAuthUser(user),
      role: 'user',
    },
  ])

  if (insertError) {
    console.warn('ensureUserProfileRow: insert mislukt (vaak RLS):', insertError.message)
    return false
  }
  return true
}
