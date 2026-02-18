'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState, useMemo } from 'react'
import type { User } from '@supabase/supabase-js'
import type { User as UserProfile } from '@/types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Memoize supabase client to avoid recreating on every render
  const supabase = useMemo(() => createClient(), [])

  async function loadUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        // If user profile doesn't exist, it might be because email is not confirmed
        // or user record hasn't been created yet
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

    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }: { data: { user: User | null } }) => {
      if (!mounted) return
      setUser(user)
      if (user) {
        loadUserProfile(user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: { user: User | null } | null) => {
        if (!mounted) return
        setUser(session?.user ?? null)
        if (session?.user) {
          await loadUserProfile(session.user.id)
        } else {
          setUserProfile(null)
          setLoading(false)
        }
      }
    )

    // Listen for custom user profile update events
    const handleUserProfileUpdate = () => {
      // Get current user from state
      supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
        if (currentUser && mounted) {
          loadUserProfile(currentUser.id)
        }
      })
    }

    window.addEventListener('userProfileUpdated', handleUserProfileUpdate)

    return () => {
      mounted = false
      subscription.unsubscribe()
      window.removeEventListener('userProfileUpdated', handleUserProfileUpdate)
    }
  }, [supabase])

  const refreshUserProfile = async () => {
    if (user) {
      await loadUserProfile(user.id)
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
