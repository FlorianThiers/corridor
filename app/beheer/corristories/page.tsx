import { AdminLayout } from '@/components/admin/AdminLayout'
import { AdminCorristories } from '@/components/admin/AdminCorristories'
import { Footer } from '@/components/Footer'

export const dynamic = 'force-dynamic'

export default function AdminCorristoriesPage() {
  return (
    <>
      <AdminLayout title="Corristories">
        <AdminCorristories />
      </AdminLayout>
      <Footer />
    </>
  )
}
