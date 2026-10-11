import type { User } from '@/types'

export function adminFilterButtonClass(active: boolean): string {
  return `px-4 py-2 rounded-full text-sm font-medium transition-colors ${
    active ? 'bg-pink-500 text-white' : 'bg-white/70 text-gray-700 hover:bg-white'
  }`
}

const dateTimeFormatter = new Intl.DateTimeFormat('nl-BE', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function formatAdminDateTime(iso?: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return dateTimeFormatter.format(d)
}

export const USER_ROLE_LABELS: Record<User['role'], string> = {
  user: 'Gebruiker',
  admin: 'Admin',
  programmer: 'Programmer',
  bestuurder: 'Bestuurder',
}

export function userRoleBadgeClass(role: User['role']): string {
  switch (role) {
    case 'admin':
      return 'bg-purple-100 text-purple-800'
    case 'programmer':
      return 'bg-indigo-100 text-indigo-800'
    case 'bestuurder':
      return 'bg-amber-100 text-amber-900'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

export type UserSortKey = 'created_at' | 'updated_at' | 'name' | 'role' | 'email'

export function compareUsers(a: User, b: User, sortKey: UserSortKey, ascending: boolean): number {
  const dir = ascending ? 1 : -1

  if (sortKey === 'name') {
    const na = (a.full_name || '').toLocaleLowerCase('nl-BE')
    const nb = (b.full_name || '').toLocaleLowerCase('nl-BE')
    return na.localeCompare(nb, 'nl-BE') * dir
  }

  if (sortKey === 'email') {
    const ea = (a.email || '').toLocaleLowerCase('nl-BE')
    const eb = (b.email || '').toLocaleLowerCase('nl-BE')
    return ea.localeCompare(eb, 'nl-BE') * dir
  }

  if (sortKey === 'role') {
    return a.role.localeCompare(b.role, 'nl-BE') * dir
  }

  const field = sortKey === 'updated_at' ? 'updated_at' : 'created_at'
  const ta = a[field] ? new Date(a[field]).getTime() : 0
  const tb = b[field] ? new Date(b[field]).getTime() : 0
  return (ta - tb) * dir
}

export function filterUsers(
  users: User[],
  options: {
    search: string
    roleFilter: 'all' | User['role']
  }
): User[] {
  const q = options.search.trim().toLowerCase()
  return users.filter((user) => {
    if (options.roleFilter !== 'all' && user.role !== options.roleFilter) return false
    if (!q) return true
    const hay = [
      user.full_name || '',
      user.email || '',
      user.id,
      user.role,
      USER_ROLE_LABELS[user.role],
    ]
      .join(' ')
      .toLowerCase()
    return hay.includes(q)
  })
}
