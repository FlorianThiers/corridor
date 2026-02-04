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

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  async function loadUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setUserProfile(data)
    } catch (error) {
      console.error('Error loading user profile:', error)
      setUserProfile(null)
    } finally {
      setLoading(false)
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
  }
}
