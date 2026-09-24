import { AdminLayout } from '@/components/admin/AdminLayout'
import { AdminGeschiedenis } from '@/components/admin/AdminGeschiedenis'
import { Footer } from '@/components/Footer'

export const dynamic = 'force-dynamic'

export default function AdminGeschiedenisPage() {
  return (
    <>
      <AdminLayout title="Geschiedenis">
        <p className="mb-6 text-center text-gray-600">
          Mijlpalen en foto&apos;s voor{' '}
          <a href="/geschiedenis" className="text-pink-600 hover:underline">/geschiedenis</a>.
          Zolang de database leeg is, toont de publieke pagina de vaste content.
        </p>
        <AdminGeschiedenis />
      </AdminLayout>
      <Footer />
    </>
  )
}
