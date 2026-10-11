'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getUsers, updateUser, deleteUser } from '@/lib/database'
import { useAuth } from '@/hooks/useAuth'
import type { User } from '@/types'
import {
  adminFilterButtonClass,
  compareUsers,
  filterUsers,
  formatAdminDateTime,
  USER_ROLE_LABELS,
  userRoleBadgeClass,
  type UserSortKey,
} from '@/lib/admin-ui'

const ROLE_OPTIONS: User['role'][] = ['user', 'admin', 'programmer', 'bestuurder']

export function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | User['role']>('all')
  const [sortKey, setSortKey] = useState<UserSortKey>('created_at')
  const [sortAsc, setSortAsc] = useState(false)
  const supabase = createClient()
  const { user: currentUser, refreshUserProfile } = useAuth()

  useEffect(() => {
    void loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const usersData = await getUsers(supabase)
      setUsers(usersData)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Fout bij laden van data')
    } finally {
      setLoading(false)
    }
  }

  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = { all: users.length }
    for (const r of ROLE_OPTIONS) counts[r] = 0
    for (const u of users) counts[u.role] = (counts[u.role] || 0) + 1
    return counts
  }, [users])

  const visibleUsers = useMemo(() => {
    const filtered = filterUsers(users, { search, roleFilter })
    return [...filtered].sort((a, b) => compareUsers(a, b, sortKey, sortAsc))
  }, [users, search, roleFilter, sortKey, sortAsc])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    if (!editingUser) return

    const formData = new FormData(e.currentTarget)
    const roleValue = formData.get('role') as User['role']
    const userData = {
      full_name: (formData.get('full_name') as string) || undefined,
      role: roleValue,
    }

    try {
      const updatedUser = await updateUser(supabase, editingUser.id, userData)

      const finalUserData: User = {
        ...updatedUser,
        role: updatedUser.role || userData.role,
      }

      setUsers((prev) =>
        prev.map((user) => (user.id === editingUser.id ? { ...user, ...finalUserData } : user))
      )

      setIsModalOpen(false)
      setEditingUser(null)

      window.dispatchEvent(
        new CustomEvent('userProfileUpdated', {
          detail: { userId: editingUser.id, newRole: userData.role },
        })
      )

      if (currentUser && editingUser.id === currentUser.id) {
        await refreshUserProfile()
        if (userData.role === 'admin' || userData.role === 'programmer') {
          setTimeout(() => {
            alert(
              'Je rol is bijgewerkt. De beheer-navigatie zou nu zichtbaar moeten zijn. Zie je die niet, ververs de pagina.'
            )
          }, 400)
        }
      }

      void loadData()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Fout bij opslaan')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Weet je zeker dat je deze gebruiker wilt verwijderen?')) return

    try {
      await deleteUser(supabase, id)
      await loadData()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Fout bij verwijderen')
    }
  }

  const openModal = (user: User) => {
    setEditingUser(user)
    setIsModalOpen(true)
    setError('')
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingUser(null)
    setError('')
  }

  const toggleSort = (key: UserSortKey) => {
    if (sortKey === key) {
      setSortAsc((v) => !v)
    } else {
      setSortKey(key)
      setSortAsc(key === 'name' || key === 'email' || key === 'role')
    }
  }

  const sortIndicator = (key: UserSortKey) => {
    if (sortKey !== key) return ''
    return sortAsc ? ' ↑' : ' ↓'
  }

  if (loading) {
    return <p className="text-gray-600 text-center">Gebruikers worden geladen...</p>
  }

  return (
    <div>
      <div className="mb-4 rounded-3xl bg-white/70 p-4 shadow-sm backdrop-blur-sm">
        <label htmlFor="admin-users-search" className="mb-2 block text-sm font-semibold text-gray-800">
          Zoeken
        </label>
        <input
          id="admin-users-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Naam, e-mail, user-ID of rol…"
          autoComplete="off"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base shadow-inner focus:border-transparent focus:ring-2 focus:ring-pink-500"
        />
        {search.trim() && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="mt-2 text-sm text-pink-600 hover:underline"
          >
            Zoekopdracht wissen
          </button>
        )}
      </div>

      <div className="mb-6 space-y-3 rounded-3xl bg-white/50 p-4 backdrop-blur-sm">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={adminFilterButtonClass(roleFilter === 'all')}
            onClick={() => setRoleFilter('all')}
          >
            Alle ({roleCounts.all})
          </button>
          {ROLE_OPTIONS.map((role) => (
            <button
              key={role}
              type="button"
              className={adminFilterButtonClass(roleFilter === role)}
              onClick={() => setRoleFilter(role)}
            >
              {USER_ROLE_LABELS[role]} ({roleCounts[role] ?? 0})
            </button>
          ))}
        </div>
        <div className="grid gap-3 md:grid-cols-1">
          <select
            value={`${sortKey}:${sortAsc ? 'asc' : 'desc'}`}
            onChange={(e) => {
              const [key, dir] = e.target.value.split(':') as [UserSortKey, 'asc' | 'desc']
              setSortKey(key)
              setSortAsc(dir === 'asc')
            }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="created_at:desc">Nieuwste eerst (aanmaak)</option>
            <option value="created_at:asc">Oudste eerst (aanmaak)</option>
            <option value="updated_at:desc">Laatst bijgewerkt</option>
            <option value="name:asc">Naam A–Z</option>
            <option value="name:desc">Naam Z–A</option>
            <option value="email:asc">E-mail A–Z</option>
            <option value="role:asc">Rol</option>
          </select>
        </div>
        <p className="text-xs text-gray-600">
          {visibleUsers.length} van {users.length} gebruikers
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-100 p-3 text-red-700">{error}</div>
      )}

      {visibleUsers.length === 0 ? (
        <p className="text-center text-gray-600">Geen gebruikers voor deze filters.</p>
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-3xl bg-white/60 backdrop-blur-sm md:block">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-gray-200/80 text-xs uppercase tracking-wide text-gray-600">
                <tr>
                  <th className="px-4 py-3">
                    <button type="button" className="font-semibold hover:text-pink-600" onClick={() => toggleSort('name')}>
                      Naam{sortIndicator('name')}
                    </button>
                  </th>
                  <th className="px-4 py-3">
                    <button type="button" className="font-semibold hover:text-pink-600" onClick={() => toggleSort('email')}>
                      E-mail{sortIndicator('email')}
                    </button>
                  </th>
                  <th className="px-4 py-3">
                    <button type="button" className="font-semibold hover:text-pink-600" onClick={() => toggleSort('role')}>
                      Rol{sortIndicator('role')}
                    </button>
                  </th>
                  <th className="px-4 py-3">
                    <button
                      type="button"
                      className="font-semibold hover:text-pink-600"
                      onClick={() => toggleSort('created_at')}
                    >
                      Aangemaakt{sortIndicator('created_at')}
                    </button>
                  </th>
                  <th className="px-4 py-3">
                    <button
                      type="button"
                      className="font-semibold hover:text-pink-600"
                      onClick={() => toggleSort('updated_at')}
                    >
                      Bijgewerkt{sortIndicator('updated_at')}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-right">Acties</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visibleUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/40">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {user.full_name || <span className="text-gray-500">Geen naam</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {user.email || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${userRoleBadgeClass(user.role)}`}
                      >
                        {USER_ROLE_LABELS[user.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                      {formatAdminDateTime(user.created_at)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                      {formatAdminDateTime(user.updated_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openModal(user)}
                          className="rounded-lg bg-blue-500 px-3 py-1.5 text-xs text-white hover:bg-blue-600"
                        >
                          Bewerken
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(user.id)}
                          className="rounded-lg bg-red-500 px-3 py-1.5 text-xs text-white hover:bg-red-600"
                        >
                          Verwijderen
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-4 md:hidden">
            {visibleUsers.map((user) => (
              <div key={user.id} className="rounded-3xl bg-white/60 p-5 backdrop-blur-sm card-hover">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-bold text-gray-800">
                      {user.full_name || 'Geen naam'}
                    </h3>
                    <p className="truncate text-sm text-gray-600">{user.email || 'Geen e-mail'}</p>
                    <p className="mt-1 font-mono text-xs text-gray-400">{user.id}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${userRoleBadgeClass(user.role)}`}
                  >
                    {USER_ROLE_LABELS[user.role]}
                  </span>
                </div>
                <dl className="mb-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div>
                    <dt className="font-medium text-gray-500">Aangemaakt</dt>
                    <dd>{formatAdminDateTime(user.created_at)}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Bijgewerkt</dt>
                    <dd>{formatAdminDateTime(user.updated_at)}</dd>
                  </div>
                </dl>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openModal(user)}
                    className="rounded-lg bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
                  >
                    Bewerken
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(user.id)}
                    className="rounded-lg bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600"
                  >
                    Verwijderen
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {isModalOpen && editingUser && (
        <div
          className="modal active"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal()
          }}
        >
          <div className="modal-content max-w-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Gebruiker bewerken</h2>
              <button type="button" onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">User ID</label>
                <input
                  type="text"
                  value={editingUser.id}
                  disabled
                  className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">E-mail</label>
                <input
                  type="email"
                  value={editingUser.email || ''}
                  disabled
                  placeholder="Niet opgeslagen in profiel"
                  className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Aangemaakt</label>
                  <p className="text-sm text-gray-800">{formatAdminDateTime(editingUser.created_at)}</p>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Laatst bijgewerkt</label>
                  <p className="text-sm text-gray-800">{formatAdminDateTime(editingUser.updated_at)}</p>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Naam</label>
                <input
                  type="text"
                  name="full_name"
                  defaultValue={editingUser.full_name || ''}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Rol *</label>
                <select
                  name="role"
                  defaultValue={editingUser.role}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-pink-500"
                >
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role} value={role}>
                      {USER_ROLE_LABELS[role]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-pink-500 py-2 font-medium text-white transition-colors hover:bg-pink-600"
                >
                  Opslaan
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-lg bg-gray-300 py-2 font-medium text-gray-800 transition-colors hover:bg-gray-400"
                >
                  Annuleren
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
