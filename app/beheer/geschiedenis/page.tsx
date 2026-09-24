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
          Data staat in de database — hier bewerken, toevoegen of wissen.
        </p>
        <AdminGeschiedenis />
      </AdminLayout>
      <Footer />
    </>
  )
}
