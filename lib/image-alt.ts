/**
 * Alt-tekst met fotograaf- en kunstenaarcredit (WCAG 1.1.1).
 * De credit komt alleen in de alt als die nog niet in de beschrijving staat.
 */

function clean(value?: string | null): string {
  return (value ?? '').replace(/\s+/g, ' ').trim()
}

function stripRolePrefix(value: string): string {
  return value.replace(/^(foto|fotograaf|kunstenaar|artist)\s*:\s*/i, '').trim()
}

function alreadyMentions(description: string, credit: string): boolean {
  const haystack = description.toLowerCase()
  const raw = credit.toLowerCase()
  const bare = stripRolePrefix(credit).toLowerCase()
  if (!bare) return true
  return haystack.includes(raw) || haystack.includes(bare)
}

export function altWithCredits(
  description: string,
  credits?: {
    photographer?: string | null
    artist?: string | null
  }
): string {
  const base = clean(description) || 'Foto'
  const artist = clean(credits?.artist)
  const photographer = clean(credits?.photographer)
  const parts: string[] = []

  if (artist && !alreadyMentions(base, artist)) {
    parts.push(`kunstenaar: ${stripRolePrefix(artist)}`)
  }

  const artistBare = artist ? stripRolePrefix(artist).toLowerCase() : ''
  const photographerBare = photographer ? stripRolePrefix(photographer).toLowerCase() : ''
  if (
    photographer &&
    photographerBare !== artistBare &&
    !alreadyMentions(base, photographer) &&
    !alreadyMentions(parts.join(' '), photographer)
  ) {
    const labelled = /^foto\s*:/i.test(photographer)
      ? photographer
      : `foto: ${stripRolePrefix(photographer)}`
    parts.push(labelled)
  }

  if (parts.length === 0) return base
  return `${base} — ${parts.join(', ')}`
}
