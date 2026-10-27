import assert from 'node:assert/strict'

import { canonicalMediaId, parseStableMediaId } from './media-ids'

const photo = '3f1a0c2e-4b5d-4e6f-8a7b-9c0d1e2f3a4b'
assert.deepEqual(parseStableMediaId(photo), { kind: 'photo', id: photo })
assert.deepEqual(parseStableMediaId(photo.toUpperCase()), { kind: 'photo', id: photo })
assert.deepEqual(parseStableMediaId('geschiedenis-06-graffiti-clown-sofie-d'), {
  kind: 'history',
  id: 'geschiedenis-06-graffiti-clown-sofie-d',
})
assert.deepEqual(parseStableMediaId(`zone-cover-${photo}`), {
  kind: 'cover',
  zoneId: photo,
})
assert.equal(canonicalMediaId(`ZONE-COVER-${photo.toUpperCase()}`), `zone-cover-${photo}`)
assert.equal(parseStableMediaId('../etc/passwd'), null)
assert.equal(parseStableMediaId('zone-cover-not-a-uuid'), null)

console.log('media-ids.selftest: ok')
