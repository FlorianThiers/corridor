'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function AdminAnimatie() {
  const [currentAnimationUrl, setCurrentAnimationUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [bucketExists, setBucketExists] = useState<boolean | null>(null)
  const supabase = createClient()

  useEffect(() => {
    checkBucketExists()
    loadCurrentAnimation()
  }, [])

  const checkBucketExists = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('intro-animations')
        .list('', { limit: 1 })

      if (error && error.message.includes('not found')) {
        setBucketExists(false)
      } else {
        setBucketExists(true)
      }
    } catch (err) {
      setBucketExists(false)
    }
  }

  const loadCurrentAnimation = async () => {
    try {
      setLoading(true)
      const { data: files, error } = await supabase.storage
        .from('intro-animations')
        .list('', {
          sortBy: { column: 'created_at', order: 'desc' },
          limit: 1
        })

      if (error) {
        if (error.message.includes('not found')) {
          setBucketExists(false)
        } else {
          setError('Fout bij laden van animatie: ' + error.message)
        }
        return
      }

      if (files && files.length > 0) {
        const { data } = supabase.storage
          .from('intro-animations')
          .getPublicUrl(files[0].name)
        setCurrentAnimationUrl(data.publicUrl)
      }
    } catch (err: any) {
      setError('Fout bij laden van animatie: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const uploadAnimation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    const formData = new FormData(e.currentTarget)
    const file = formData.get('animation_file') as File | null
    const url = formData.get('animation_url') as string || undefined

    if (!file && !url) {
      setError('Selecteer een bestand of voer een URL in')
      return
    }

    try {
      setUploading(true)

      if (file && file.size > 0) {
        // Upload file to storage
        const fileExt = file.name.split('.').pop()
        const fileName = `intro-animation-${Date.now()}.${fileExt}`
        const filePath = fileName

        const { error: uploadError } = await supabase.storage
          .from('intro-animations')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) throw uploadError

        const { data } = supabase.storage
          .from('intro-animations')
          .getPublicUrl(filePath)

        setCurrentAnimationUrl(data.publicUrl)
        setSuccess('Animatie succesvol geüpload!')
      } else if (url) {
        // Store URL in a config file or database
        // For now, we'll just set it as the current animation
        setCurrentAnimationUrl(url)
        setSuccess('Animatie URL opgeslagen!')
      }

      // Reset form
      e.currentTarget.reset()
    } catch (err: any) {
      setError('Fout bij uploaden: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const deleteAnimation = async () => {
    if (!confirm('Weet je zeker dat je de huidige animatie wilt verwijderen?')) return

    try {
      if (!currentAnimationUrl) {
        setError('Geen animatie om te verwijderen')
        return
      }

      // Extract filename from URL
      const urlParts = currentAnimationUrl.split('/')
      const fileName = urlParts[urlParts.length - 1]

      const { error } = await supabase.storage
        .from('intro-animations')
        .remove([fileName])

      if (error) throw error

      setCurrentAnimationUrl(null)
      setSuccess('Animatie succesvol verwijderd!')
    } catch (err: any) {
      setError('Fout bij verwijderen: ' + err.message)
    }
  }

  if (bucketExists === false) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-yellow-800 mb-2">⚠️ Storage Bucket Setup Vereist</h3>
        <p className="text-yellow-700 mb-3">
          De storage bucket "intro-animations" bestaat nog niet. Maak deze aan via het Supabase Dashboard:
        </p>
        <ol className="list-decimal list-inside ml-4 space-y-1 text-sm text-yellow-700">
          <li>Ga naar je Supabase project → <strong>Storage</strong></li>
          <li>Klik op <strong>New bucket</strong></li>
          <li>Naam: <code className="bg-yellow-100 px-1 rounded">intro-animations</code></li>
          <li>Public bucket: <strong>Aan</strong></li>
          <li>File size limit: <code className="bg-yellow-100 px-1 rounded">104857600</code> (100MB)</li>
          <li>Allowed MIME types: <code className="bg-yellow-100 px-1 rounded">video/mp4</code></li>
          <li>Klik op <strong>Create bucket</strong></li>
        </ol>
        <button
          onClick={checkBucketExists}
          className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
        >
          Opnieuw Controleren
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Current Animation Preview */}
      <div className="mb-8 bg-white/60 backdrop-blur-sm rounded-3xl p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Huidige Intro Animatie</h2>
        {loading ? (
          <p className="text-gray-600">Animatie wordt geladen...</p>
        ) : currentAnimationUrl ? (
          <div>
            <video
              src={currentAnimationUrl}
              controls
              className="w-full max-w-2xl rounded-lg"
            >
              Je browser ondersteunt geen video.
            </video>
            <p className="text-sm text-gray-600 mt-2">URL: {currentAnimationUrl}</p>
          </div>
        ) : (
          <p className="text-gray-600">Geen animatie geüpload.</p>
        )}
      </div>

      {/* Upload New Animation */}
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Nieuwe Intro Animatie Uploaden</h2>
        <form onSubmit={uploadAnimation} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Animatie Video (MP4 bestand) *
            </label>
            <div className="flex items-center gap-2 mb-2">
              <label className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm cursor-pointer">
                Kies bestand
                <input
                  type="file"
                  name="animation_file"
                  accept=".mp4,video/mp4"
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs text-gray-500 mb-1">Of gebruik een URL:</p>
            <input
              type="url"
              name="animation_url"
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
              {uploading ? 'Uploaden...' : 'Uploaden'}
            </button>
            <button
              type="button"
              onClick={deleteAnimation}
              disabled={!currentAnimationUrl}
              className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50"
            >
              Verwijderen
            </button>
          </div>
        </form>
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg">
            {success}
          </div>
        )}
      </div>
    </div>
  )
}
