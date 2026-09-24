'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  getZones,
  createZone,
  updateZone,
  deleteZone,
  getZonePhotosForAdmin,
  reviewZonePhoto,
  deleteZonePhoto,
  createZonePhoto,
} from '@/lib/database'
import { ZoneCard } from '@/components/ZoneCard'
import type { Zone, ZonePhoto } from '@/types'

const BUCKET = 'zone-photos'

function parseFieldLabels(raw: string): string[] {
  return raw
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export function AdminZones() {
  const [zones, setZones] = useState<Zone[]>([])
  const [pendingPhotos, setPendingPhotos] = useState<ZonePhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingZone, setEditingZone] = useState<Zone | null>(null)
  const [error, setError] = useState('')
  const [photoMsg, setPhotoMsg] = useState('')
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const zonesData = await getZones(supabase)
      setZones(zonesData)
      try {
        const pending = await getZonePhotosForAdmin(supabase, { status: 'pending' })
        setPendingPhotos(pending)
      } catch {
        setPendingPhotos([])
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Fout bij laden van data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    const formData = new FormData(e.currentTarget)
    const coverFile = formData.get('cover_file') as File | null
    let coverUrl = (formData.get('cover_url') as string) || editingZone?.cover_url || undefined

    try {
      if (coverFile && coverFile.size > 0) {
        const ext = coverFile.name.split('.').pop() || 'jpg'
        const zoneKey = editingZone?.id || `new-${Date.now()}`
        const path = `zone/${zoneKey}/cover-${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, coverFile, {
          upsert: true,
          contentType: coverFile.type,
        })
        if (uploadError) throw uploadError
        coverUrl = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
      }

      const zoneData: Partial<Zone> = {
        zone_number: parseInt(formData.get('zone_number') as string, 10),
        name: formData.get('name') as string,
        description: (formData.get('description') as string) || undefined,
        slug: (formData.get('slug') as string) || undefined,
        cover_url: coverUrl || null,
        field_labels: parseFieldLabels((formData.get('field_labels') as string) || ''),
      }

      if (editingZone) {
        await updateZone(supabase, editingZone.id, zoneData)
      } else {
        await createZone(supabase, zoneData)
      }
      setIsModalOpen(false)
      setEditingZone(null)
      await loadData()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Fout bij opslaan')
    }
  }

  const handleAdminGalleryUpload = async (zone: Zone, file: File) => {
    setPhotoMsg('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Niet ingelogd')

      const ext = file.name.split('.').pop() || 'jpg'
      const path = `zone/${zone.id}/approved/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
        contentType: file.type,
      })
      if (uploadError) throw uploadError
      const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl

      await createZonePhoto(supabase, {
        zone_id: zone.id,
        storage_path: path,
        public_url: publicUrl,
        status: 'approved',
      })
      // Admin insert may be forced to pending by RLS WITH CHECK — approve if needed
      const pending = await getZonePhotosForAdmin(supabase, { zoneId: zone.id, status: 'pending' })
      const justUploaded = pending.find((p) => p.storage_path === path)
      if (justUploaded) {
        await reviewZonePhoto(supabase, justUploaded.id, 'approved')
      }
      setPhotoMsg(`Foto toegevoegd aan zone ${zone.zone_number}`)
      await loadData()
    } catch (err: unknown) {
      setPhotoMsg(err instanceof Error ? err.message : 'Upload mislukt')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Weet je zeker dat je deze zone wilt verwijderen?')) return

    try {
      await deleteZone(supabase, id)
      await loadData()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Fout bij verwijderen')
    }
  }

  const openModal = (zone?: Zone) => {
    setEditingZone(zone || null)
    setIsModalOpen(true)
    setError('')
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingZone(null)
    setError('')
  }

  if (loading) {
    return <p className="text-gray-600 text-center">Zones worden geladen...</p>
  }

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => openModal()}
          className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors font-medium"
        >
          + Nieuwe Zone
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>
      )}
      {photoMsg && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-800 rounded-lg">{photoMsg}</div>
      )}

      {pendingPhotos.length > 0 && (
        <section className="mb-10 rounded-3xl bg-amber-50/80 p-6">
          <h2 className="mb-4 text-xl font-bold text-gray-800">
            Foto&apos;s ter goedkeuring ({pendingPhotos.length})
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pendingPhotos.map((photo) => (
              <div key={photo.id} className="rounded-2xl bg-white p-3 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.public_url} alt="" className="mb-2 aspect-video w-full rounded-lg object-cover" />
                <p className="text-sm text-gray-700 mb-1">
                  Zone {photo.zones?.zone_number}: {photo.zones?.name}
                </p>
                {photo.caption && <p className="text-xs text-gray-500 mb-2">{photo.caption}</p>}
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="flex-1 rounded-lg bg-green-500 px-2 py-1 text-sm text-white"
                    onClick={async () => {
                      await reviewZonePhoto(supabase, photo.id, 'approved')
                      await loadData()
                    }}
                  >
                    Goedkeuren
                  </button>
                  <button
                    type="button"
                    className="flex-1 rounded-lg bg-red-500 px-2 py-1 text-sm text-white"
                    onClick={async () => {
                      await reviewZonePhoto(supabase, photo.id, 'rejected')
                      await loadData()
                    }}
                  >
                    Afwijzen
                  </button>
                  <button
                    type="button"
                    className="rounded-lg bg-gray-200 px-2 py-1 text-sm"
                    onClick={async () => {
                      if (!confirm('Foto definitief verwijderen?')) return
                      await deleteZonePhoto(supabase, photo.id)
                      await loadData()
                    }}
                  >
                    Wis
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {zones.length === 0 ? (
          <p className="text-gray-600 text-center col-span-full">Geen zones gevonden.</p>
        ) : (
          zones.map((zone) => (
            <div key={zone.id} className="relative">
              <ZoneCard zone={zone} />
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => openModal(zone)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  Bewerken
                </button>
                <label className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm cursor-pointer">
                  + Foto
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) void handleAdminGalleryUpload(zone, f)
                      e.target.value = ''
                    }}
                  />
                </label>
                <button
                  onClick={() => handleDelete(zone.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                >
                  Verwijderen
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div
          className="modal active"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal()
          }}
        >
          <div className="modal-content max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingZone ? 'Zone Bewerken' : 'Nieuwe Zone'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Zone Nummer *</label>
                  <input
                    type="number"
                    name="zone_number"
                    min="1"
                    defaultValue={editingZone?.zone_number}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Naam *</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingZone?.name}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Slug (URL)</label>
                <input
                  type="text"
                  name="slug"
                  defaultValue={editingZone?.slug || ''}
                  placeholder="parkour"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Beschrijving</label>
                <textarea
                  name="description"
                  rows={4}
                  defaultValue={editingZone?.description || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Velden / sublabels (komma-gescheiden)
                </label>
                <input
                  type="text"
                  name="field_labels"
                  defaultValue={(editingZone?.field_labels || []).join(', ')}
                  placeholder="Veld 1, Veld 2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cover URL</label>
                <input
                  type="url"
                  name="cover_url"
                  defaultValue={editingZone?.cover_url || ''}
                  placeholder="https://..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Of cover uploaden</label>
                <input type="file" name="cover_file" accept="image/*" className="w-full text-sm" />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600 transition-colors font-medium"
                >
                  Opslaan
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Annuleren
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
