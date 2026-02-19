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
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (!mounted) return
      
      // Ignore refresh token errors - they're expected when tokens are invalid/expired
      if (error && error.message?.includes('refresh_token')) {
        console.warn('Refresh token error (expected if not logged in):', error.message)
        setUser(null)
        setLoading(false)
        return
      }
      
      setUser(user)
      if (user) {
        loadUserProfile(user.id)
      } else {
        setLoading(false)
      }
    }).catch((error) => {
      // Silently handle auth errors (user might not be logged in)
      if (!mounted) return
      if (error.message?.includes('refresh_token') || error.message?.includes('token')) {
        console.warn('Auth token error (expected if not logged in):', error.message)
      } else {
        console.error('Unexpected auth error:', error)
      }
      setUser(null)
      setLoading(false)
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
    const handleUserProfileUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ userId?: string; newRole?: string }>
      // Get current user from state
      supabase.auth.getUser().then(({ data: { user: currentUser } }: { data: { user: User | null } }) => {
        if (currentUser && mounted) {
          // If event specifies a userId and it matches current user, refresh
          // Otherwise refresh anyway to be safe
          if (!customEvent.detail?.userId || customEvent.detail.userId === currentUser.id) {
            console.log('Refreshing user profile due to update event')
            loadUserProfile(currentUser.id)
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
  }, [supabase])

  const refreshUserProfile = async () => {
    // Get fresh user from auth instead of relying on state
    const { data: { user: currentUser } } = await supabase.auth.getUser()
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
