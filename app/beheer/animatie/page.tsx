import { AdminLayout } from '@/components/admin/AdminLayout'
import { AdminAnimatie } from '@/components/admin/AdminAnimatie'
import { Footer } from '@/components/Footer'

export const dynamic = 'force-dynamic'

export default function AdminAnimatiePage() {
  return (
    <>
      <AdminLayout title="Intro Animatie">
        <AdminAnimatie />
      </AdminLayout>
      <Footer />
    </>
  )
}
