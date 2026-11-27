import assert from 'node:assert/strict'

import { parseCreditWriteBody } from './media-credit-write'

assert.deepEqual(parseCreditWriteBody({ credit: '  Sam  ' }), { ok: true, credit: 'Sam' })
assert.deepEqual(parseCreditWriteBody({ credit: null }), { ok: true, credit: null })

const extra = parseCreditWriteBody({ credit: 'Sam', artist_tag: 'nope' })
assert.equal(extra.ok, false)

const empty = parseCreditWriteBody({ credit: '   ' })
assert.equal(empty.ok, false)

const missing = parseCreditWriteBody({})
assert.equal(missing.ok, false)

const array = parseCreditWriteBody(['Sam'])
assert.equal(array.ok, false)

console.log('media-credit-write.selftest: ok')
