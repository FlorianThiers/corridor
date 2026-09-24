'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getZones } from '@/lib/database'
import type { Zone } from '@/types'

const SITE = 'https://corridor.gent'

type QrItem = {
  id: string
  title: string
  subtitle: string
  url: string
  png: string
  svg: string
}

export function AdminQr() {
  const [zones, setZones] = useState<Zone[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    void (async () => {
      try {
        setZones(await getZones(supabase))
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const items: QrItem[] = useMemo(() => {
    const general: QrItem = {
      id: 'zones',
      title: 'Alle zones',
      subtitle: 'Algemene QR voor op Corridor',
      url: `${SITE}/zones`,
      png: '/qr/zones.png',
      svg: '/qr/zones.svg',
    }
    const perZone = zones.map((z) => ({
      id: `zone-${z.zone_number}`,
      title: `Zone ${z.zone_number}: ${z.name}`,
      subtitle: 'Zone-detailpagina',
      url: `${SITE}/zones/${z.zone_number}`,
      png: `/qr/zone-${z.zone_number}.png`,
      svg: `/qr/zone-${z.zone_number}.svg`,
    }))
    return [general, ...perZone]
  }, [zones])

  if (loading) {
    return <p className="text-center text-gray-600">Zones laden…</p>
  }

  return (
    <div>
      <p className="mb-6 text-center text-gray-600">
        Printklare QR-codes (Corridor-roze SVG + PNG). Open de afbeelding of download voor stickers.
      </p>
      <div className="mb-8 rounded-3xl bg-white/60 p-4 text-center print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg bg-pink-500 px-6 py-3 font-medium text-white hover:bg-pink-600"
        >
          Printblad openen
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 print:grid-cols-2">
        {items.map((item) => (
          <article
            key={item.id}
            className="flex flex-col items-center rounded-3xl border border-pink-100 bg-white p-5 shadow-sm print:break-inside-avoid"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.svg}
              alt={`QR ${item.title}`}
              className="mb-4 h-48 w-48 rounded-2xl border border-pink-100 bg-white p-2"
            />
            <h3 className="text-center text-lg font-bold text-gray-800">{item.title}</h3>
            <p className="mb-1 text-center text-xs text-gray-500">{item.subtitle}</p>
            <a
              href={item.url}
              className="mb-3 break-all text-center text-xs text-pink-600 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              {item.url}
            </a>
            <div className="flex flex-wrap justify-center gap-2 print:hidden">
              <a
                href={item.png}
                download
                className="rounded-full bg-pink-500 px-3 py-1 text-xs font-medium text-white hover:bg-pink-600"
              >
                PNG
              </a>
              <a
                href={item.svg}
                download
                className="rounded-full bg-violet-500 px-3 py-1 text-xs font-medium text-white hover:bg-violet-600"
              >
                SVG (roze)
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
