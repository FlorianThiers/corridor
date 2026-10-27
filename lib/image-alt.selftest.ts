import assert from 'node:assert/strict'

import { altWithCredits } from './image-alt'
import { contrastRatio, compositeHex, WCAG_AA_TEXT } from './contrast'
import { historyPhotoAlt } from './geschiedenis'

assert.equal(altWithCredits('Skate trick'), 'Skate trick')
assert.equal(altWithCredits('   '), 'Foto')

assert.equal(
  altWithCredits('Skate trick', { photographer: 'Sam', artist: 'NOODLES' }),
  'Skate trick — kunstenaar: NOODLES, foto: Sam'
)

assert.equal(
  altWithCredits('Muurschildering door Sofie D.', { artist: 'Sofie D.' }),
  'Muurschildering door Sofie D.'
)

assert.equal(
  altWithCredits('Pilaar', { photographer: 'foto: Florian Thiers' }),
  'Pilaar — foto: Florian Thiers'
)

assert.equal(
  altWithCredits('Tag', { photographer: 'NOODLES', artist: 'NOODLES' }),
  'Tag — kunstenaar: NOODLES'
)

const sofie = historyPhotoAlt({
  alt: 'Muurschildering van een clown met hond door Sofie D.',
  credit: 'Sofie D.',
})
assert.match(sofie, /Sofie D\./)
assert.equal(sofie.includes('kunstenaar:'), false)

const added = historyPhotoAlt({ alt: 'Muurschildering met vogel', credit: 'Frakkie' })
assert.match(added, /kunstenaar: Frakkie/)

const onWhite = compositeHex('#000000', '#ffffff', 0.6)
assert.ok(contrastRatio('#ffffff', onWhite) >= WCAG_AA_TEXT)
const footer = compositeHex('#000000', '#ffffff', 0.7)
assert.ok(contrastRatio('#ffffff', footer) >= WCAG_AA_TEXT)
assert.ok(contrastRatio('#ffffff', '#db2777') >= WCAG_AA_TEXT)
assert.ok(contrastRatio('#ffffff', '#ec4899') < WCAG_AA_TEXT)

console.log('image-alt.selftest: ok')
