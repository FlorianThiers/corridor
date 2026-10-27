import type { Metadata } from 'next'
import { Navigation } from '@/components/Navigation'
import { LoginModal } from '@/components/LoginModal'
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, SITE_URL } from '@/lib/seo'
import './globals.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: '%s',
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: 'Corridor',
  openGraph: {
    type: 'website',
    locale: 'nl_BE',
    siteName: 'Corridor',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: '/favicon.webp', type: 'image/webp' },
      { url: '/favicon-32.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl">
      <body className="overflow-x-hidden">
        <Navigation />
        <LoginModal />
        {children}
      </body>
    </html>
  )
}
