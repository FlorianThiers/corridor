import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { groupActiviteiten, splitByKind } from './agenda-helpers'
import { parseAgendaQuery, toAgendaResponse } from './agenda-api'
import type { Evenement } from '../types'

const root = process.cwd()

const query = parseAgendaQuery(
  new URLSearchParams('kind=nope&sport=skate&from=2026-06-01&to=2026-06-30&updated_since=2026-01-01')
)
assert.equal(query.kind, undefined)
assert.equal(query.sport, 'skate')
assert.equal(query.from, '2026-06-01')
assert.equal(query.to, '2026-06-30')
assert.equal(query.updatedSince, '2026-01-01')

const invalidSport = parseAgendaQuery(new URLSearchParams('sport=schaken&kind=activiteit'))
assert.equal(invalidSport.sport, undefined)
assert.equal(invalidSport.kind, 'activiteit')

function item(partial: Partial<Evenement> & Pick<Evenement, 'id' | 'title' | 'start_datetime'>): Evenement {
  return partial
}

const now = new Date('2026-06-15T12:00:00.000Z')
const slots = [
  item({
    id: 'a',
    title: 'Skate',
    kind: 'activiteit',
    sport_slug: 'skate',
    start_datetime: '2026-06-16T16:00:00.000Z',
    description: 'Weekslot',
  }),
  item({
    id: 'b',
    title: 'Skate',
    kind: 'activiteit',
    sport_slug: 'skate',
    start_datetime: '2026-06-23T16:00:00.000Z',
    description: 'Weekslot',
  }),
  item({
    id: 'c',
    title: 'Fest',
    kind: 'evenement',
    start_datetime: '2026-06-20T18:00:00.000Z',
  }),
]

const split = splitByKind(slots)
assert.equal(split.activiteiten.length, 2)
assert.equal(split.evenementen.length, 1)

const grouped = groupActiviteiten(split.activiteiten, { now, direction: 'upcoming' })
assert.equal(grouped.length, 1)
assert.equal(grouped[0]?.occurrenceCount, 2)
assert.equal(grouped[0]?.title, 'Skate')

const past = groupActiviteiten(
  [
    item({
      id: 'old',
      title: 'Dans',
      kind: 'activiteit',
      sport_slug: 'dans',
      start_datetime: '2026-06-01T16:00:00.000Z',
    }),
  ],
  { now, direction: 'upcoming' }
)
assert.equal(past.length, 0)

const response = toAgendaResponse(slots)
assert.equal(response.items.length, 3)
assert.equal(response.items[0]?.sport_slug ?? null, 'skate')
assert.ok(Array.isArray(response.sports))
assert.ok(response.sports.some((sport) => sport.slug === 'skate'))

const agendaPage = readFileSync(join(root, 'app/agenda/page.tsx'), 'utf8')
const calendar = readFileSync(join(root, 'components/Calendar.tsx'), 'utf8')
const filter = readFileSync(join(root, 'components/SportFilter.tsx'), 'utf8')
const layout = readFileSync(join(root, 'app/layout.tsx'), 'utf8')
const nav = readFileSync(join(root, 'components/Navigation.tsx'), 'utf8')

assert.match(agendaPage, /<PageTitle>Agenda<\/PageTitle>/)
assert.match(agendaPage, /<Calendar/)
assert.match(agendaPage, /<SportFilter/)
assert.match(calendar, /aria-label="Vorige maand"/)
assert.match(calendar, /aria-label="Volgende maand"/)
assert.match(calendar, /aria-pressed/)
assert.match(calendar, /ArrowRight/)
assert.match(filter, /aria-label="Filter op sport"/)
assert.match(filter, /<nav/)
assert.match(layout, /<main id="inhoud"/)
assert.match(nav, /className="skip-link"/)
assert.match(nav, /href="#inhoud"/)
assert.match(nav, /Ga naar de inhoud/)

console.log('agenda-public.selftest: ok')
