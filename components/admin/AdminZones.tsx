'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getZones, createZone, updateZone, deleteZone } from '@/lib/database'
import { ZoneCard } from '@/components/ZoneCard'
import type { Zone } from '@/types'

export function AdminZones() {
  const [zones, setZones] = useState<Zone[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingZone, setEditingZone] = useState<Zone | null>(null)
  const [error, setError] = useState('')
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const zonesData = await getZones(supabase)
      setZones(zonesData)
    } catch (err: any) {
      setError(err.message || 'Fout bij laden van data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    
    const formData = new FormData(e.currentTarget)
    const zoneData = {
      zone_number: parseInt(formData.get('zone_number') as string),
      name: formData.get('name') as string,
      description: formData.get('description') as string || undefined,
    }

    try {
      if (editingZone) {
        await updateZone(supabase, editingZone.id, zoneData)
      } else {
        await createZone(supabase, zoneData)
      }
      setIsModalOpen(false)
      setEditingZone(null)
      await loadData()
    } catch (err: any) {
      setError(err.message || 'Fout bij opslaan')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Weet je zeker dat je deze zone wilt verwijderen?')) return
    
    try {
      await deleteZone(supabase, id)
      await loadData()
    } catch (err: any) {
      setError(err.message || 'Fout bij verwijderen')
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
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {zones.length === 0 ? (
          <p className="text-gray-600 text-center col-span-full">Geen zones gevonden.</p>
        ) : (
          zones.map(zone => (
            <div key={zone.id} className="relative">
              <ZoneCard zone={zone} />
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => openModal(zone)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  Bewerken
                </button>
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

      {/* Zone Modal */}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Beschrijving</label>
                <textarea
                  name="description"
                  rows={4}
                  defaultValue={editingZone?.description || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
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
