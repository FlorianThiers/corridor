import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { zoneGalleryAlt } from './zone-gallery'
import { historyPhotos, historyPhotoAlt } from './geschiedenis'

const root = process.cwd()

const credited = zoneGalleryAlt(
  {
    id: 'photo-1',
    public_url: 'https://example.test/skate.jpg',
    caption: 'Skate trick',
    storage_path: 'zone/abc/ugc/user/1.jpg',
    credit: 'Sam',
    artist_tag: 'NOODLES',
  },
  'Hilles'
)
assert.match(credited, /Skate trick/)
assert.match(credited, /foto: Sam/)
assert.match(credited, /kunstenaar: NOODLES/)

const cover = zoneGalleryAlt(
  { id: 'cover', public_url: 'https://example.test/cover.jpg', caption: 'Cover' },
  'Hilles'
)
assert.equal(cover, 'Coverfoto Hilles')
assert.equal(cover.includes('foto:'), false)

const named = zoneGalleryAlt(
  {
    id: 'photo-2',
    public_url: 'https://example.test/b.jpg',
    caption: 'Portret door Frakkie',
    storage_path: 'zone/abc/approved/2.jpg',
    credit: 'Frakkie',
    artist_tag: 'Frakkie',
  },
  'Pilaar'
)
assert.equal(named.includes('kunstenaar:'), false)
assert.match(named, /Frakkie/)

const sofie = historyPhotos.find((photo) => photo.credit === 'Sofie D.')
assert.ok(sofie)
assert.match(historyPhotoAlt(sofie), /Sofie D\./)

const zonesPage = readFileSync(join(root, 'app/zones/page.tsx'), 'utf8')
const zoneDetail = readFileSync(join(root, 'app/zones/[zoneNumber]/page.tsx'), 'utf8')
const festPage = readFileSync(join(root, 'app/corridorfest/page.tsx'), 'utf8')
const gallery = readFileSync(join(root, 'components/ZonePhotoGallery.tsx'), 'utf8')
const photosRoute = readFileSync(join(root, 'app/api/zones/[zoneNumber]/photos/route.ts'), 'utf8')
const geschiedenis = readFileSync(join(root, 'components/HistoryPhotoCard.tsx'), 'utf8')

assert.match(zonesPage, /<h1/)
assert.match(zonesPage, /ZoneCard/)
assert.match(zoneDetail, /storage_path: p\.storage_path/)
assert.match(zoneDetail, /credit: p\.credit/)
assert.match(zoneDetail, /artist_tag: p\.artist_tag/)
assert.match(festPage, /zoneGalleryAlt/)
assert.match(gallery, /zoneGalleryAlt\(item, zoneName\)/)
assert.match(photosRoute, /artist_tag: p\.artist_tag/)
assert.match(photosRoute, /credit: p\.credit/)
assert.match(geschiedenis, /historyPhotoAlt/)

console.log('zones-media-pages.selftest: ok')
