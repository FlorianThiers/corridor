'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { createZonePhoto } from '@/lib/database'
import { useAuth } from '@/hooks/useAuth'
import { isFestPhotoAutoApprove } from '@/lib/fest-photo-mode'

interface ZonePhotoSubmitProps {
  zoneId: string
  zoneNumber: number
}

const BUCKET = 'zone-photos'
const MAX_BYTES = 8 * 1024 * 1024
const MAX_FILES = 12

type PreviewItem = {
  id: string
  file: File
  url: string
}

export function ZonePhotoSubmit({ zoneId, zoneNumber }: ZonePhotoSubmitProps) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [items, setItems] = useState<PreviewItem[]>([])
  const [caption, setCaption] = useState('')
  const supabase = createClient()

  const liveNow = isFestPhotoAutoApprove()
  const emailVerified = Boolean(user?.email_confirmed_at)

  useEffect(() => {
    return () => {
      items.forEach((item) => URL.revokeObjectURL(item.url))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only revoke on unmount
  }, [])

  const openLogin = () => {
    window.dispatchEvent(new CustomEvent('openLoginModal'))
  }

  const clearPreviews = useCallback((next: PreviewItem[] = []) => {
    setItems((prev) => {
      prev.forEach((item) => URL.revokeObjectURL(item.url))
      return next
    })
  }, [])

  const addFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return
    setError('')
    setSuccess('')

    const incoming = Array.from(fileList)
    const next: PreviewItem[] = []
    const problems: string[] = []

    for (const file of incoming) {
      if (!file.type.startsWith('image/')) {
        problems.push(`${file.name}: geen afbeelding`)
        continue
      }
      if (file.size > MAX_BYTES) {
        problems.push(`${file.name}: groter dan 8 MB`)
        continue
      }
      next.push({
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
        file,
        url: URL.createObjectURL(file),
      })
    }

    setItems((prev) => {
      const room = MAX_FILES - prev.length
      if (room <= 0) {
        next.forEach((n) => URL.revokeObjectURL(n.url))
        problems.push(`Maximaal ${MAX_FILES} foto's tegelijk.`)
        return prev
      }
      const keep = next.slice(0, room)
      next.slice(room).forEach((n) => URL.revokeObjectURL(n.url))
      if (next.length > room) {
        problems.push(`Maximaal ${MAX_FILES} foto's — ${next.length - room} overgeslagen.`)
      }
      return [...prev, ...keep]
    })

    if (problems.length) setError(problems.join(' · '))
  }

  const removeItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((p) => p.id === id)
      if (target) URL.revokeObjectURL(target.url)
      return prev.filter((p) => p.id !== id)
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!user) {
      setError('Log eerst in om foto’s te uploaden.')
      openLogin()
      return
    }
    if (!emailVerified) {
      setError('Bevestig eerst je e-mailadres (check je inbox), daarna kun je uploaden.')
      return
    }
    if (items.length === 0) {
      setError('Kies eerst één of meer foto’s.')
      return
    }

    try {
      setUploading(true)
      let ok = 0
      const failNames: string[] = []

      for (let i = 0; i < items.length; i++) {
        const { file } = items[i]
        setProgress(`Uploaden ${i + 1}/${items.length}…`)
        try {
          const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
          const storagePath = `zone/${zoneId}/ugc/${user.id}/${Date.now()}-${i}.${ext}`

          const { error: uploadError } = await supabase.storage.from(BUCKET).upload(storagePath, file, {
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
            caption: caption.trim() || undefined,
            status: 'pending',
          })
          ok += 1
        } catch {
          failNames.push(file.name)
        }
      }

      clearPreviews()
      setCaption('')
      setProgress('')

      if (ok === 0) {
        setError('Upload mislukt. Probeer opnieuw.')
        return
      }

      const failNote = failNames.length ? ` (${failNames.length} mislukt)` : ''
      setSuccess(
        liveNow
          ? `${ok} foto${ok === 1 ? '' : '’s'} live op deze pagina${failNote}.`
          : `${ok} foto${ok === 1 ? '' : '’s'} ontvangen — na goedkeuring zichtbaar${failNote}.`
      )
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload mislukt'
      setError(message)
    } finally {
      setUploading(false)
      setProgress('')
    }
  }

  const hint = useMemo(
    () =>
      liveNow
        ? 'Tijdens Corri d’Or Fest verschijnen foto’s meteen (geen wachtrij).'
        : 'Na goedkeuring door de crew verschijnt je foto op deze pagina.',
    [liveNow]
  )

  if (authLoading) {
    return <p className="text-sm text-gray-600">Auth laden…</p>
  }

  if (!user) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-700">
          Maak of open een account met geverifieerd e-mailadres om foto’s voor zone {zoneNumber} te delen.
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
      <p className="text-sm text-gray-600">{hint}</p>

      <div>
        <p className="mb-2 text-sm font-medium text-gray-800">1. Kies foto’s (meerdere mogelijk)</p>
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-pink-400 bg-pink-50/80 px-4 py-8 text-center transition hover:border-pink-500 hover:bg-pink-100/80">
          <span className="rounded-full bg-pink-500 px-5 py-2 text-sm font-semibold text-white">
            Bestanden openen…
          </span>
          <span className="text-xs text-gray-600">
            JPG, PNG of WebP · max 8 MB per foto · tot {MAX_FILES} tegelijk
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => {
              addFiles(e.target.files)
              e.target.value = ''
            }}
          />
        </label>
      </div>

      {items.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item) => (
            <li key={item.id} className="relative overflow-hidden rounded-2xl border border-pink-200 bg-white shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt={item.file.name} className="aspect-square w-full object-cover" />
              <p className="truncate px-2 py-1 text-[11px] text-gray-600" title={item.file.name}>
                {item.file.name}
              </p>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white hover:bg-black/80"
                aria-label={`${item.file.name} verwijderen`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">2. Bijschrift (optioneel, voor alle)</label>
        <input
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          maxLength={120}
          placeholder="Korte beschrijving"
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-700">{success}</p>}
      {progress && <p className="text-sm text-gray-600">{progress}</p>}

      <button
        type="submit"
        disabled={uploading || items.length === 0}
        className="w-full rounded-lg bg-pink-500 px-4 py-3 font-semibold text-white hover:bg-pink-600 disabled:opacity-60"
      >
        {uploading
          ? progress || 'Uploaden…'
          : liveNow
            ? `3. ${items.length || ''} foto${items.length === 1 ? '' : '’s'} publiceren`
            : `3. ${items.length || ''} foto${items.length === 1 ? '' : '’s'} indienen`}
      </button>
    </form>
  )
}
