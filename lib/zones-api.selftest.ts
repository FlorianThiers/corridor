import assert from 'node:assert/strict'

import { toZoneSpot } from './zones-api'

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

console.log('zones-api.selftest: ok')
