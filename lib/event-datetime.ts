import { SITE_TIME_ZONE } from '@/lib/format-event-time'

/**
 * Values from <input type="datetime-local"> are wall-clock times without timezone.
 * Supabase/Postgres timestamptz treats naive strings as UTC — we convert Brussels → UTC ISO.
 */
export function datetimeLocalToStorageIso(
  localValue: string | null | undefined,
  timeZone = SITE_TIME_ZONE
): string | undefined {
  if (!localValue || !localValue.trim()) return undefined

  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/.exec(localValue.trim())
  if (!match) return localValue

  const want = {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: Number(match[4]),
    minute: Number(match[5]),
    second: Number(match[6] ?? 0),
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  function zonedParts(ms: number) {
    const parts = formatter.formatToParts(new Date(ms))
    const out: Record<string, number> = {}
    for (const p of parts) {
      if (p.type === 'literal') continue
      out[p.type] = Number(p.value)
    }
    return out
  }

  let ms = Date.UTC(want.year, want.month - 1, want.day, want.hour, want.minute, want.second)
  for (let i = 0; i < 4; i++) {
    const got = zonedParts(ms)
    const diff =
      Date.UTC(want.year, want.month - 1, want.day, want.hour, want.minute, want.second) -
      Date.UTC(got.year, got.month - 1, got.day, got.hour, got.minute, got.second)
    if (diff === 0) break
    ms += diff
  }

  return new Date(ms).toISOString()
}

/** For datetime-local defaultValue / controlled value from stored ISO. */
export function storageIsoToDatetimeLocal(
  iso: string | null | undefined,
  timeZone = SITE_TIME_ZONE
): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
    .formatToParts(date)
    .reduce<Record<string, string>>((acc, p) => {
      if (p.type !== 'literal') acc[p.type] = p.value
      return acc
    }, {})

  const hour = parts.hour === '24' ? '00' : parts.hour
  return `${parts.year}-${parts.month}-${parts.day}T${hour}:${parts.minute}`
}
