import { AdminLayout } from '@/components/admin/AdminLayout'
import { AdminUsers } from '@/components/admin/AdminUsers'
import { Footer } from '@/components/Footer'

export const dynamic = 'force-dynamic'

export default function AdminGebruikersPage() {
  return (
    <>
      <AdminLayout title="Gebruikers">
        <p className="mb-6 text-center text-gray-600">
          Overzicht van geregistreerde accounts. Filter op rol, zoek op naam of e-mail, en sorteer op aanmaakdatum.
        </p>
        <AdminUsers />
      </AdminLayout>
      <Footer />
    </>
  )
}
