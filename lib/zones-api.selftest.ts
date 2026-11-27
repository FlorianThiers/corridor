import assert from 'node:assert/strict'

import { resolveZonePhotoCredit } from './media-credit'
import {
  formatZonesApiPhotoCredit,
  parseZonesQuery,
  toZoneSpot,
  zonePhotoToApiPhoto,
} from './zones-api'

const spot = toZoneSpot(
  {
    id: '3f1a0c2e-4b5d-4e6f-8a7b-9c0d1e2f3a4b',
    zone_number: 8,
    name: 'Hilles',
    description: '  Pumptrack  ',
    slug: 'hilles',
    spray_allowed: false,
    latitude: 51.035,
    longitude: '3.76',
  },
  'https://corridor.gent',
  '/zones/hilles-cover.webp'
)

assert.equal(spot.id, '3f1a0c2e-4b5d-4e6f-8a7b-9c0d1e2f3a4b')
assert.equal(spot.slug, 'hilles')
assert.equal(spot.description, 'Pumptrack')
assert.equal(spot.rules.spray_allowed, false)
assert.deepEqual(spot.coordinates, { lat: 51.035, lng: 3.76 })
assert.equal(spot.cover?.url, 'https://corridor.gent/zones/hilles-cover.webp')
assert.equal(spot.cover?.alt, 'Coverfoto Hilles')

const unknown = toZoneSpot(
  {
    id: '3f1a0c2e-4b5d-4e6f-8a7b-9c0d1e2f3a4b',
    zone_number: 11,
    name: 'Corri Arts',
    latitude: 120,
    longitude: 3,
  },
  'https://corridor.gent',
  null
)
assert.equal(unknown.rules.spray_allowed, null)
assert.equal(unknown.coordinates, null)
assert.equal(unknown.cover, null)
assert.equal(unknown.slug, null)

const florian = { full_name: 'Florian Thiers', email: 'florian@example.com' }
const neighbor = { full_name: 'Buurtbewoner', email: 'buurt@example.com' }

assert.deepEqual(parseZonesQuery(new URLSearchParams()), {
  zoneNumber: undefined,
  photosLimit: 48,
})
assert.deepEqual(parseZonesQuery(new URLSearchParams('zone=3&limit=10')), {
  zoneNumber: 3,
  photosLimit: 10,
})
assert.deepEqual(
  parseZonesQuery(new URLSearchParams('limit=9999')).photosLimit,
  200
)
assert.equal(
  parseZonesQuery(new URLSearchParams('zone=bad')).zoneNumber,
  undefined
)

const ugcResolved = resolveZonePhotoCredit(
  {
    storage_path: 'zone/abc/ugc/user-1/123.jpg',
    caption: 'Skate trick',
  },
  neighbor
)
assert.deepEqual(formatZonesApiPhotoCredit(ugcResolved), {
  credit: 'foto: Buurtbewoner / Corridor',
  photographer: 'Buurtbewoner',
})

const florianResolved = resolveZonePhotoCredit(
  { storage_path: 'zone/abc/approved/123.jpg' },
  florian
)
assert.deepEqual(formatZonesApiPhotoCredit(florianResolved), {
  credit: 'foto: Florian Thiers / Corridor',
  photographer: 'Florian Thiers',
})

const legacyResolved = resolveZonePhotoCredit(
  { storage_path: 'zone/abc/approved/old-chat.jpg' },
  null
)
assert.deepEqual(formatZonesApiPhotoCredit(legacyResolved), {
  credit: 'Corridor',
  photographer: null,
})

const withArtist = zonePhotoToApiPhoto(
  {
    id: 'photo-1',
    zone_id: 'zone-1',
    storage_path: 'zone/abc/ugc/user-1/123.jpg',
    public_url: 'https://cdn.example/1.jpg',
    status: 'approved',
    artist_tag: '@skater',
    created_at: '2026-01-01T12:00:00.000Z',
  },
  neighbor
)
assert.equal(withArtist.artist_tag, '@skater')
assert.equal(withArtist.credit, 'foto: Buurtbewoner / Corridor')
assert.equal(withArtist.created_at, '2026-01-01T12:00:00.000Z')

function bearerAuthorized(
  header: string | null,
  expectedKeys: string[]
): boolean {
  if (!header) return false
  return expectedKeys.some((key) => key && header === `Bearer ${key}`)
}

assert.equal(
  bearerAuthorized('Bearer agenda-secret', ['media-secret', 'agenda-secret']),
  true
)
assert.equal(bearerAuthorized(null, ['agenda-secret']), false)

console.log('zones-api.selftest: ok')
