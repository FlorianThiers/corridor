'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { friendlyAuthError } from '@/lib/auth-client'
import { PageContainer } from '@/components/PageContainer'
import { PageTitle } from '@/components/PageTitle'
import { Footer } from '@/components/Footer'
import { BackgroundImage } from '@/components/BackgroundImage'
import { PageSection } from '@/components/PageSection'

export function ResetPasswordForm() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [ready, setReady] = useState(false)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    let mounted = true

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (!mounted) return
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setReady(true)
        setSessionLoading(false)
      }
    })

    async function establishSession() {
      const code = searchParams.get('code')
      const token_hash = searchParams.get('token_hash')
      const type = searchParams.get('type')

      try {
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          if (exchangeError) throw exchangeError
        } else if (token_hash && type === 'recovery') {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            type: 'recovery',
            token_hash,
          })
          if (verifyError) throw verifyError
        }

        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!mounted) return

        if (session) {
          setReady(true)
        } else if (!code && !token_hash) {
          setError(
            'Open de link uit je reset-mail in dezelfde browser, of vraag een nieuwe link aan via Wachtwoord vergeten.'
          )
        } else {
          setError('De resetlink is ongeldig of verlopen. Vraag een nieuwe link aan via Wachtwoord vergeten.')
        }
      } catch (err: unknown) {
        if (!mounted) return
        const msg = err instanceof Error ? err.message : ''
        setError(friendlyAuthError(msg, 'Kon de resetlink niet verwerken. Vraag een nieuwe link aan.'))
      } finally {
        if (mounted) setSessionLoading(false)
      }
    }

    void establishSession()

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const formData = new FormData(e.currentTarget)
    const password = (formData.get('password') as string) ?? ''
    const confirm = (formData.get('confirm') as string) ?? ''

    if (password.length < 8) {
      setError('Kies een wachtwoord van minstens 8 tekens.')
      setLoading(false)
      return
    }

    if (password !== confirm) {
      setError('De wachtwoorden komen niet overeen.')
      setLoading(false)
      return
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError

      setSuccess('Je wachtwoord is bijgewerkt. Je wordt doorgestuurd…')
      setTimeout(() => {
        router.push('/?success=' + encodeURIComponent('Wachtwoord ingesteld. Je kunt nu inloggen.'))
        router.refresh()
      }, 1500)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ''
      setError(friendlyAuthError(msg, 'Kon het wachtwoord niet opslaan. Probeer opnieuw.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-background">
      <BackgroundImage />
      <PageSection className="min-h-screen">
        <PageContainer maxWidth="md">
          <PageTitle>Nieuw wachtwoord</PageTitle>

          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 card-hover">
            {sessionLoading && (
              <p className="text-gray-600 text-center">Resetlink verifiëren…</p>
            )}

            {!sessionLoading && !ready && error && (
              <div className="space-y-4">
                <div className="p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>
                <p className="text-sm text-gray-600 text-center">
                  <button
                    type="button"
                    className="text-pink-600 hover:text-pink-700 font-medium"
                    onClick={() =>
                      window.dispatchEvent(new CustomEvent('openLoginModal'))
                    }
                  >
                    Open inloggen / wachtwoord vergeten
                  </button>
                </p>
              </div>
            )}

            {!sessionLoading && ready && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-gray-600">
                  Kies een nieuw wachtwoord voor je account.
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nieuw wachtwoord
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      required
                      minLength={8}
                      autoComplete="new-password"
                      className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      aria-label={showPassword ? 'Wachtwoord verbergen' : 'Wachtwoord tonen'}
                    >
                      {showPassword ? 'Verberg' : 'Toon'}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bevestig wachtwoord
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirm"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600 transition-colors font-medium disabled:opacity-50"
                >
                  {loading ? 'Bezig…' : 'Wachtwoord opslaan'}
                </button>
              </form>
            )}

            {error && ready && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>
            )}
            {success && (
              <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg">{success}</div>
            )}

            <div className="mt-6 text-center">
              <Link href="/" className="text-sm text-pink-600 hover:text-pink-700 font-medium">
                Terug naar home
              </Link>
            </div>
          </div>
        </PageContainer>
      </PageSection>
      <Footer />
    </div>
  )
}