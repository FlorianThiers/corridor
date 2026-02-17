import type { Metadata } from 'next'
import { Navigation } from '@/components/Navigation'
import { LoginModal } from '@/components/LoginModal'
import './globals.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Corridor - Urban Hub onder het Viaduct van Gentbrugge',
  description: 'Corri d\'Or is de urban spot in Gentbrugge waar de stad écht tot leven komt.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl">
      <head>
        <link rel="icon" type="image/webp" href="/LogoCorridor.webp" />
        <link rel="apple-touch-icon" href="/LogoCorridor.webp" />
        {/* GSAP is loaded via npm package, no need for CDN scripts */}
      </head>
      <body className="overflow-x-hidden">
        <Navigation />
        <LoginModal />
        {children}
      </body>
    </html>
  )
}
