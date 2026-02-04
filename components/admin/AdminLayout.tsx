import { ReactNode } from 'react'
import { PageSection } from '@/components/PageSection'
import { PageContainer } from '@/components/PageContainer'
import { PageTitle } from '@/components/PageTitle'

interface AdminLayoutProps {
  title: string
  children: ReactNode
}

export function AdminLayout({ title, children }: AdminLayoutProps) {
  return (
    <PageSection className="min-h-screen">
      <PageContainer maxWidth="7xl">
        <PageTitle>{title}</PageTitle>
        {children}
      </PageContainer>
    </PageSection>
  )
}
