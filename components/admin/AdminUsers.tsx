'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getUsers, updateUser, deleteUser } from '@/lib/database'
import { useAuth } from '@/hooks/useAuth'
import type { User } from '@/types'

export function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [error, setError] = useState('')
  const supabase = createClient()
  const { user: currentUser, refreshUserProfile } = useAuth()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const usersData = await getUsers(supabase)
      setUsers(usersData)
    } catch (err: any) {
      setError(err.message || 'Fout bij laden van data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    
    if (!editingUser) return

    const formData = new FormData(e.currentTarget)
    const roleValue = formData.get('role') as string
    const userData = {
      full_name: formData.get('full_name') as string || undefined,
      role: roleValue as 'user' | 'admin' | 'programmer' | 'bestuurder',
    }

    try {
      console.log('Updating user:', editingUser.id, 'with data:', userData)
      const oldRole = editingUser.role
      const updatedUser = await updateUser(supabase, editingUser.id, userData)
      console.log('User updated successfully:', updatedUser)
      
      // Immediately update the local state with the returned user data
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === editingUser.id 
            ? { ...user, ...updatedUser }
            : user
        )
      )
      
      setIsModalOpen(false)
      setEditingUser(null)
      
      // Reload data from database to ensure consistency (with small delay for DB propagation)
      setTimeout(async () => {
        console.log('Reloading users list from database...')
        const freshUsers = await getUsers(supabase)
        console.log('Fresh users data:', freshUsers)
        setUsers(freshUsers)
      }, 100)
      
      // Always dispatch event so any logged-in user (including the updated user) can refresh
      window.dispatchEvent(new CustomEvent('userProfileUpdated', { 
        detail: { userId: editingUser.id, newRole: userData.role }
      }))
      
      // If updating the current logged-in user's own role, refresh immediately
      if (currentUser && editingUser.id === currentUser.id) {
        console.log('Updating current user role, refreshing profile...')
        await refreshUserProfile()
        
        // Small delay to ensure state updates
        setTimeout(() => {
          if (userData.role === 'admin' || userData.role === 'programmer') {
            alert('Je rol is bijgewerkt naar admin. De admin dropdown zou nu zichtbaar moeten zijn. Als je de dropdown niet ziet, refresh de pagina.')
          }
        }, 500)
      } else {
        // If updating another user's role, show success message
        const roleNames: Record<string, string> = {
          'user': 'gebruiker',
          'admin': 'admin',
          'programmer': 'programmer',
          'bestuurder': 'bestuurder'
        }
        const oldRoleName = roleNames[oldRole] || oldRole
        const newRoleName = roleNames[userData.role] || userData.role
        
        if (oldRole !== userData.role) {
          console.log(`Role updated from ${oldRole} to ${userData.role}`)
        }
      }
    } catch (err: any) {
      console.error('Error updating user:', err)
      setError(err.message || 'Fout bij opslaan')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Weet je zeker dat je deze gebruiker wilt verwijderen?')) return
    
    try {
      await deleteUser(supabase, id)
      await loadData()
    } catch (err: any) {
      setError(err.message || 'Fout bij verwijderen')
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

  const getUserEmail = async (userId: string) => {
    try {
      const { data } = await supabase.auth.admin.getUserById(userId)
      return data?.user?.email || 'Onbekend'
    } catch {
      return 'Onbekend'
    }
  }

  if (loading) {
    return <p className="text-gray-600 text-center">Gebruikers worden geladen...</p>
  }

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {users.length === 0 ? (
          <p className="text-gray-600 text-center">Geen gebruikers gevonden.</p>
        ) : (
          users.map(user => (
            <div key={user.id} className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 card-hover">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{user.full_name || 'Geen naam'}</h3>
                  <p className="text-gray-600 text-sm">ID: {user.id}</p>
                </div>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium capitalize">
                  {user.role}
                </span>
              </div>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => openModal(user)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  Bewerken
                </button>
                <button
                  onClick={() => handleDelete(user.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                >
                  Verwijderen
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* User Modal */}
      {isModalOpen && editingUser && (
        <div
          className="modal active"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal()
          }}
        >
          <div className="modal-content max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Gebruiker Bewerken</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
                <input
                  type="text"
                  value={editingUser.id}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">User ID kan niet worden gewijzigd</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Naam</label>
                <input
                  type="text"
                  name="full_name"
                  defaultValue={editingUser.full_name || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rol *</label>
                <select
                  name="role"
                  defaultValue={editingUser.role}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="user">Gebruiker</option>
                  <option value="admin">Admin</option>
                  <option value="programmer">Programmer</option>
                  <option value="bestuurder">Bestuurder</option>
                </select>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600 transition-colors font-medium"
                >
                  Opslaan
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400 transition-colors font-medium"
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
