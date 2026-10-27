import type { User } from '@/types'

export type MediaSource = 'florian' | 'upload' | 'corristories'

export const CORRISTORIES_DEFAULT_CREDIT = 'Corridor'
const FLORIAN_NAME = 'Florian Thiers'

export type ZonePhotoCreditInput = {
  storage_path: string
  caption?: string | null
  submitted_by?: string | null
  media_source?: string | null
  credit?: string | null
  artist_tag?: string | null
  alt?: string | null
  has_recognisable_people?: boolean | null
}

export type ResolvedMediaCredit = {
  source: MediaSource
  credit: string | null
  artist_tag: string | null
  alt: string | null
  has_recognisable_people: boolean
  uploader_name: string | null
}

export type CreditOverrideFields = {
  credit: string
  updated_at: string
}

function isUgcPath(storagePath: string): boolean {
  return storagePath.includes('/ugc/')
}

function isAdminGalleryPath(storagePath: string): boolean {
  return storagePath.includes('/approved/') || storagePath.includes('/cover-')
}

function isFlorianProfile(profile: Pick<User, 'full_name' | 'email'> | null | undefined): boolean {
  if (!profile) return false
  const name = (profile.full_name || '').trim().toLowerCase()
  if (name === 'florian thiers') return true
  const email = (profile.email || '').trim().toLowerCase()
  return email.includes('florian') && email.includes('thiers')
}

function parseMediaSource(value: string | null | undefined): MediaSource | null {
  if (value === 'florian' || value === 'upload' || value === 'corristories') {
    return value
  }
  return null
}

function uploaderName(
  submitter: Pick<User, 'full_name' | 'email'> | null | undefined
): string | null {
  return submitter?.full_name?.trim() || null
}

/**
 * Credit until Urban Culture overwrites it.
 * Older Corristories photos stay "Corridor". Everything else uses the upload user.
 * An explicit credit on the row (for example a graffiti signature) is kept.
 */
export function fallbackCredit(
  source: MediaSource,
  submitter: Pick<User, 'full_name'> | null | undefined,
  explicit?: string | null
): string | null {
  const trimmed = explicit?.trim()
  if (trimmed) return trimmed
  if (source === 'corristories') return CORRISTORIES_DEFAULT_CREDIT
  const name = submitter?.full_name?.trim()
  if (name) return name
  if (source === 'florian') return FLORIAN_NAME
  return null
}

export function resolveZonePhotoCredit(
  photo: ZonePhotoCreditInput,
  submitter: Pick<User, 'full_name' | 'email'> | null | undefined
): ResolvedMediaCredit {
  const explicitSource = parseMediaSource(photo.media_source)
  const explicitArtist = photo.artist_tag ?? null
  const explicitAlt = photo.alt ?? photo.caption ?? null
  const explicitPeople = photo.has_recognisable_people

  let source: MediaSource
  if (explicitSource) {
    source = explicitSource
  } else if (isUgcPath(photo.storage_path)) {
    source = 'upload'
  } else if (isAdminGalleryPath(photo.storage_path) && isFlorianProfile(submitter)) {
    source = 'florian'
  } else if (isAdminGalleryPath(photo.storage_path)) {
    source = 'corristories'
  } else {
    source = 'upload'
  }

  return {
    source,
    credit: fallbackCredit(source, submitter, photo.credit),
    artist_tag: explicitArtist,
    alt: explicitAlt,
    has_recognisable_people: explicitPeople ?? true,
    uploader_name: source === 'corristories' ? null : uploaderName(submitter),
  }
}

export function applyCreditOverride<T extends { credit: string | null; updated_at: string }>(
  item: T,
  override: CreditOverrideFields | undefined
): T {
  if (!override) return item
  const itemMs = Date.parse(item.updated_at)
  const overrideMs = Date.parse(override.updated_at)
  const updated_at =
    Number.isFinite(overrideMs) && (!Number.isFinite(itemMs) || overrideMs > itemMs)
      ? override.updated_at
      : item.updated_at
  return { ...item, credit: override.credit, updated_at }
}
