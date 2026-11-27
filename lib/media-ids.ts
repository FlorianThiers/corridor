const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const HISTORY_ID_RE = /^geschiedenis-[a-z0-9-]{1,80}$/

export type StableMediaId =
  | { kind: 'photo'; id: string }
  | { kind: 'history'; id: string }
  | { kind: 'cover'; zoneId: string }

/** Ids UC can store and send back to PATCH /api/v1/media/:id. */
export function parseStableMediaId(raw: string): StableMediaId | null {
  const id = raw.trim()
  if (!id || id.length > 200) return null
  if (UUID_RE.test(id)) return { kind: 'photo', id: id.toLowerCase() }
  if (HISTORY_ID_RE.test(id)) return { kind: 'history', id }
  const cover = /^zone-cover-([0-9a-f-]{36})$/i.exec(id)
  if (cover && UUID_RE.test(cover[1])) {
    return { kind: 'cover', zoneId: cover[1].toLowerCase() }
  }
  return null
}

/** Same id the feed emits, so a credit override matches the item. */
export function canonicalMediaId(raw: string): string | null {
  const parsed = parseStableMediaId(raw)
  if (!parsed) return null
  if (parsed.kind === 'cover') return `zone-cover-${parsed.zoneId}`
  return parsed.id
}
