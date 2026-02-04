'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

type Tab = 'login' | 'signup' | 'forgot-password'

export function LoginModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [showSignupPassword, setShowSignupPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const supabase = createClient()
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    // Listen for modal open events
    const handleOpenModal = () => {
      setIsOpen(true)
      setActiveTab('login')
      setError('')
      setSuccess('')
    }

    // Listen for clicks on login buttons
    const handleLoginClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('[data-open-login]')) {
        e.preventDefault()
        handleOpenModal()
      }
    }

    // Listen for custom events to open modal
    window.addEventListener('openLoginModal', handleOpenModal)
    document.addEventListener('click', handleLoginClick)

    // Close modal if user is logged in
    if (user) {
      setIsOpen(false)
    }

    // Check if modal should be open on mount (for direct links)
    const modal = document.getElementById('login-modal')
    if (modal && modal.classList.contains('active')) {
      setIsOpen(true)
    }

    return () => {
      window.removeEventListener('openLoginModal', handleOpenModal)
      document.removeEventListener('click', handleLoginClick)
    }
  }, [user])

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      setSuccess('Succesvol ingelogd!')
      setTimeout(() => {
        setIsOpen(false)
        router.refresh()
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Inloggen mislukt. Probeer opnieuw.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('name') as string

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (signUpError) throw signUpError

      setSuccess('Account aangemaakt! Check je email voor verificatie.')
    } catch (err: any) {
      setError(err.message || 'Registratie mislukt. Probeer opnieuw.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (resetError) throw resetError

      setSuccess('Reset link is verzonden naar je emailadres. Check je inbox (en spam folder).')
    } catch (err: any) {
      setError(err.message || 'Fout bij verzenden van reset link. Probeer opnieuw.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      id="login-modal"
      className={`modal ${isOpen ? 'active' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setIsOpen(false)
        }
      }}
    >
      <div className="modal-content">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {activeTab === 'login' && 'Inloggen'}
            {activeTab === 'signup' && 'Registreren'}
            {activeTab === 'forgot-password' && 'Wachtwoord vergeten'}
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Login Tab */}
        {activeTab === 'login' && (
          <div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Wachtwoord</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none z-[10004] flex items-center justify-center w-6 h-6 pointer-events-auto"
                    style={{ position: 'absolute' }}
                    aria-label={showPassword ? 'Wachtwoord verbergen' : 'Wachtwoord tonen'}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0L9.88 9.88m-3.59-3.59l3.29 3.29M12 12l.01.01M12 12l-.01-.01m0 0L9.88 9.88m0 0L6.59 6.59" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setActiveTab('forgot-password')}
                  className="text-sm text-pink-600 hover:text-pink-700 font-medium"
                >
                  Wachtwoord vergeten?
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600 transition-colors font-medium disabled:opacity-50"
              >
                {loading ? 'Bezig...' : 'Inloggen'}
              </button>
            </form>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Nog geen account?{' '}
                <button
                  onClick={() => setActiveTab('signup')}
                  className="text-pink-600 hover:text-pink-700 font-medium"
                >
                  Registreer hier
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Signup Tab */}
        {activeTab === 'signup' && (
          <div>
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Naam</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Wachtwoord</label>
                <div className="relative">
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    name="password"
                    required
                    className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none z-[10004] flex items-center justify-center w-6 h-6 pointer-events-auto"
                    style={{ position: 'absolute' }}
                    aria-label={showSignupPassword ? 'Wachtwoord verbergen' : 'Wachtwoord tonen'}
                  >
                    {showSignupPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0L9.88 9.88m-3.59-3.59l3.29 3.29M12 12l.01.01M12 12l-.01-.01m0 0L9.88 9.88m0 0L6.59 6.59" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600 transition-colors font-medium disabled:opacity-50"
              >
                {loading ? 'Bezig...' : 'Registreren'}
              </button>
            </form>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Al een account?{' '}
                <button
                  onClick={() => setActiveTab('login')}
                  className="text-pink-600 hover:text-pink-700 font-medium"
                >
                  Log hier in
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Forgot Password Tab */}
        {activeTab === 'forgot-password' && (
          <div>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Voer je emailadres in en we sturen je een link om je wachtwoord opnieuw in te stellen.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600 transition-colors font-medium disabled:opacity-50"
              >
                {loading ? 'Bezig...' : 'Verstuur reset link'}
              </button>
            </form>
            <div className="mt-4 text-center">
              <button
                onClick={() => setActiveTab('login')}
                className="text-sm text-pink-600 hover:text-pink-700 font-medium"
              >
                Terug naar inloggen
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg">
            {success}
          </div>
        )}
      </div>
    </div>
  )
}
