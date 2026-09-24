'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createZonePhoto } from '@/lib/database'
import { useAuth } from '@/hooks/useAuth'

interface ZonePhotoSubmitProps {
  zoneId: string
  zoneNumber: number
}

const BUCKET = 'zone-photos'
const MAX_BYTES = 8 * 1024 * 1024

export function ZonePhotoSubmit({ zoneId, zoneNumber }: ZonePhotoSubmitProps) {
  const { user, loading: authLoading } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [fileName, setFileName] = useState('')
  const supabase = createClient()

  const emailVerified = Boolean(user?.email_confirmed_at)

  const openLogin = () => {
    window.dispatchEvent(new CustomEvent('openLoginModal'))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!user) {
      setError('Log eerst in om een foto te uploaden.')
      openLogin()
      return
    }
    if (!emailVerified) {
      setError('Bevestig eerst je e-mailadres (check je inbox), daarna kun je uploaden.')
      return
    }

    const form = e.currentTarget
    const formData = new FormData(form)
    const file = formData.get('photo') as File | null
    const caption = (formData.get('caption') as string) || undefined

    if (!file || file.size === 0) {
      setError('Kies eerst een foto via de knop hieronder.')
      return
    }
    if (!file.type.startsWith('image/')) {
      setError('Alleen afbeeldingen zijn toegestaan.')
      return
    }
    if (file.size > MAX_BYTES) {
      setError('Maximale bestandsgrootte is 8 MB.')
      return
    }

    try {
      setUploading(true)
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const storagePath = `zone/${zoneId}/pending/${user.id}/${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)

      await createZonePhoto(supabase, {
        zone_id: zoneId,
        storage_path: storagePath,
        public_url: urlData.publicUrl,
        caption,
        status: 'pending',
      })

      setSuccess('Foto ontvangen. Na goedkeuring verschijnt die op deze pagina.')
      setFileName('')
      form.reset()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload mislukt'
      setError(message)
    } finally {
      setUploading(false)
    }
  }

  if (authLoading) {
    return <p className="text-sm text-gray-600">Auth laden…</p>
  }

  if (!user) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-700">
          Maak of open een account met geverifieerd e-mailadres om een foto voor zone {zoneNumber} in te dienen.
        </p>
        <button
          type="button"
          onClick={openLogin}
          className="w-full rounded-lg bg-pink-500 px-4 py-3 font-medium text-white hover:bg-pink-600"
        >
          Inloggen / registreren
        </button>
      </div>
    )
  }

  if (!emailVerified) {
    return (
      <p className="text-sm text-amber-800 bg-amber-50 rounded-lg p-3">
        Je bent ingelogd, maar je e-mail is nog niet bevestigd. Check je inbox en probeer opnieuw.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-medium text-gray-800">1. Kies een foto</p>
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-pink-400 bg-pink-50/80 px-4 py-8 text-center transition hover:border-pink-500 hover:bg-pink-100/80">
          <span className="rounded-full bg-pink-500 px-5 py-2 text-sm font-semibold text-white">
            Bestanden openen…
          </span>
          <span className="text-xs text-gray-600">
            {fileName || 'JPG, PNG of WebP · max 8 MB'}
          </span>
          <input
            type="file"
            name="photo"
            accept="image/*"
            required
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0]
              setFileName(f ? f.name : '')
            }}
          />
        </label>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">2. Bijschrift (optioneel)</label>
        <input
          type="text"
          name="caption"
          maxLength={120}
          placeholder="Korte beschrijving"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-700">{success}</p>}
      <button
        type="submit"
        disabled={uploading}
        className="w-full rounded-lg bg-pink-500 px-4 py-3 font-semibold text-white hover:bg-pink-600 disabled:opacity-60"
      >
        {uploading ? 'Uploaden…' : '3. Indienen ter goedkeuring'}
      </button>
    </form>
  )
}
