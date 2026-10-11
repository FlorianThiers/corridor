import { BRAND_FEST_EDITION_2026 } from '@/lib/brand'

/** Brussels — fest-weekend + buffer (legacy datum-galerij; fest gebruikt zone-archief). */
export const FEST_2026_GALLERY_FROM = '2026-09-24T00:00:00+02:00'
export const FEST_2026_GALLERY_TO = '2026-10-15T00:00:00+02:00'

/** Volledige fest-fotogalerij (Matty: zone “Corri d’Or fest”). */
export const FEST_ARCHIVE_ZONE_NUMBER = 16

/** Aantal thumbs op /corridorfest; rest via /zones/{FEST_ARCHIVE_ZONE_NUMBER}. */
export const FEST_GALLERY_TEASER_LIMIT = 12

export const FEST_2026_DATES_LABEL = '25 & 26 september 2026'
export const FEST_2026_LOCATION = 'Driebeekstraat, Gentbrugge'

export const FEST_2026_INTRO = [
  `${BRAND_FEST_EDITION_2026} bracht twee dagen sport, muziek, buurt en urban cultuur samen onder en rond het E17-viaduct.`,
  'Dankzij clubs, vrijwilligers, buurtpartners en bezoekers werd Corridor opnieuw een ontmoetingsplek voor heel Gentbrugge.',
  'Op deze pagina vind je het programma, de affiches en een selectie foto’s. De volledige galerij staat op zone 16 — upload nieuwe beelden daar of via het formulier hieronder.',
] as const
