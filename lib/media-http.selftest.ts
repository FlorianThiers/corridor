/**
 * API tests for GET /api/v1/media, GET /api/v1/zones and PATCH /api/v1/media/:id.
 * Auth uses CORRIDOR_MEDIA_API_KEY and CORRIDOR_MEDIA_WRITE_API_KEY.
 */
import assert from 'node:assert/strict'

import { getMediaFeed, getZonesFeed, patchMediaCredit } from './media-http'

const HILLES = '11111111-1111-4111-8111-111111111111'
const FEST = '22222222-2222-4222-8222-222222222222'
const ARTS = '33333333-3333-4333-8333-333333333333'
const SECRET = '44444444-4444-4444-8444-444444444444'

const HILLES_PHOTO = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'
const FEST_PHOTO = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2'
const ARTS_PHOTO = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3'
const PENDING_PHOTO = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4'

const PENDING_URL = 'https://cdn.example/pending-secret.jpg'
const ARTS_URL = 'https://cdn.example/arts-approved.jpg'
const FEST_URL = 'https://cdn.example/fest-approved.jpg'
const HILLES_URL = 'https://cdn.example/hilles-trick.jpg'
const ORIGIN = 'https://corridor.gent'
const HISTORY_ID = 'geschiedenis-13-meubilair-onder-brug'

type Row = Record<string, unknown>
type Filter =
  | { op: 'eq' | 'neq' | 'gte' | 'lt'; col: string; val: unknown }
  | { op: 'in'; col: string; val: unknown[] }

type TableState = { rows: Row[]; missing?: boolean }

const previousEnv = {
  media: process.env.CORRIDOR_MEDIA_API_KEY,
  agenda: process.env.CORRIDOR_AGENDA_API_KEY,
  write: process.env.CORRIDOR_MEDIA_WRITE_API_KEY,
  site: process.env.CORRIDOR_SITE_URL,
}

function restoreEnv(name: string, value: string | undefined) {
  if (value === undefined) delete process.env[name]
  else process.env[name] = value
}

function compare(a: unknown, b: unknown): number {
  if (a === b) return 0
  if (a == null) return -1
  if (b == null) return 1
  return a < b ? -1 : 1
}

function createFake(options?: { hideNonApproved?: boolean; missingOverrides?: boolean }) {
  const tables: Record<string, TableState> = {
    zones: {
      rows: [
        {
          id: HILLES,
          zone_number: 8,
          name: 'Hilles',
          description: 'Pumptrack',
          slug: 'hilles',
          cover_url: '/zones/hilles-cover.webp',
          spray_allowed: false,
          latitude: 51.035,
          longitude: 3.76,
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-06-01T00:00:00.000Z',
        },
        {
          id: FEST,
          zone_number: 16,
          name: "Corri d'Or fest",
          slug: 'corri-dor-fest',
          cover_url: FEST_URL,
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-06-01T00:00:00.000Z',
        },
        {
          id: ARTS,
          zone_number: 11,
          name: 'Corri Arts',
          slug: 'corri-arts',
          cover_url: PENDING_URL,
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-06-01T00:00:00.000Z',
        },
        {
          id: SECRET,
          zone_number: 12,
          name: 'Secret',
          slug: 'secret',
          cover_url: PENDING_URL,
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-06-01T00:00:00.000Z',
        },
      ],
    },
    zone_photos: {
      rows: [
        {
          id: HILLES_PHOTO,
          zone_id: HILLES,
          storage_path: 'zone/hilles/approved/trick.jpg',
          public_url: HILLES_URL,
          caption: 'Skate trick',
          status: 'approved',
          created_at: '2026-09-25T12:00:00.000Z',
          updated_at: '2024-06-01T00:00:00.000Z',
        },
        {
          id: FEST_PHOTO,
          zone_id: FEST,
          storage_path: 'zone/fest/approved/crowd.jpg',
          public_url: FEST_URL,
          caption: 'Fest',
          status: 'approved',
          created_at: '2026-01-15T00:00:00.000Z',
          updated_at: '2024-06-01T00:00:00.000Z',
        },
        {
          id: ARTS_PHOTO,
          zone_id: ARTS,
          storage_path: 'zone/arts/approved/wall.jpg',
          public_url: ARTS_URL,
          caption: 'Muur',
          status: 'approved',
          created_at: '2026-08-02T00:00:00.000Z',
          updated_at: '2024-06-01T00:00:00.000Z',
        },
        {
          id: PENDING_PHOTO,
          zone_id: ARTS,
          storage_path: 'zone/arts/ugc/pending.jpg',
          public_url: PENDING_URL,
          caption: 'Nog niet',
          status: 'pending',
          created_at: '2026-08-03T00:00:00.000Z',
          updated_at: '2026-08-03T00:00:00.000Z',
        },
      ],
    },
    users: { rows: [] },
    media_credit_overrides: { rows: [], missing: options?.missingOverrides === true },
  }

  function rowsFor(table: string): Row[] {
    const state = tables[table]
    if (!state) return []
    if (table === 'zone_photos' && options?.hideNonApproved) {
      return state.rows.filter((row) => row.status === 'approved')
    }
    return state.rows
  }

  function run(table: string, filters: Filter[], orderCol: string | null, ascending: boolean) {
    const state = tables[table]
    if (!state || state.missing) {
      return {
        data: null,
        error: { code: '42P01', message: `relation "${table}" does not exist` },
      }
    }
    let rows = rowsFor(table).filter((row) =>
      filters.every((filter) => {
        const value = row[filter.col]
        if (filter.op === 'eq') return value === filter.val
        if (filter.op === 'neq') return value !== filter.val
        if (filter.op === 'in') return filter.val.includes(value)
        if (filter.op === 'gte') return compare(value, filter.val) >= 0
        if (filter.op === 'lt') return compare(value, filter.val) < 0
        return true
      })
    )
    if (orderCol) {
      rows = [...rows].sort((a, b) => compare(a[orderCol], b[orderCol]) * (ascending ? 1 : -1))
    }
    return { data: rows, error: null }
  }

  function builder(table: string) {
    const filters: Filter[] = []
    let orderCol: string | null = null
    let ascending = true
    const api = {
      select() {
        return api
      },
      eq(col: string, val: unknown) {
        filters.push({ op: 'eq', col, val })
        return api
      },
      neq(col: string, val: unknown) {
        filters.push({ op: 'neq', col, val })
        return api
      },
      in(col: string, val: unknown[]) {
        filters.push({ op: 'in', col, val })
        return api
      },
      gte(col: string, val: unknown) {
        filters.push({ op: 'gte', col, val })
        return api
      },
      lt(col: string, val: unknown) {
        filters.push({ op: 'lt', col, val })
        return api
      },
      order(col: string, opts?: { ascending?: boolean }) {
        orderCol = col
        ascending = opts?.ascending !== false
        return api
      },
      maybeSingle() {
        const result = run(table, filters, orderCol, ascending)
        if (result.error) return Promise.resolve(result)
        return Promise.resolve({ data: result.data?.[0] ?? null, error: null })
      },
      upsert(row: Row) {
        const state = tables[table]
        if (!state || state.missing) {
          return Promise.resolve({
            error: { code: '42P01', message: 'relation does not exist' },
          })
        }
        const index = state.rows.findIndex((existing) => existing.media_id === row.media_id)
        if (index >= 0) state.rows[index] = { ...state.rows[index], ...row }
        else state.rows.push({ ...row })
        return Promise.resolve({ error: null })
      },
      delete() {
        return {
          eq(col: string, val: unknown) {
            const state = tables[table]
            if (!state || state.missing) {
              return Promise.resolve({
                error: { code: '42P01', message: 'relation does not exist' },
              })
            }
            state.rows = state.rows.filter((row) => row[col] !== val)
            return Promise.resolve({ error: null })
          },
        }
      },
      then(resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) {
        return Promise.resolve(run(table, filters, orderCol, ascending)).then(resolve, reject)
      },
    }
    return api
  }

  return {
    from(table: string) {
      return builder(table)
    },
  }
}

function itemsOf(body: unknown) {
  return (body as { items: Array<Record<string, unknown>> }).items
}

function zonesOf(body: unknown) {
  return (body as { zones: Array<Record<string, unknown>> }).zones
}

async function main() {
  process.env.CORRIDOR_MEDIA_API_KEY = 'read-key'
  process.env.CORRIDOR_AGENDA_API_KEY = 'agenda-key'
  process.env.CORRIDOR_MEDIA_WRITE_API_KEY = 'write-key'
  delete process.env.CORRIDOR_SITE_URL

  const supabase = createFake()
  let opened = 0
  const openRead = async () => {
    opened += 1
    return { supabase: supabase as never, canModerate: true }
  }
  const readAuth = 'Bearer read-key'
  const writeAuth = 'Bearer write-key'

  const noAuth = await getMediaFeed({
    authorization: null,
    origin: ORIGIN,
    search: '',
    openClient: openRead,
  })
  assert.equal(noAuth.status, 401)
  assert.equal(opened, 0)

  const writeCannotRead = await getMediaFeed({
    authorization: writeAuth,
    origin: ORIGIN,
    search: '',
    openClient: openRead,
  })
  assert.equal(writeCannotRead.status, 401)
  assert.equal(opened, 0)

  const writeCannotReadZones = await getZonesFeed({
    authorization: writeAuth,
    origin: ORIGIN,
    openClient: openRead,
  })
  assert.equal(writeCannotReadZones.status, 401)

  const badSince = await getMediaFeed({
    authorization: readAuth,
    origin: ORIGIN,
    search: '?updated_since=yesterday',
    openClient: openRead,
  })
  assert.equal(badSince.status, 400)
  assert.equal(opened, 0)

  const media = await getMediaFeed({
    authorization: readAuth,
    origin: ORIGIN,
    search: '',
    openClient: openRead,
  })
  assert.equal(media.status, 200)
  const mediaItems = itemsOf(media.body)
  assert.equal(mediaItems.filter((item) => item.id === FEST_PHOTO).length, 1)
  assert.equal(mediaItems.find((item) => item.id === FEST_PHOTO)?.kind, 'event')
  assert.equal(mediaItems.find((item) => item.id === FEST_PHOTO)?.is_cover, true)
  assert.equal(mediaItems.some((item) => item.id === `zone-cover-${FEST}`), false)

  const hillesDuringFest = mediaItems.find((item) => item.id === HILLES_PHOTO)
  assert.equal(hillesDuringFest?.kind, 'zone')
  assert.equal(hillesDuringFest?.credit, 'Corridor')
  assert.ok(!JSON.stringify(media.body).includes(PENDING_URL))
  assert.ok(!mediaItems.some((item) => item.id === PENDING_PHOTO))

  const hillesOnly = await getMediaFeed({
    authorization: 'bearer read-key',
    origin: ORIGIN,
    search: '?zone=Hilles',
    openClient: openRead,
  })
  const hillesItems = itemsOf(hillesOnly.body)
  assert.ok(hillesItems.every((item) => (item.zone as { slug?: string } | null)?.slug === 'hilles'))
  assert.equal(
    hillesItems.find((item) => item.id === `zone-cover-${HILLES}`)?.url,
    `${ORIGIN}/zones/hilles-cover.webp`
  )

  const byNumber = await getMediaFeed({
    authorization: readAuth,
    origin: ORIGIN,
    search: '?zone=8&kind=zone',
    openClient: openRead,
  })
  assert.ok(itemsOf(byNumber.body).some((item) => item.id === HILLES_PHOTO))
  assert.ok(!itemsOf(byNumber.body).some((item) => item.id === FEST_PHOTO))

  const byUpperUuid = await getMediaFeed({
    authorization: readAuth,
    origin: ORIGIN,
    search: `?zone=${ARTS.toUpperCase()}`,
    openClient: openRead,
  })
  const artsItems = itemsOf(byUpperUuid.body)
  assert.equal(artsItems.find((item) => item.id === ARTS_PHOTO)?.is_cover, true)
  assert.equal(artsItems.find((item) => item.id === ARTS_PHOTO)?.url, ARTS_URL)
  assert.ok(!artsItems.some((item) => item.id === `zone-cover-${ARTS}`))

  const featured = await getMediaFeed({
    authorization: readAuth,
    origin: ORIGIN,
    search: '?featured=1',
    openClient: openRead,
  })
  const featuredItems = itemsOf(featured.body)
  assert.ok(featuredItems.every((item) => item.is_cover === true))
  assert.equal(featuredItems.find((item) => item.id === FEST_PHOTO)?.kind, 'event')
  assert.ok(featuredItems.some((item) => item.id === `zone-cover-${HILLES}`))

  const zones = await getZonesFeed({
    authorization: readAuth,
    origin: ORIGIN,
    openClient: openRead,
  })
  assert.equal(zones.status, 200)
  const spots = zonesOf(zones.body)
  const hillesSpot = spots.find((spot) => spot.id === HILLES)
  assert.equal(hillesSpot?.slug, 'hilles')
  assert.deepEqual((hillesSpot?.rules as { spray_allowed: boolean | null }).spray_allowed, false)
  assert.deepEqual(hillesSpot?.coordinates, { lat: 51.035, lng: 3.76 })
  assert.equal(
    (hillesSpot?.cover as { url: string }).url,
    `${ORIGIN}/zones/hilles-cover.webp`
  )
  const secret = spots.find((spot) => spot.id === SECRET)
  assert.equal(secret?.cover, null)
  assert.ok(!JSON.stringify(zones.body).includes(PENDING_URL))
  const artsSpot = spots.find((spot) => spot.id === ARTS)
  assert.equal((artsSpot?.cover as { url: string }).url, ARTS_URL)

  const anonSupabase = createFake({ hideNonApproved: true })
  const anonZones = await getZonesFeed({
    authorization: readAuth,
    origin: ORIGIN,
    openClient: async () => ({ supabase: anonSupabase as never, canModerate: false }),
  })
  assert.equal(zonesOf(anonZones.body).find((spot) => spot.id === SECRET)?.cover, null)
  assert.ok(!JSON.stringify(anonZones.body).includes(PENDING_URL))
  assert.equal(
    (zonesOf(anonZones.body).find((spot) => spot.id === ARTS)?.cover as { url: string }).url,
    ARTS_URL
  )

  delete process.env.CORRIDOR_MEDIA_API_KEY
  const agendaRead = await getZonesFeed({
    authorization: 'Bearer agenda-key',
    origin: ORIGIN,
    openClient: openRead,
  })
  assert.equal(agendaRead.status, 200)
  process.env.CORRIDOR_MEDIA_API_KEY = 'read-key'

  const readCannotWrite = await patchMediaCredit({
    authorization: readAuth,
    origin: ORIGIN,
    rawId: HISTORY_ID,
    readBody: async () => ({ credit: 'Sam' }),
    openClient: () => supabase as never,
  })
  assert.equal(readCannotWrite.status, 401)

  process.env.CORRIDOR_MEDIA_WRITE_API_KEY = 'read-key'
  const sameKey = await patchMediaCredit({
    authorization: readAuth,
    origin: ORIGIN,
    rawId: HISTORY_ID,
    readBody: async () => ({ credit: 'Sam' }),
    openClient: () => supabase as never,
  })
  assert.equal(sameKey.status, 401)
  process.env.CORRIDOR_MEDIA_WRITE_API_KEY = 'write-key'

  const extraField = await patchMediaCredit({
    authorization: writeAuth,
    origin: ORIGIN,
    rawId: HILLES_PHOTO,
    readBody: async () => ({ credit: 'Sam', artist_tag: 'nope' }),
    openClient: () => supabase as never,
  })
  assert.equal(extraField.status, 400)

  const photoCoverId = await patchMediaCredit({
    authorization: writeAuth,
    origin: ORIGIN,
    rawId: `zone-cover-${FEST.toUpperCase()}`,
    readBody: async () => ({ credit: 'Sam' }),
    openClient: () => supabase as never,
  })
  assert.equal(photoCoverId.status, 404)

  const staticCover = await patchMediaCredit({
    authorization: writeAuth,
    origin: ORIGIN,
    rawId: `zone-cover-${HILLES.toUpperCase()}`,
    readBody: async () => ({ credit: '  Sam  ' }),
    openClient: () => supabase as never,
  })
  assert.equal(staticCover.status, 200)
  assert.equal((staticCover.body as { id: string }).id, `zone-cover-${HILLES}`)
  assert.equal((staticCover.body as { credit: string }).credit, 'Sam')

  const since = new Date(Date.parse((staticCover.body as { updated_at: string }).updated_at) - 1000).toISOString()
  const incremental = await getMediaFeed({
    authorization: readAuth,
    origin: ORIGIN,
    search: `?updated_since=${encodeURIComponent(since)}`,
    openClient: openRead,
  })
  const changed = itemsOf(incremental.body)
  assert.ok(changed.some((item) => item.id === `zone-cover-${HILLES}` && item.credit === 'Sam'))
  assert.ok(!changed.some((item) => item.id === HILLES_PHOTO))

  const cleared = await patchMediaCredit({
    authorization: writeAuth,
    origin: ORIGIN,
    rawId: `zone-cover-${HILLES}`,
    readBody: async () => ({ credit: null }),
    openClient: () => supabase as never,
  })
  assert.equal(cleared.status, 200)
  assert.equal((cleared.body as { credit: string }).credit, 'Florian Thiers')

  const history = await patchMediaCredit({
    authorization: writeAuth,
    origin: ORIGIN,
    rawId: HISTORY_ID,
    readBody: async () => ({ credit: 'Sam' }),
    openClient: () => supabase as never,
  })
  assert.equal(history.status, 200)
  assert.equal((history.body as { credit: string }).credit, 'Sam')

  const missing = createFake({ missingOverrides: true })
  const unavailable = await patchMediaCredit({
    authorization: writeAuth,
    origin: ORIGIN,
    rawId: HISTORY_ID,
    readBody: async () => ({ credit: 'Sam' }),
    openClient: () => missing as never,
  })
  assert.equal(unavailable.status, 503)

  const noServiceRole = await patchMediaCredit({
    authorization: writeAuth,
    origin: ORIGIN,
    rawId: HISTORY_ID,
    readBody: async () => ({ credit: 'Sam' }),
    openClient: () => null,
  })
  assert.equal(noServiceRole.status, 503)

  const unknown = await patchMediaCredit({
    authorization: writeAuth,
    origin: ORIGIN,
    rawId: '../etc/passwd',
    readBody: async () => ({ credit: 'Sam' }),
    openClient: () => supabase as never,
  })
  assert.equal(unknown.status, 404)

  console.log('media-http.selftest: ok')
}

try {
  await main()
} finally {
  restoreEnv('CORRIDOR_MEDIA_API_KEY', previousEnv.media)
  restoreEnv('CORRIDOR_AGENDA_API_KEY', previousEnv.agenda)
  restoreEnv('CORRIDOR_MEDIA_WRITE_API_KEY', previousEnv.write)
  restoreEnv('CORRIDOR_SITE_URL', previousEnv.site)
}
