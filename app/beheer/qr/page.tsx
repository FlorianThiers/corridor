import { AdminLayout } from '@/components/admin/AdminLayout'
import { AdminQr } from '@/components/admin/AdminQr'
import { Footer } from '@/components/Footer'

export const dynamic = 'force-dynamic'

export default function AdminQrPage() {
  return (
    <>
      <AdminLayout title="QR-codes">
        <AdminQr />
      </AdminLayout>
      <Footer />
    </>
  )
}
