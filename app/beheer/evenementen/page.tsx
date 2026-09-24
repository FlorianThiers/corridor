import { AdminLayout } from '@/components/admin/AdminLayout'
import { AdminEvents } from '@/components/admin/AdminEvents'
import { Footer } from '@/components/Footer'

export const dynamic = 'force-dynamic'

export default function AdminEvenementenPage() {
  return (
    <>
      <AdminLayout title="Agenda">
        <p className="mb-6 text-center text-gray-600">
          Beheer evenementen en activiteiten. Koppel optioneel een zone. Publiek zichtbaar op{' '}
          <a href="/agenda" className="text-pink-600 hover:underline">/agenda</a>.
        </p>
        <AdminEvents />
      </AdminLayout>
      <Footer />
    </>
  )
}
