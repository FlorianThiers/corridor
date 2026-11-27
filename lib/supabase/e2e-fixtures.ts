/**
 * Vaste fixture-data voor Playwright. Geen echte accounts, keys of productie-URL's.
 * Datums hangen aan de lokale kalendermaand zodat de agenda-lijst en de kalender
 * dezelfde maand tonen als de server (TZ=Europe/Brussels in de e2e-run).
 */

export const E2E_USER_ID = '11111111-1111-4111-8111-111111111111'
export const E2E_EMAIL = 'e2e@example.com'
export const E2E_PASSWORD = 'mock-only'

export const E2E_ZONE_SKATE_ID = '10000000-0000-4000-8000-000000000001'
export const E2E_ZONE_FEST_ID = '10000000-0000-4000-8000-000000000010'

export const E2E_PHOTO_SKATE_ID = '20000000-0000-4000-8000-000000000001'
export const E2E_PHOTO_FEST_ID = '20000000-0000-4000-8000-000000000010'

export const E2E_CREDIT_PHOTOGRAPHER = 'foto: Florian Thiers'
export const E2E_CREDIT_ARTIST = 'Sofie D.'

export const E2E_AGENDA = {
  basketbal: { title: 'E2E Basketbaltraining', day: 8, sportLabel: 'Basketbal' },
  wandelvoetbal: { title: 'E2E Wandelvoetbal', day: 12, sportLabel: 'Wandelvoetbal' },
  fest: { title: "Corri d'Or Fest — e2e highlight", day: 20 },
  nextMonth: { title: 'E2E Skate volgende maand', day: 3 },
} as const

export const E2E_ZONES = {
  skate: {
    number: 1,
    name: 'Skatezone',
    caption: 'Skatebaan in de avond',
  },
  fest: {
    number: 16,
    name: "Corri d'Or fest",
    caption: 'Fest podium',
  },
} as const

function isoLocal(year: number, monthIndex: number, day: number, hour = 18): string {
  return new Date(year, monthIndex, day, hour, 0, 0, 0).toISOString()
}

export function buildE2ETables(now = new Date()) {
  const year = now.getFullYear()
  const month = now.getMonth()
  const nextMonthDate = new Date(year, month + 1, E2E_AGENDA.nextMonth.day, 18, 0, 0, 0)

  const zones = [
    {
      id: E2E_ZONE_SKATE_ID,
      zone_number: E2E_ZONES.skate.number,
      name: E2E_ZONES.skate.name,
      slug: 'skatezone',
      description: 'Overdekte skatezone onder het viaduct.',
      cover_url: '/favicon.webp',
      field_labels: ['Skate'],
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-06-01T00:00:00.000Z',
    },
    {
      id: E2E_ZONE_FEST_ID,
      zone_number: E2E_ZONES.fest.number,
      name: E2E_ZONES.fest.name,
      slug: 'corri-dor-fest',
      description: 'Archiefzone voor festfoto’s.',
      cover_url: '/favicon.webp',
      field_labels: ['Fest'],
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-09-26T00:00:00.000Z',
    },
  ]

  const zonePhotos = [
    {
      id: E2E_PHOTO_SKATE_ID,
      zone_id: E2E_ZONE_SKATE_ID,
      storage_path: 'zone-photos/1/approved/skate.webp',
      public_url: '/favicon.webp',
      caption: E2E_ZONES.skate.caption,
      credit: E2E_CREDIT_PHOTOGRAPHER,
      artist_tag: E2E_CREDIT_ARTIST,
      media_source: 'florian',
      alt: E2E_ZONES.skate.caption,
      status: 'approved',
      submitted_by: null,
      width: 64,
      height: 64,
      license: null,
      has_recognisable_people: false,
      created_at: '2026-08-01T12:00:00.000Z',
      updated_at: '2026-08-02T12:00:00.000Z',
    },
    {
      id: '20000000-0000-4000-8000-000000000099',
      zone_id: E2E_ZONE_SKATE_ID,
      storage_path: 'zone-photos/1/ugc/pending.webp',
      public_url: '/favicon.webp',
      caption: 'Deze foto wacht op moderatie',
      credit: null,
      artist_tag: null,
      media_source: 'upload',
      status: 'pending',
      submitted_by: E2E_USER_ID,
      width: 64,
      height: 64,
      license: null,
      has_recognisable_people: true,
      created_at: '2026-08-03T12:00:00.000Z',
      updated_at: '2026-08-03T12:00:00.000Z',
    },
    {
      id: E2E_PHOTO_FEST_ID,
      zone_id: E2E_ZONE_FEST_ID,
      storage_path: 'zone-photos/16/approved/podium.webp',
      public_url: '/favicon.webp',
      caption: E2E_ZONES.fest.caption,
      credit: E2E_CREDIT_PHOTOGRAPHER,
      artist_tag: null,
      media_source: 'florian',
      alt: E2E_ZONES.fest.caption,
      status: 'approved',
      submitted_by: null,
      width: 64,
      height: 64,
      license: null,
      has_recognisable_people: false,
      created_at: '2026-09-26T15:00:00.000Z',
      updated_at: '2026-09-26T16:00:00.000Z',
    },
  ]

  const evenementen = [
    {
      id: '30000000-0000-4000-8000-000000000001',
      title: E2E_AGENDA.basketbal.title,
      description: 'Training in de skatezone.',
      start_datetime: isoLocal(year, month, E2E_AGENDA.basketbal.day),
      end_datetime: isoLocal(year, month, E2E_AGENDA.basketbal.day, 19),
      zone_id: E2E_ZONE_SKATE_ID,
      for_girls: false,
      kind: 'activiteit',
      sport_slug: 'basketbal',
      is_highlight: false,
    },
    {
      id: '30000000-0000-4000-8000-000000000002',
      title: E2E_AGENDA.wandelvoetbal.title,
      description: 'Wekelijkse wandelvoetbal.',
      start_datetime: isoLocal(year, month, E2E_AGENDA.wandelvoetbal.day),
      end_datetime: isoLocal(year, month, E2E_AGENDA.wandelvoetbal.day, 19),
      zone_id: E2E_ZONE_SKATE_ID,
      for_girls: false,
      kind: 'activiteit',
      sport_slug: 'wandelvoetbal',
      is_highlight: false,
    },
    {
      id: '30000000-0000-4000-8000-000000000003',
      title: E2E_AGENDA.fest.title,
      description: 'Highlight in de agenda.',
      start_datetime: isoLocal(year, month, E2E_AGENDA.fest.day, 14),
      end_datetime: isoLocal(year, month, E2E_AGENDA.fest.day, 22),
      zone_id: E2E_ZONE_FEST_ID,
      for_girls: false,
      kind: 'evenement',
      sport_slug: null,
      is_highlight: true,
    },
    {
      id: '30000000-0000-4000-8000-000000000004',
      title: E2E_AGENDA.nextMonth.title,
      description: 'Staat in de volgende kalendermaand.',
      start_datetime: nextMonthDate.toISOString(),
      end_datetime: new Date(nextMonthDate.getTime() + 60 * 60 * 1000).toISOString(),
      zone_id: E2E_ZONE_SKATE_ID,
      for_girls: false,
      kind: 'activiteit',
      sport_slug: 'skate',
      is_highlight: false,
    },
  ]

  const users = [
    {
      id: E2E_USER_ID,
      email: E2E_EMAIL,
      full_name: 'E2E Bezoeker',
      role: 'user',
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    },
  ]

  return {
    zones,
    zone_photos: zonePhotos,
    evenementen,
    users,
    history_photos: [] as Record<string, unknown>[],
    history_milestones: [] as Record<string, unknown>[],
  }
}

export type E2ETables = ReturnType<typeof buildE2ETables>
