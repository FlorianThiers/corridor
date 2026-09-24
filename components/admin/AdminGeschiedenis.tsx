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
import {
  historyPhotos as staticPhotos,
  historyMilestones as staticMilestones,
} from '@/lib/geschiedenis'
import type { HistoryMilestoneRow, HistoryPhotoRow } from '@/types'

const BUCKET = 'zone-photos'

export function AdminGeschiedenis() {
  const supabase = createClient()
  const [milestones, setMilestones] = useState<HistoryMilestoneRow[]>([])
  const [photos, setPhotos] = useState<HistoryPhotoRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  const [editingMilestone, setEditingMilestone] = useState<HistoryMilestoneRow | null>(null)
  const [editingPhoto, setEditingPhoto] = useState<HistoryPhotoRow | null>(null)
  const [seeding, setSeeding] = useState(false)

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
      setEditingMilestone(null)
      setMsg('Mijlpaal opgeslagen')
      await load()
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : 'Opslaan mislukt')
    }
  }

  const savePhotoMeta = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingPhoto) return
    setMsg('')
    const fd = new FormData(e.currentTarget)
    try {
      await upsertHistoryPhoto(supabase, {
        id: editingPhoto.id,
        src: editingPhoto.src,
        alt: (fd.get('alt') as string) || editingPhoto.alt,
        caption: (fd.get('caption') as string) || undefined,
        sort_order: Number(fd.get('sort_order') || 0),
        is_published: fd.get('is_published') === 'on',
      })
      setEditingPhoto(null)
      setMsg('Foto bijgewerkt')
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
        sort_order: Number(fd.get('sort_order') || photos.length),
        is_published: true,
      })
      e.currentTarget.reset()
      setMsg('Foto opgeslagen')
      await load()
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : 'Upload mislukt')
    }
  }

  const importStaticContent = async () => {
    if (!confirm('Huidige site-content (hardcoded mijlpalen + foto’s) importeren naar de database?')) return
    setSeeding(true)
    setMsg('')
    try {
      if (milestones.length === 0) {
        for (let i = 0; i < staticMilestones.length; i++) {
          const m = staticMilestones[i]
          await upsertHistoryMilestone(supabase, {
            year: m.year,
            title: m.title,
            description: m.description,
            sort_order: i,
          })
        }
      }
      if (photos.length === 0) {
        for (let i = 0; i < staticPhotos.length; i++) {
          const p = staticPhotos[i]
          await upsertHistoryPhoto(supabase, {
            src: p.src,
            alt: p.alt,
            caption: p.caption,
            sort_order: i,
            is_published: true,
          })
        }
      }
      setMsg('Import klaar. Je kunt nu bewerken en wissen.')
      await load()
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : 'Import mislukt')
    } finally {
      setSeeding(false)
    }
  }

  if (loading) return <p className="text-gray-600">Geschiedenis laden…</p>

  const dbEmpty = milestones.length === 0 && photos.length === 0

  return (
    <div className="space-y-10">
      {error && <div className="rounded-lg bg-red-100 p-3 text-red-700">{error}</div>}
      {msg && <div className="rounded-lg bg-blue-50 p-3 text-blue-800">{msg}</div>}

      {dbEmpty && (
        <section className="rounded-3xl border-2 border-dashed border-pink-300 bg-pink-50/60 p-6">
          <h2 className="mb-2 text-lg font-bold text-gray-800">Nog geen CMS-content</h2>
          <p className="mb-4 text-sm text-gray-700">
            De publieke pagina toont nu de vaste content uit de code. Importeer die hier om te bewerken.
          </p>
          <button
            type="button"
            disabled={seeding}
            onClick={() => void importStaticContent()}
            className="rounded-lg bg-pink-500 px-5 py-2 font-medium text-white hover:bg-pink-600 disabled:opacity-60"
          >
            {seeding ? 'Importeren…' : 'Importeer huidige foto’s + mijlpalen'}
          </button>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-semibold text-gray-800">Preview mijlpalen ({staticMilestones.length})</p>
              <ul className="max-h-48 space-y-2 overflow-y-auto text-sm text-gray-700">
                {staticMilestones.map((m) => (
                  <li key={`${m.year}-${m.title}`}>
                    <span className="font-medium text-pink-600">{m.year}</span> · {m.title}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-gray-800">Preview foto’s ({staticPhotos.length})</p>
              <div className="grid max-h-48 grid-cols-3 gap-2 overflow-y-auto">
                {staticPhotos.slice(0, 9).map((p) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={p.src} src={p.src} alt={p.alt} className="aspect-square rounded object-cover" />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-xl font-bold text-gray-800">Mijlpalen ({milestones.length})</h2>
        <form
          key={editingMilestone?.id || 'new-milestone'}
          onSubmit={saveMilestone}
          className="mb-6 grid gap-3 rounded-2xl bg-white/60 p-4 md:grid-cols-2"
        >
          {editingMilestone && <input type="hidden" name="id" value={editingMilestone.id} />}
          <input
            name="year"
            required
            placeholder="Jaar *"
            defaultValue={editingMilestone?.year || ''}
            className="rounded-lg border px-3 py-2"
          />
          <input
            name="sort_order"
            type="number"
            defaultValue={editingMilestone?.sort_order ?? milestones.length}
            placeholder="Volgorde"
            className="rounded-lg border px-3 py-2"
          />
          <input
            name="title"
            required
            placeholder="Titel *"
            defaultValue={editingMilestone?.title || ''}
            className="rounded-lg border px-3 py-2 md:col-span-2"
          />
          <textarea
            name="description"
            required
            rows={3}
            placeholder="Beschrijving *"
            defaultValue={editingMilestone?.description || ''}
            className="rounded-lg border px-3 py-2 md:col-span-2"
          />
          <div className="flex gap-2 md:col-span-2">
            <button type="submit" className="rounded-lg bg-pink-500 px-4 py-2 text-white">
              {editingMilestone ? 'Mijlpaal bijwerken' : 'Mijlpaal toevoegen'}
            </button>
            {editingMilestone && (
              <button
                type="button"
                className="rounded-lg bg-gray-200 px-4 py-2"
                onClick={() => setEditingMilestone(null)}
              >
                Annuleren
              </button>
            )}
          </div>
        </form>
        <ul className="space-y-3">
          {milestones.map((m) => (
            <li key={m.id} className="flex items-start justify-between gap-4 rounded-2xl bg-white/50 p-4">
              <div>
                <p className="font-bold text-pink-600">
                  {m.year} · {m.title}
                </p>
                <p className="text-sm text-gray-700">{m.description}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  className="rounded-lg bg-blue-500 px-3 py-1 text-sm text-white"
                  onClick={() => setEditingMilestone(m)}
                >
                  Bewerken
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-red-500 px-3 py-1 text-sm text-white"
                  onClick={async () => {
                    if (!confirm('Mijlpaal verwijderen?')) return
                    await deleteHistoryMilestone(supabase, m.id)
                    await load()
                  }}
                >
                  Wis
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-gray-800">Geschiedenis-foto&apos;s ({photos.length})</h2>
        <form onSubmit={uploadPhoto} className="mb-6 grid gap-3 rounded-2xl bg-white/60 p-4 md:grid-cols-2">
          <input type="file" name="file" accept="image/*" className="text-sm md:col-span-2" />
          <input name="src" type="url" placeholder="Of afbeelding-URL (bv. /geschiedenis/...)" className="rounded-lg border px-3 py-2 md:col-span-2" />
          <input name="alt" placeholder="Alt-tekst" className="rounded-lg border px-3 py-2" />
          <input name="sort_order" type="number" defaultValue={photos.length} placeholder="Volgorde" className="rounded-lg border px-3 py-2" />
          <input name="caption" placeholder="Bijschrift" className="rounded-lg border px-3 py-2 md:col-span-2" />
          <button type="submit" className="rounded-lg bg-pink-500 px-4 py-2 text-white md:col-span-2">
            Foto toevoegen
          </button>
        </form>

        {editingPhoto && (
          <form onSubmit={savePhotoMeta} className="mb-6 grid gap-3 rounded-2xl border border-blue-200 bg-blue-50/50 p-4 md:grid-cols-2">
            <p className="md:col-span-2 text-sm font-semibold text-gray-800">Foto bewerken</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={editingPhoto.src} alt="" className="md:col-span-2 max-h-40 rounded-lg object-cover" />
            <input name="alt" defaultValue={editingPhoto.alt} placeholder="Alt" className="rounded-lg border px-3 py-2" />
            <input name="sort_order" type="number" defaultValue={editingPhoto.sort_order} className="rounded-lg border px-3 py-2" />
            <input name="caption" defaultValue={editingPhoto.caption || ''} placeholder="Bijschrift" className="rounded-lg border px-3 py-2 md:col-span-2" />
            <label className="flex items-center gap-2 text-sm md:col-span-2">
              <input type="checkbox" name="is_published" defaultChecked={editingPhoto.is_published} />
              Gepubliceerd op de site
            </label>
            <div className="flex gap-2 md:col-span-2">
              <button type="submit" className="rounded-lg bg-blue-500 px-4 py-2 text-white">Opslaan</button>
              <button type="button" className="rounded-lg bg-gray-200 px-4 py-2" onClick={() => setEditingPhoto(null)}>Annuleren</button>
            </div>
          </form>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((p) => (
            <div key={p.id} className="rounded-2xl bg-white/50 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.src} alt={p.alt} className="mb-2 aspect-video w-full rounded-lg object-cover" />
              <p className="mb-1 text-xs font-medium text-gray-800">{p.caption || p.alt}</p>
              <p className="mb-2 text-xs text-gray-500">
                #{p.sort_order} · {p.is_published ? 'live' : 'verborgen'}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-lg bg-blue-500 px-3 py-1 text-sm text-white"
                  onClick={() => setEditingPhoto(p)}
                >
                  Bewerken
                </button>
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
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
