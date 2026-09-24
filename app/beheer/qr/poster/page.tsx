import { QrFotoPosterA4 } from '@/components/admin/QrFotoPosterA4'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'A4 poster · Zone foto upload - Corridor',
  description: 'Printklare A4 uitleg: foto’s toevoegen via de algemene zones QR.',
}

export default function QrFotoPosterPage() {
  return <QrFotoPosterA4 />
}
