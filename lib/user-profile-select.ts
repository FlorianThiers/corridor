import type { SupabaseClient } from '@supabase/supabase-js'
import type { User as UserProfile } from '@/types'

type UserProfileRow = Pick<UserProfile, 'id'> | UserProfile

/**
 * Haalt maximaal één users-rij op zonder maybeSingle/single (PGRST116 bij 0 of >1 rij).
 */
export async function fetchUserProfileById(
  supabase: SupabaseClient,
  userId: string,
  columns: string = '*'
): Promise<{ data: UserProfileRow | null; error: { code?: string; message: string } | null }> {
  const { data: rows, error } = await supabase.from('users').select(columns).eq('id', userId).limit(2)

  if (error) {
    return { data: null, error }
  }

  if (!rows?.length) {
    return { data: null, error: null }
  }

  if (rows.length > 1) {
    console.warn(
      `fetchUserProfileById: ${rows.length} users-rijen voor id ${userId}; eerste rij gebruikt.`
    )
  }

  return { data: rows[0] as UserProfileRow, error: null }
}