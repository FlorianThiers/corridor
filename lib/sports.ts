export const SPORT_SLUGS = [
  'wandelvoetbal',
  'corribar',
  'basketbal',
  'sportkar',
  'skate',
  'corrihop',
  'dans',
] as const

export type SportSlug = (typeof SPORT_SLUGS)[number]

export interface SportDefinition {
  slug: SportSlug
  label: string
  /** Kortere weergave in het weekrooster */
  scheduleLabel?: string
  dotClass: string
  badgeClass: string
  borderClass: string
}

export const SPORT_DEFINITIONS: Record<SportSlug, SportDefinition> = {
  wandelvoetbal: {
    slug: 'wandelvoetbal',
    label: 'Wandelvoetbal',
    scheduleLabel: 'Wandel voetbal',
    dotClass: 'bg-emerald-500',
    badgeClass: 'bg-emerald-100 text-emerald-800',
    borderClass: 'border-emerald-500',
  },
  corribar: {
    slug: 'corribar',
    label: 'Corribar',
    dotClass: 'bg-orange-500',
    badgeClass: 'bg-orange-100 text-orange-800',
    borderClass: 'border-orange-500',
  },
  basketbal: {
    slug: 'basketbal',
    label: 'Basketbal',
    dotClass: 'bg-red-500',
    badgeClass: 'bg-red-100 text-red-800',
    borderClass: 'border-red-500',
  },
  sportkar: {
    slug: 'sportkar',
    label: 'Sportkar',
    dotClass: 'bg-blue-500',
    badgeClass: 'bg-blue-100 text-blue-800',
    borderClass: 'border-blue-500',
  },
  skate: {
    slug: 'skate',
    label: 'Skate',
    dotClass: 'bg-violet-500',
    badgeClass: 'bg-violet-100 text-violet-800',
    borderClass: 'border-violet-500',
  },
  corrihop: {
    slug: 'corrihop',
    label: 'Corrihop',
    dotClass: 'bg-pink-500',
    badgeClass: 'bg-pink-100 text-pink-800',
    borderClass: 'border-pink-500',
  },
  dans: {
    slug: 'dans',
    label: 'Dans',
    dotClass: 'bg-fuchsia-500',
    badgeClass: 'bg-fuchsia-100 text-fuchsia-800',
    borderClass: 'border-fuchsia-500',
  },
}

const TITLE_TO_SLUG: Record<string, SportSlug> = {
  wandelvoetbal: 'wandelvoetbal',
  corribar: 'corribar',
  basketbal: 'basketbal',
  sportkar: 'sportkar',
  skate: 'skate',
  corrihop: 'corrihop',
  dans: 'dans',
  danslessen: 'dans',
}

export function isSportSlug(value: string | null | undefined): value is SportSlug {
  return Boolean(value && SPORT_SLUGS.includes(value as SportSlug))
}

export function inferSportSlugFromTitle(title: string): SportSlug | undefined {
  const normalized = title.trim().toLowerCase()
  for (const [prefix, slug] of Object.entries(TITLE_TO_SLUG)) {
    if (normalized.startsWith(prefix)) return slug
  }
  return undefined
}

export function resolveSportSlug(
  sportSlug?: string | null,
  title?: string
): SportSlug | undefined {
  if (isSportSlug(sportSlug)) return sportSlug
  if (title) return inferSportSlugFromTitle(title)
  return undefined
}

export function getSportDefinition(
  sportSlug?: string | null,
  title?: string
): SportDefinition | undefined {
  const slug = resolveSportSlug(sportSlug, title)
  return slug ? SPORT_DEFINITIONS[slug] : undefined
}

export function getScheduleLabel(
  sportSlug?: string | null,
  title?: string
): string {
  const def = getSportDefinition(sportSlug, title)
  if (!def) return title ?? ''
  return def.scheduleLabel ?? def.label
}

export const SPORT_OPTIONS = SPORT_SLUGS.map((slug) => SPORT_DEFINITIONS[slug])
