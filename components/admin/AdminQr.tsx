'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getZones } from '@/lib/database'
import type { Zone } from '@/types'

const SITE = 'https://corridor.gent'

/** Zelfde map als scripts/generate-zone-qrs.mjs */
const ZONE_COLORS: Record<number, string> = {
  1: '#d62839',
  2: '#4f9a3e',
  3: '#0aa8c4',
  4: '#d4921a',
  5: '#b84d96',
  6: '#3031c8',
  7: '#c4a800',
  8: '#8b5e3c',
  9: '#2622b8',
  10: '#9aaa00',
  11: '#5b2d8b',
  12: '#4a4a4a',
}

type QrItem = {
  id: string
  title: string
  subtitle: string
  url: string
  png: string
  svg: string
  colorLabel: string
  swatch?: string
  rainbow?: boolean
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
      colorLabel: 'pastel-regenboog',
      rainbow: true,
    }
    const perZone = zones.map((z) => {
      const swatch = ZONE_COLORS[z.zone_number]
      return {
        id: `zone-${z.zone_number}`,
        title: `Zone ${z.zone_number}: ${z.name}`,
        subtitle: 'Zone-detailpagina · kleur = omslag-accent',
        url: `${SITE}/zones/${z.zone_number}`,
        png: `/qr/zone-${z.zone_number}.png`,
        svg: `/qr/zone-${z.zone_number}.svg`,
        colorLabel: swatch || '—',
        swatch,
      }
    })
    return [general, ...perZone]
  }, [zones])

  if (loading) {
    return <p className="text-center text-gray-600">Zones laden…</p>
  }

  return (
    <div>
      <p className="mb-6 text-center text-gray-600">
        Printklare QR-codes: per zone in omslagkleur, algemeen in pastel-regenboog. PNG + SVG.
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
              src={`${item.svg}?v=color`}
              alt={`QR ${item.title}`}
              className="mb-4 h-48 w-48 rounded-2xl border border-pink-100 bg-white p-2"
            />
            <h3 className="text-center text-lg font-bold text-gray-800">{item.title}</h3>
            <p className="mb-1 text-center text-xs text-gray-500">{item.subtitle}</p>
            <div className="mb-2 flex items-center gap-2">
              {item.rainbow ? (
                <span
                  className="h-4 w-10 rounded-full"
                  style={{
                    background:
                      'linear-gradient(90deg,#e07088,#e09060,#c9a820,#5aab58,#4a9ec8,#7a68c8,#c068b8)',
                  }}
                  title="pastel-regenboog"
                />
              ) : item.swatch ? (
                <span
                  className="h-4 w-4 rounded-full border border-black/10"
                  style={{ background: item.swatch }}
                  title={item.swatch}
                />
              ) : null}
              <span className="font-mono text-[10px] text-gray-500">{item.colorLabel}</span>
            </div>
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
                SVG
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
