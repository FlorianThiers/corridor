import type { User } from '@/types'

/** Zelfde set als public.is_admin() in Supabase (admin + programmer). */
export const DB_ADMIN_ROLES: readonly User['role'][] = ['admin', 'programmer']

export function hasDbAdminRole(role: User['role'] | string | null | undefined): boolean {
  return role === 'admin' || role === 'programmer'
}