import { timingSafeEqual } from 'node:crypto'

type HeaderSource = {
  headers: { get(name: string): string | null }
}

function bearerMatches(request: HeaderSource, expected: string | undefined): boolean {
  if (!expected) return false
  const header = request.headers.get('authorization')
  if (!header) return false
  const prefix = 'Bearer '
  if (!header.startsWith(prefix)) return false
  const actual = header.slice(prefix.length)
  const actualBuf = Buffer.from(actual)
  const expectedBuf = Buffer.from(expected)
  if (actualBuf.length !== expectedBuf.length) return false
  return timingSafeEqual(actualBuf, expectedBuf)
}

/** Read-only UC feeds (media + zones). Dedicated media key, or the agenda key. */
export function isMediaApiAuthorized(request: HeaderSource): boolean {
  if (bearerMatches(request, process.env.CORRIDOR_MEDIA_API_KEY)) {
    return true
  }
  return bearerMatches(request, process.env.CORRIDOR_AGENDA_API_KEY)
}

/**
 * PATCH credit only. The write key must be set and must differ from the read keys,
 * so a leaked read key cannot change credits.
 */
export function isMediaWriteAuthorized(request: HeaderSource): boolean {
  const writeKey = process.env.CORRIDOR_MEDIA_WRITE_API_KEY
  if (!writeKey) return false
  if (
    writeKey === process.env.CORRIDOR_MEDIA_API_KEY ||
    writeKey === process.env.CORRIDOR_AGENDA_API_KEY
  ) {
    return false
  }
  return bearerMatches(request, writeKey)
}
