import assert from 'node:assert/strict'

import { isMediaApiAuthorized, isMediaWriteAuthorized } from './media-api-auth'

const previous = {
  media: process.env.CORRIDOR_MEDIA_API_KEY,
  agenda: process.env.CORRIDOR_AGENDA_API_KEY,
  write: process.env.CORRIDOR_MEDIA_WRITE_API_KEY,
}

function request(authorization: string | null) {
  return { headers: { get: () => authorization } }
}

function restore(name: string, value: string | undefined) {
  if (value === undefined) delete process.env[name]
  else process.env[name] = value
}

try {
  process.env.CORRIDOR_MEDIA_API_KEY = 'read-key'
  process.env.CORRIDOR_AGENDA_API_KEY = 'agenda-key'
  process.env.CORRIDOR_MEDIA_WRITE_API_KEY = 'write-key'

  assert.equal(isMediaApiAuthorized(request('Bearer read-key')), true)
  assert.equal(isMediaApiAuthorized(request('Bearer agenda-key')), true)
  assert.equal(isMediaApiAuthorized(request('Bearer write-key')), false)
  assert.equal(isMediaApiAuthorized(request(null)), false)

  assert.equal(isMediaWriteAuthorized(request('Bearer write-key')), true)
  assert.equal(isMediaWriteAuthorized(request('Bearer read-key')), false)
  assert.equal(isMediaWriteAuthorized(request('Bearer agenda-key')), false)

  process.env.CORRIDOR_MEDIA_WRITE_API_KEY = 'read-key'
  assert.equal(isMediaWriteAuthorized(request('Bearer read-key')), false)
} finally {
  restore('CORRIDOR_MEDIA_API_KEY', previous.media)
  restore('CORRIDOR_AGENDA_API_KEY', previous.agenda)
  restore('CORRIDOR_MEDIA_WRITE_API_KEY', previous.write)
}

console.log('media-api-auth.selftest: ok')
