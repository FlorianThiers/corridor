'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getCorristories, getZones, createCorristory, updateCorristory, deleteCorristory } from '@/lib/database'
import { CorristoryCard } from '@/components/CorristoryCard'
import type { Corristory, Zone } from '@/types'

export function AdminCorristories() {
  const [stories, setStories] = useState<Corristory[]>([])
  const [zones, setZones] = useState<Zone[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStory, setEditingStory] = useState<Corristory | null>(null)
  const [error, setError] = useState('')
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      // Get all corristories (not just published ones for admin)
      const { data: storiesData } = await supabase
        .from('corristories')
        .select('*, zones(*)')
        .order('created_at', { ascending: false })
      
      const zonesData = await getZones(supabase)
      setStories(storiesData || [])
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
    const storyData = {
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      author_name: formData.get('author_name') as string || undefined,
      zone_id: formData.get('zone_id') as string || undefined,
      is_published: formData.get('is_published') === 'on',
    }

    try {
      if (editingStory) {
        await updateCorristory(supabase, editingStory.id, storyData)
      } else {
        await createCorristory(supabase, storyData)
      }
      setIsModalOpen(false)
      setEditingStory(null)
      await loadData()
    } catch (err: any) {
      setError(err.message || 'Fout bij opslaan')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Weet je zeker dat je dit verhaal wilt verwijderen?')) return
    
    try {
      await deleteCorristory(supabase, id)
      await loadData()
    } catch (err: any) {
      setError(err.message || 'Fout bij verwijderen')
    }
  }

  const openModal = (story?: Corristory) => {
    setEditingStory(story || null)
    setIsModalOpen(true)
    setError('')
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingStory(null)
    setError('')
  }

  if (loading) {
    return <p className="text-gray-600 text-center">Corristories worden geladen...</p>
  }

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => openModal()}
          className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors font-medium"
        >
          + Nieuw Verhaal
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {stories.length === 0 ? (
          <p className="text-gray-600 text-center">Geen corristories gevonden.</p>
        ) : (
          stories.map(story => (
            <div key={story.id} className="relative">
              <CorristoryCard story={story} />
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => openModal(story)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  Bewerken
                </button>
                <button
                  onClick={() => handleDelete(story.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                >
                  Verwijderen
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Story Modal */}
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
                {editingStory ? 'Verhaal Bewerken' : 'Nieuw Verhaal'}
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
                  defaultValue={editingStory?.title}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Inhoud *</label>
                <textarea
                  name="content"
                  rows={6}
                  defaultValue={editingStory?.content || ''}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Auteur Naam</label>
                  <input
                    type="text"
                    name="author_name"
                    defaultValue={editingStory?.author_name || ''}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Zone</label>
                  <select
                    name="zone_id"
                    defaultValue={editingStory?.zone_id || ''}
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
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="is_published"
                  defaultChecked={editingStory?.is_published || false}
                  className="w-5 h-5 text-pink-500 rounded focus:ring-pink-500"
                />
                <label className="text-sm font-medium text-gray-700 cursor-pointer">Gepubliceerd</label>
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
