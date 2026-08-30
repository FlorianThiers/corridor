'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import type { User as UserProfile } from '@/types'

const supabase = createClient()

function isBenignAuthError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const message = 'message' in error ? String(error.message) : ''
  const name = 'name' in error ? String(error.name) : ''
  return (
    name.includes('LockAcquireTimeout') ||
    message.includes('LockManager lock') ||
    message.includes('refresh_token')
  )
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.warn('User profile not found:', error.message)
        setUserProfile(null)
        return
      }
      setUserProfile(data)
    } catch (error) {
      console.error('Error loading user profile:', error)
      setUserProfile(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true

    supabase.auth
      .getUser()
      .then(({ data: { user }, error }) => {
        if (!mounted) return

        if (error && isBenignAuthError(error)) {
          setUser(null)
          setLoading(false)
          return
        }

        if (error) {
          console.error('Unexpected auth error:', error)
          setUser(null)
          setLoading(false)
          return
        }

        setUser(user)
        if (user) {
          void loadUserProfile(user.id)
        } else {
          setLoading(false)
        }
      })
      .catch((error: unknown) => {
        if (!mounted) return
        if (!isBenignAuthError(error)) {
          console.error('Unexpected auth error:', error)
        }
        setUser(null)
        setLoading(false)
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return
      setUser(session?.user ?? null)
      if (session?.user) {
        await loadUserProfile(session.user.id)
      } else {
        setUserProfile(null)
        setLoading(false)
      }
    })

    const handleUserProfileUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ userId?: string; newRole?: string }>
      supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
        if (currentUser && mounted) {
          if (!customEvent.detail?.userId || customEvent.detail.userId === currentUser.id) {
            void loadUserProfile(currentUser.id)
          }
        }
      })
    }

    window.addEventListener('userProfileUpdated', handleUserProfileUpdate)

    return () => {
      mounted = false
      subscription.unsubscribe()
      window.removeEventListener('userProfileUpdated', handleUserProfileUpdate)
    }
  }, [])

  const refreshUserProfile = async () => {
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()
    if (currentUser) {
      await loadUserProfile(currentUser.id)
    }
  }

  const isAdmin = () => {
    return userProfile?.role === 'admin' || userProfile?.role === 'programmer'
  }

  const hasRole = (role: string) => {
    return userProfile?.role === role
  }

  return {
    user,
    userProfile,
    loading,
    isAdmin: isAdmin(),
    hasRole,
    isAuthenticated: !!user,
    refreshUserProfile,
  }
}
