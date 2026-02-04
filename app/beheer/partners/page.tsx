import { AdminLayout } from '@/components/admin/AdminLayout'
import { AdminPartners } from '@/components/admin/AdminPartners'
import { Footer } from '@/components/Footer'

export const dynamic = 'force-dynamic'

export default function AdminPartnersPage() {
  return (
    <>
      <AdminLayout title="Partners">
        <AdminPartners />
      </AdminLayout>
      <Footer />
    </>
  )
}
