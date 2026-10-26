import assert from 'node:assert/strict'

import { resolveZonePhotoCredit } from './media-credit'

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
assert.equal(ugc.credit, null)
assert.equal(ugc.has_recognisable_people, true)

const adminFlorian = resolveZonePhotoCredit(
  {
    storage_path: 'zone/abc/approved/123.jpg',
  },
  florian
)
assert.equal(adminFlorian.source, 'florian')
assert.equal(adminFlorian.credit, 'foto: Florian Thiers')

const legacy = resolveZonePhotoCredit(
  {
    storage_path: 'zone/abc/approved/old-chat.jpg',
  },
  null
)
assert.equal(legacy.source, 'corristories')

console.log('media-credit.selftest: ok')
