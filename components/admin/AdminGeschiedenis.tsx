'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  getHistoryMilestones,
  getHistoryPhotosAdmin,
  upsertHistoryMilestone,
  deleteHistoryMilestone,
  upsertHistoryPhoto,
  deleteHistoryPhoto,
} from '@/lib/database'
import type { HistoryMilestoneRow, HistoryPhotoRow } from '@/types'

const BUCKET = 'zone-photos'

export function AdminGeschiedenis() {
  const supabase = createClient()
  const [milestones, setMilestones] = useState<HistoryMilestoneRow[]>([])
  const [photos, setPhotos] = useState<HistoryPhotoRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')

  const load = async () => {
    try {
      setLoading(true)
      setError('')
      const [m, p] = await Promise.all([
        getHistoryMilestones(supabase),
        getHistoryPhotosAdmin(supabase),
      ])
      setMilestones(m)
      setPhotos(p)
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Kon geschiedenis niet laden (migratie al gedraaid?)'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const saveMilestone = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMsg('')
    const fd = new FormData(e.currentTarget)
    try {
      await upsertHistoryMilestone(supabase, {
        id: (fd.get('id') as string) || undefined,
        year: fd.get('year') as string,
        title: fd.get('title') as string,
        description: fd.get('description') as string,
        sort_order: Number(fd.get('sort_order') || 0),
      })
      e.currentTarget.reset()
      setMsg('Mijlpaal opgeslagen')
      await load()
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : 'Opslaan mislukt')
    }
  }

  const uploadPhoto = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMsg('')
    const fd = new FormData(e.currentTarget)
    const file = fd.get('file') as File | null
    let src = (fd.get('src') as string) || ''
    try {
      if (file && file.size > 0) {
        const ext = file.name.split('.').pop() || 'jpg'
        const path = `history/${Date.now()}.${ext}`
        const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
          contentType: file.type,
        })
        if (upErr) throw upErr
        src = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
      }
      if (!src) throw new Error('URL of bestand verplicht')

      await upsertHistoryPhoto(supabase, {
        src,
        alt: (fd.get('alt') as string) || 'Geschiedenis foto',
        caption: (fd.get('caption') as string) || undefined,
        sort_order: Number(fd.get('sort_order') || 0),
        is_published: true,
      })
      e.currentTarget.reset()
      setMsg('Foto opgeslagen')
      await load()
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : 'Upload mislukt')
    }
  }

  if (loading) return <p className="text-gray-600">Geschiedenis laden…</p>

  return (
    <div className="space-y-10">
      {error && <div className="rounded-lg bg-red-100 p-3 text-red-700">{error}</div>}
      {msg && <div className="rounded-lg bg-blue-50 p-3 text-blue-800">{msg}</div>}

      <section>
        <h2 className="mb-4 text-xl font-bold text-gray-800">Mijlpalen</h2>
        <form onSubmit={saveMilestone} className="mb-6 grid gap-3 rounded-2xl bg-white/60 p-4 md:grid-cols-2">
          <input name="year" required placeholder="Jaar *" className="rounded-lg border px-3 py-2" />
          <input name="sort_order" type="number" defaultValue={0} placeholder="Volgorde" className="rounded-lg border px-3 py-2" />
          <input name="title" required placeholder="Titel *" className="rounded-lg border px-3 py-2 md:col-span-2" />
          <textarea name="description" required rows={3} placeholder="Beschrijving *" className="rounded-lg border px-3 py-2 md:col-span-2" />
          <button type="submit" className="rounded-lg bg-pink-500 px-4 py-2 text-white md:col-span-2">
            Mijlpaal toevoegen
          </button>
        </form>
        <ul className="space-y-3">
          {milestones.map((m) => (
            <li key={m.id} className="flex items-start justify-between gap-4 rounded-2xl bg-white/50 p-4">
              <div>
                <p className="font-bold text-pink-600">{m.year} · {m.title}</p>
                <p className="text-sm text-gray-700">{m.description}</p>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-lg bg-red-500 px-3 py-1 text-sm text-white"
                onClick={async () => {
                  if (!confirm('Mijlpaal verwijderen?')) return
                  await deleteHistoryMilestone(supabase, m.id)
                  await load()
                }}
              >
                Wis
              </button>
            </li>
          ))}
          {milestones.length === 0 && (
            <p className="text-sm text-gray-600">Nog geen DB-mijlpalen. Publieke pagina valt terug op hardcoded content tot je hier iets zet.</p>
          )}
        </ul>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-gray-800">Geschiedenis-foto&apos;s</h2>
        <form onSubmit={uploadPhoto} className="mb-6 grid gap-3 rounded-2xl bg-white/60 p-4 md:grid-cols-2">
          <input type="file" name="file" accept="image/*" className="text-sm md:col-span-2" />
          <input name="src" type="url" placeholder="Of afbeelding-URL" className="rounded-lg border px-3 py-2 md:col-span-2" />
          <input name="alt" placeholder="Alt-tekst" className="rounded-lg border px-3 py-2" />
          <input name="sort_order" type="number" defaultValue={0} placeholder="Volgorde" className="rounded-lg border px-3 py-2" />
          <input name="caption" placeholder="Bijschrift" className="rounded-lg border px-3 py-2 md:col-span-2" />
          <button type="submit" className="rounded-lg bg-pink-500 px-4 py-2 text-white md:col-span-2">
            Foto toevoegen
          </button>
        </form>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((p) => (
            <div key={p.id} className="rounded-2xl bg-white/50 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.src} alt={p.alt} className="mb-2 aspect-video w-full rounded-lg object-cover" />
              <p className="text-xs text-gray-600 mb-2">{p.caption || p.alt}</p>
              <button
                type="button"
                className="rounded-lg bg-red-500 px-3 py-1 text-sm text-white"
                onClick={async () => {
                  if (!confirm('Foto verwijderen?')) return
                  await deleteHistoryPhoto(supabase, p.id)
                  await load()
                }}
              >
                Wis
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
