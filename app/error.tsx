'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { PageSection } from '@/components/PageSection'
import { PageContainer } from '@/components/PageContainer'
import { Footer } from '@/components/Footer'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error for debugging
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="page-background">
      <PageSection className="min-h-screen flex items-center justify-center">
        <PageContainer>
          <div className="text-center">
            <h1 className="text-6xl md:text-8xl font-bold text-gray-800 graffiti-text mb-4">
              Oeps!
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Er is iets misgegaan
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              {error.message || 'Er is een onverwachte fout opgetreden.'}
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={reset}
                className="inline-flex items-center px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors font-medium"
              >
                Probeer opnieuw
              </button>
              <Link
                href="/"
                className="inline-flex items-center px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Terug naar home
              </Link>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-8 text-left">
                <summary className="cursor-pointer text-sm text-gray-500">
                  Error Details (Development Only)
                </summary>
                <pre className="mt-4 p-4 bg-gray-100 rounded text-xs overflow-auto">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        </PageContainer>
      </PageSection>
      <Footer />
    </div>
  )
}
