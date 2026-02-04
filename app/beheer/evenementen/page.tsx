import { AdminLayout } from '@/components/admin/AdminLayout'
import { AdminEvents } from '@/components/admin/AdminEvents'
import { Footer } from '@/components/Footer'

export const dynamic = 'force-dynamic'

export default function AdminEvenementenPage() {
  return (
    <>
      <AdminLayout title="Evenementen">
        <AdminEvents />
      </AdminLayout>
      <Footer />
    </>
  )
}
