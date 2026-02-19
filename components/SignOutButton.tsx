'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function SignOutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const supabase = useMemo(() => createClient(), [])

  const handleSignOut = async () => {
    if (loading) return // Prevent double clicks
    
    setLoading(true)
    try {
      // Sign out from all sessions
      const { error } = await supabase.auth.signOut({ scope: 'global' })
      
      if (error) {
        console.error('Error signing out:', error)
        // Even if there's an error, try to clear local state
      }
      
      // Force a full page reload to clear all state and cookies
      window.location.href = '/'
    } catch (error) {
      console.error('Unexpected error signing out:', error)
      // Force reload even on error to clear state
      window.location.href = '/'
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? 'Uitloggen...' : 'Uitloggen'}
    </button>
  )
}
