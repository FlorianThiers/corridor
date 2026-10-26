import type { User } from '@/types'

export type MediaSource = 'florian' | 'upload' | 'corristories'

const FLORIAN_CREDIT = 'foto: Florian Thiers'

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

export function resolveZonePhotoCredit(
  photo: ZonePhotoCreditInput,
  submitter: Pick<User, 'full_name' | 'email'> | null | undefined
): ResolvedMediaCredit {
  const explicitSource = parseMediaSource(photo.media_source)
  const explicitCredit = photo.credit ?? null
  const explicitArtist = photo.artist_tag ?? null
  const explicitAlt = photo.alt ?? photo.caption ?? null
  const explicitPeople = photo.has_recognisable_people

  if (explicitSource) {
    return {
      source: explicitSource,
      credit:
        explicitCredit ??
        (explicitSource === 'florian' ? FLORIAN_CREDIT : null),
      artist_tag: explicitArtist,
      alt: explicitAlt,
      has_recognisable_people: explicitPeople ?? true,
      uploader_name:
        explicitSource === 'upload'
          ? (submitter?.full_name?.trim() || null)
          : null,
    }
  }

  if (isUgcPath(photo.storage_path)) {
    return {
      source: 'upload',
      credit: explicitCredit,
      artist_tag: explicitArtist,
      alt: explicitAlt,
      has_recognisable_people: explicitPeople ?? true,
      uploader_name: submitter?.full_name?.trim() || null,
    }
  }

  if (isAdminGalleryPath(photo.storage_path) && isFlorianProfile(submitter)) {
    return {
      source: 'florian',
      credit: explicitCredit ?? FLORIAN_CREDIT,
      artist_tag: explicitArtist,
      alt: explicitAlt,
      has_recognisable_people: explicitPeople ?? true,
      uploader_name: null,
    }
  }

  if (isAdminGalleryPath(photo.storage_path)) {
    return {
      source: 'corristories',
      credit: explicitCredit,
      artist_tag: explicitArtist,
      alt: explicitAlt,
      has_recognisable_people: explicitPeople ?? true,
      uploader_name: null,
    }
  }

  return {
    source: 'upload',
    credit: explicitCredit,
    artist_tag: explicitArtist,
    alt: explicitAlt,
    has_recognisable_people: explicitPeople ?? true,
    uploader_name: submitter?.full_name?.trim() || null,
  }
}

export function defaultHistoryCredit(caption?: string | null): string | null {
  if (!caption?.trim()) return null
  const trimmed = caption.trim()
  if (trimmed.length > 80) return null
  return trimmed
}
