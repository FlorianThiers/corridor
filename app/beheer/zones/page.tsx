import { AdminLayout } from '@/components/admin/AdminLayout'
import { AdminZones } from '@/components/admin/AdminZones'
import { Footer } from '@/components/Footer'

export const dynamic = 'force-dynamic'

export default function AdminZonesPage() {
  return (
    <>
      <AdminLayout title="Zones">
        <AdminZones />
      </AdminLayout>
      <Footer />
    </>
  )
}
