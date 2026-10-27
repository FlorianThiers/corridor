import assert from 'node:assert/strict'

import { applyCreditOverride, resolveZonePhotoCredit } from './media-credit'

const florian = { full_name: 'Florian Thiers', email: 'florian@example.com' }
const neighbor = { full_name: 'Buurtbewoner', email: 'buurt@example.com' }

const ugc = resolveZonePhotoCredit(
  {
    storage_path: 'zone/abc/ugc/user-1/123.jpg',
    caption: 'Skate trick',
  },
  neighbor
)
assert.equal(ugc.source, 'upload')
assert.equal(ugc.uploader_name, 'Buurtbewoner')
assert.equal(ugc.credit, 'Buurtbewoner')
assert.equal(ugc.has_recognisable_people, true)
assert.equal(ugc.artist_tag, null)

const adminFlorian = resolveZonePhotoCredit(
  {
    storage_path: 'zone/abc/approved/123.jpg',
  },
  florian
)
assert.equal(adminFlorian.source, 'florian')
assert.equal(adminFlorian.credit, 'Florian Thiers')

const legacy = resolveZonePhotoCredit(
  {
    storage_path: 'zone/abc/approved/old-chat.jpg',
  },
  null
)
assert.equal(legacy.source, 'corristories')
assert.equal(legacy.credit, 'Corridor')
assert.equal(legacy.uploader_name, null)

const signed = resolveZonePhotoCredit(
  {
    storage_path: 'zone/abc/approved/wall.jpg',
    credit: 'Sofie D.',
    artist_tag: 'Sofie D.',
    has_recognisable_people: false,
  },
  null
)
assert.equal(signed.credit, 'Sofie D.')
assert.equal(signed.artist_tag, 'Sofie D.')
assert.equal(signed.has_recognisable_people, false)

const overridden = applyCreditOverride(
  {
    credit: 'Corridor',
    updated_at: '2020-01-01T00:00:00.000Z',
  },
  { credit: 'Sam', updated_at: '2026-10-27T08:00:00.000Z' }
)
assert.equal(overridden.credit, 'Sam')
assert.equal(overridden.updated_at, '2026-10-27T08:00:00.000Z')

console.log('media-credit.selftest: ok')
