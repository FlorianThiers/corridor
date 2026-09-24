import { ReactNode } from 'react'
import Link from 'next/link'
import { PageSection } from '@/components/PageSection'
import { PageContainer } from '@/components/PageContainer'
import { PageTitle } from '@/components/PageTitle'

interface AdminLayoutProps {
  title: string
  children: ReactNode
}

const ADMIN_LINKS = [
  { href: '/beheer/evenementen', label: 'Agenda' },
  { href: '/beheer/zones', label: 'Zones' },
  { href: '/beheer/geschiedenis', label: 'Geschiedenis' },
  { href: '/beheer/qr', label: 'QR-codes' },
  { href: '/beheer/partners', label: 'Partners' },
  { href: '/beheer/corristories', label: 'Corristories' },
  { href: '/beheer/gebruikers', label: 'Gebruikers' },
  { href: '/beheer/animatie', label: 'Animatie' },
] as const

export function AdminLayout({ title, children }: AdminLayoutProps) {
  return (
    <PageSection className="min-h-screen">
      <PageContainer maxWidth="7xl">
        <PageTitle>{title}</PageTitle>
        <nav className="mb-8 flex flex-wrap gap-2" aria-label="Admin secties">
          {ADMIN_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full bg-white/70 px-4 py-2 text-sm font-medium text-gray-800 transition hover:bg-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        {children}
      </PageContainer>
    </PageSection>
  )
}
