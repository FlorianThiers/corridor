import { requireAdmin } from '@/lib/auth'
import { ReactNode } from 'react'
import { BackgroundImage } from '@/components/BackgroundImage'
import { privateRobots } from '@/lib/seo'

export const metadata = privateRobots

export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  // This will redirect to / if user is not admin
  await requireAdmin()

  return (
    <div className="page-background">
      <BackgroundImage />
      <div className="min-h-screen">
        {children}
      </div>
    </div>
  )
}
