import Link from 'next/link'
import { PageSection } from '@/components/PageSection'
import { PageContainer } from '@/components/PageContainer'
import { Footer } from '@/components/Footer'

export const dynamic = 'force-dynamic'

export default function NotFound() {
  return (
    <div className="page-background">
      <PageSection className="min-h-screen flex items-center justify-center">
        <PageContainer>
          <div className="text-center">
            <h1 className="text-6xl md:text-8xl font-bold text-gray-800 graffiti-text mb-4">
              404
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Pagina niet gevonden
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              De pagina die je zoekt bestaat niet of is verplaatst.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors font-medium"
            >
              Terug naar home
            </Link>
          </div>
        </PageContainer>
      </PageSection>
      <Footer />
    </div>
  )
}
