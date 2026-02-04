'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getPartners, getZones, createPartner, updatePartner, deletePartner } from '@/lib/database'
import { PartnerCard } from '@/components/PartnerCard'
import type { Partner, Zone } from '@/types'

export function AdminPartners() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [zones, setZones] = useState<Zone[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [partnersData, zonesData] = await Promise.all([
        getPartners(supabase),
        getZones(supabase)
      ])
      setPartners(partnersData)
      setZones(zonesData)
    } catch (err: any) {
      setError(err.message || 'Fout bij laden van data')
    } finally {
      setLoading(false)
    }
  }

  const uploadLogo = async (file: File): Promise<string | null> => {
    try {
      setUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `partners/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('public')
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (err: any) {
      setError(err.message || 'Fout bij uploaden van logo')
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    
    const formData = new FormData(e.currentTarget)
    const logoFile = formData.get('logo_file') as File | null
    const logoUrl = formData.get('logo_url') as string || undefined

    let finalLogoUrl = logoUrl

    // Upload file if provided
    if (logoFile && logoFile.size > 0) {
      const uploadedUrl = await uploadLogo(logoFile)
      if (uploadedUrl) {
        finalLogoUrl = uploadedUrl
      } else {
        return // Error already set
      }
    }

    const partnerData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string || undefined,
      type: formData.get('type') as 'intern' | 'extern',
      zone_id: formData.get('zone_id') as string || undefined,
      website_url: formData.get('website_url') as string || undefined,
      logo_url: finalLogoUrl,
    }

    try {
      if (editingPartner) {
        await updatePartner(supabase, editingPartner.id, partnerData)
      } else {
        await createPartner(supabase, partnerData)
      }
      setIsModalOpen(false)
      setEditingPartner(null)
      await loadData()
    } catch (err: any) {
      setError(err.message || 'Fout bij opslaan')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Weet je zeker dat je deze partner wilt verwijderen?')) return
    
    try {
      await deletePartner(supabase, id)
      await loadData()
    } catch (err: any) {
      setError(err.message || 'Fout bij verwijderen')
    }
  }

  const openModal = (partner?: Partner) => {
    setEditingPartner(partner || null)
    setIsModalOpen(true)
    setError('')
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingPartner(null)
    setError('')
  }

  if (loading) {
    return <p className="text-gray-600 text-center">Partners worden geladen...</p>
  }

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => openModal()}
          className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors font-medium"
        >
          + Nieuwe Partner
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {partners.length === 0 ? (
          <p className="text-gray-600 text-center col-span-full">Geen partners gevonden.</p>
        ) : (
          partners.map(partner => (
            <div key={partner.id} className="relative">
              <PartnerCard partner={partner} />
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => openModal(partner)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  Bewerken
                </button>
                <button
                  onClick={() => handleDelete(partner.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                >
                  Verwijderen
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Partner Modal */}
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
                {editingPartner ? 'Partner Bewerken' : 'Nieuwe Partner'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Naam *</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingPartner?.name}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Beschrijving</label>
                <textarea
                  name="description"
                  rows={4}
                  defaultValue={editingPartner?.description || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                  <select
                    name="type"
                    defaultValue={editingPartner?.type || 'intern'}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="intern">Intern</option>
                    <option value="extern">Extern</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Zone (voor mede-eigenaren)</label>
                  <select
                    name="zone_id"
                    defaultValue={editingPartner?.zone_id || ''}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="">Geen zone</option>
                    {zones.map(zone => (
                      <option key={zone.id} value={zone.id}>
                        Zone {zone.zone_number}: {zone.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website URL</label>
                <input
                  type="url"
                  name="website_url"
                  defaultValue={editingPartner?.website_url || ''}
                  placeholder="https://..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <div>
                <div className="block text-sm font-medium text-gray-700 mb-2">Logo</div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm cursor-pointer">
                    Kies bestand
                    <input
                      type="file"
                      name="logo_file"
                      accept=".webp,image/webp"
                      className="hidden"
                    />
                  </label>
                  <span className="text-sm text-gray-600">Of gebruik een URL:</span>
                </div>
                <input
                  type="url"
                  name="logo_url"
                  defaultValue={editingPartner?.logo_url || ''}
                  placeholder="https://... of /..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600 transition-colors font-medium disabled:opacity-50"
                >
                  {uploading ? 'Uploaden...' : 'Opslaan'}
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
