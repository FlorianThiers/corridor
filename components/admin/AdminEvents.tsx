'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getEvenementen, getZones, createEvenement, updateEvenement, deleteEvenement } from '@/lib/database'
import { EventCard } from '@/components/EventCard'
import type { Evenement, Zone } from '@/types'

export function AdminEvents() {
  const [events, setEvents] = useState<Evenement[]>([])
  const [zones, setZones] = useState<Zone[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Evenement | null>(null)
  const [error, setError] = useState('')
  const supabase = createClient()

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  const loadData = async () => {
    try {
      setLoading(true)
      const [eventsData, zonesData] = await Promise.all([
        getEvenementen(supabase),
        getZones(supabase)
      ])
      setEvents(eventsData)
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
    const eventData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string || undefined,
      start_datetime: formData.get('start_datetime') as string,
      end_datetime: formData.get('end_datetime') as string || undefined,
      zone_id: formData.get('zone_id') as string || undefined,
      for_girls: formData.get('for_girls') === 'on',
    }

    try {
      if (editingEvent) {
        await updateEvenement(supabase, editingEvent.id, eventData)
      } else {
        await createEvenement(supabase, eventData)
      }
      setIsModalOpen(false)
      setEditingEvent(null)
      await loadData()
    } catch (err: any) {
      setError(err.message || 'Fout bij opslaan')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Weet je zeker dat je dit evenement wilt verwijderen?')) return
    
    try {
      await deleteEvenement(supabase, id)
      await loadData()
    } catch (err: any) {
      setError(err.message || 'Fout bij verwijderen')
    }
  }

  const openModal = (event?: Evenement) => {
    setEditingEvent(event || null)
    setIsModalOpen(true)
    setError('')
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingEvent(null)
    setError('')
  }

  if (loading) {
    return <p className="text-gray-600 text-center">Evenementen worden geladen...</p>
  }

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => openModal()}
          className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors font-medium"
        >
          + Nieuw Evenement
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {events.length === 0 ? (
          <p className="text-gray-600 text-center">Geen evenementen gevonden.</p>
        ) : (
          events.map(event => (
            <div key={event.id} className="relative">
              <EventCard event={event} />
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => openModal(event)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  Bewerken
                </button>
                <button
                  onClick={() => handleDelete(event.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                >
                  Verwijderen
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Event Modal */}
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
                {editingEvent ? 'Evenement Bewerken' : 'Nieuw Evenement'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titel *</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editingEvent?.title}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Beschrijving</label>
                <textarea
                  name="description"
                  rows={4}
                  defaultValue={editingEvent?.description || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Datum & Tijd *</label>
                  <input
                    type="datetime-local"
                    name="start_datetime"
                    defaultValue={editingEvent?.start_datetime ? new Date(editingEvent.start_datetime).toISOString().slice(0, 16) : ''}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Eind Datum & Tijd</label>
                  <input
                    type="datetime-local"
                    name="end_datetime"
                    defaultValue={editingEvent?.end_datetime ? new Date(editingEvent.end_datetime).toISOString().slice(0, 16) : ''}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Zone</label>
                  <select
                    name="zone_id"
                    defaultValue={editingEvent?.zone_id || ''}
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
                <div className="flex items-end">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="for_girls"
                      defaultChecked={editingEvent?.for_girls || false}
                      className="w-5 h-5 text-pink-500 rounded focus:ring-pink-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Corrigirls Evenement</span>
                  </label>
                </div>
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
