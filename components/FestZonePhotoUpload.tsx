'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import type { Zone } from '@/types'
import { ZonePhotoHowTo } from '@/components/ZonePhotoHowTo'
import { ZonePhotoSubmit } from '@/components/ZonePhotoSubmit'

interface FestZonePhotoUploadProps {
  zones: Pick<Zone, 'id' | 'zone_number' | 'name'>[]
  defaultZoneNumber?: number
}

export function FestZonePhotoUpload({ zones, defaultZoneNumber }: FestZonePhotoUploadProps) {
  const sorted = useMemo(
    () => [...zones].sort((a, b) => a.zone_number - b.zone_number),
    [zones]
  )
  const initialZone =
    (defaultZoneNumber != null && sorted.some((z) => z.zone_number === defaultZoneNumber)
      ? defaultZoneNumber
      : sorted[0]?.zone_number) ?? 1
  const [zoneNumber, setZoneNumber] = useState(initialZone)
  const selected = sorted.find((z) => z.zone_number === zoneNumber) ?? sorted[0]

  if (!selected) {
    return (
      <p className="text-center text-gray-600">
        Zones laden niet — probeer later opnieuw of upload via{' '}
        <Link href="/zones" className="font-medium text-pink-600 hover:underline">/zones</Link>.
      </p>
    )
  }

  return (
    <div id="foto-upload" className="scroll-mt-28 space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 graffiti-text">Jouw foto&apos;s</h2>
        <p className="mt-2 text-gray-600 max-w-2xl">
          Log in en upload fest-foto&apos;s (standaard zone {defaultZoneNumber ?? '…'}). Na goedkeuring staan ze in de fest-galerij op die zone.
        </p>
      </div>

      <ZonePhotoHowTo variant="overview" />

      <div className="rounded-3xl border-2 border-amber-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-sm max-w-2xl mx-auto">
        <label htmlFor="fest-zone-picker" className="mb-2 block text-sm font-semibold text-gray-800">
          Zone
        </label>
        <select
          id="fest-zone-picker"
          value={zoneNumber}
          onChange={(e) => setZoneNumber(Number(e.target.value))}
          className="mb-6 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-800 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
        >
          {sorted.map((zone) => (
            <option key={zone.id} value={zone.zone_number}>
              Zone {zone.zone_number}: {zone.name}
            </option>
          ))}
        </select>

        <h3 className="mb-4 text-lg font-bold text-gray-800">Upload</h3>
        <ZonePhotoSubmit zoneId={selected.id} zoneNumber={selected.zone_number} />
      </div>
    </div>
  )
}
