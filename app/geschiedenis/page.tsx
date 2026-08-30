import Link from 'next/link'
import { PageSection } from '@/components/PageSection'
import { PageContainer } from '@/components/PageContainer'
import { PageTitle } from '@/components/PageTitle'
import { Footer } from '@/components/Footer'
import { BackgroundImage } from '@/components/BackgroundImage'
import { HistoryPhotoMarquee } from '@/components/HistoryPhotoMarquee'
import { HistoryPhotoGrid } from '@/components/HistoryPhotoGrid'
import { historyPhotos, historyMilestones } from '@/lib/geschiedenis'

export const metadata = {
  title: 'Geschiedenis - Corridor Gentbrugge',
  description: 'Vijf jaar evolutie onder het viaduct: van braakliggend terrein tot urban hub. Foto\'s uit de Corridor-groep.',
}

export default function GeschiedenisPage() {
  return (
    <div className="page-background">
      <BackgroundImage />

      <PageSection className="min-h-screen section-gradient-1">
        <PageContainer maxWidth="7xl">
          <PageTitle>Het Verhaal van Corridor</PageTitle>
          <p className="mx-auto mb-10 max-w-3xl text-center text-lg text-gray-700 md:text-xl">
            Zo is het begonnen, vijf jaar geleden — en geëvolueerd. Foto&apos;s uit de groep, onder de brug.
          </p>

          <HistoryPhotoMarquee photos={historyPhotos} />

          <div className="mt-16 space-y-8">
            {historyMilestones.map((milestone) => (
              <article
                key={milestone.year}
                className="grid gap-4 rounded-3xl bg-white/60 p-8 backdrop-blur-sm card-hover md:grid-cols-[120px_1fr]"
              >
                <div className="text-3xl font-bold text-pink-500 graffiti-text md:text-4xl">
                  {milestone.year}
                </div>
                <div>
                  <h2 className="mb-2 text-2xl font-bold text-gray-800">{milestone.title}</h2>
                  <p className="text-gray-700 leading-relaxed">{milestone.description}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-16 rounded-3xl bg-white/40 p-8 text-center backdrop-blur-sm">
            <h2 className="mb-4 text-2xl font-bold text-gray-800">Matexi Award 2025</h2>
            <p className="mx-auto mb-6 max-w-2xl text-gray-700">
              Corridor won de Matexi Award 2025 én de publieksprijs. Reden genoeg om te vieren — en om het verhaal verder te schrijven.
            </p>
            <a
              href="https://share.google/5ugcgl9rNxmmXqZcK"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-full bg-white/70 px-6 py-3 font-medium text-gray-800 transition-all hover:scale-105 hover:bg-white/90"
            >
              Bekijk de award
            </a>
          </div>

          <div className="mt-20">
            <h2 className="mb-8 text-center text-3xl font-bold text-gray-800 graffiti-text">
              Alle foto&apos;s
            </h2>
            <HistoryPhotoGrid photos={historyPhotos} />
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/corridorGeschiedenis.pdf"
              target="_blank"
              className="inline-flex items-center rounded-full bg-white/60 px-6 py-3 font-medium text-gray-800 transition-all hover:scale-105 hover:bg-white/80"
            >
              Volledige geschiedenis (PDF)
            </Link>
          </div>
        </PageContainer>
      </PageSection>

      <Footer />
    </div>
  )
}
