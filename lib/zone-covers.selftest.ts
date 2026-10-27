import assert from 'node:assert/strict'

import { resolveZoneCoverUrl } from './zone-covers'

const pending = new Set(['https://cdn.example/pending.jpg'])

assert.equal(
  resolveZoneCoverUrl({
    coverUrl: '/zones/hilles-cover.webp',
    unapprovedUrls: pending,
  }),
  '/zones/hilles-cover.webp'
)

assert.equal(
  resolveZoneCoverUrl({
    coverUrl: 'https://cdn.example/pending.jpg',
    approvedFallbackUrl: 'https://cdn.example/approved.jpg',
    unapprovedUrls: pending,
  }),
  'https://cdn.example/approved.jpg'
)

assert.equal(
  resolveZoneCoverUrl({
    coverUrl: 'https://cdn.example/admin-cover.jpg',
    unapprovedUrls: pending,
  }),
  'https://cdn.example/admin-cover.jpg'
)

assert.equal(
  resolveZoneCoverUrl({
    coverUrl: 'https://cdn.example/admin-cover.jpg',
    unapprovedUrls: null,
  }),
  null
)

console.log('zone-covers.selftest: ok')
