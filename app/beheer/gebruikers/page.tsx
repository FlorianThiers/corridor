import { AdminLayout } from '@/components/admin/AdminLayout'
import { AdminUsers } from '@/components/admin/AdminUsers'
import { Footer } from '@/components/Footer'

export const dynamic = 'force-dynamic'

export default function AdminGebruikersPage() {
  return (
    <>
      <AdminLayout title="Gebruikers">
        <AdminUsers />
      </AdminLayout>
      <Footer />
    </>
  )
}
