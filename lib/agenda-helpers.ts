import type { Evenement, EvenementKind } from '@/types'
import { resolveSportSlug, type SportSlug } from '@/lib/sports'

export const EVENEMENT_KIND_LABELS: Record<EvenementKind, string> = {
  evenement: 'Evenement',
  activiteit: 'Activiteit',
}

export function isEvenementKind(kind?: EvenementKind | null): boolean {
  return (kind ?? 'evenement') === 'evenement'
}

export function isActiviteitKind(kind?: EvenementKind | null): boolean {
  return kind === 'activiteit'
}

export function splitByKind(items: Evenement[]) {
  const evenementen: Evenement[] = []
  const activiteiten: Evenement[] = []

  for (const item of items) {
    if (isActiviteitKind(item.kind)) {
      activiteiten.push(item)
    } else {
      evenementen.push(item)
    }
  }

  return { evenementen, activiteiten }
}

export interface GroupedActiviteit {
  key: string
  title: string
  description?: string
  zoneName?: string
  sportSlug?: SportSlug
  nextOccurrence?: Evenement
  upcomingCount: number
}

/** Eén kaart per activiteitstype i.p.v. tientallen identieke week-slots */
export function groupActiviteiten(items: Evenement[], now = new Date()): GroupedActiviteit[] {
  const upcoming = items
    .filter((item) => new Date(item.start_datetime) >= now)
    .sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime())

  const groups = new Map<string, GroupedActiviteit>()

  for (const item of upcoming) {
    const sportSlug = resolveSportSlug(item.sport_slug, item.title)
    const key = `${sportSlug ?? item.title}::${item.description ?? ''}`
    const existing = groups.get(key)

    if (!existing) {
      groups.set(key, {
        key,
        title: item.title,
        description: item.description,
        zoneName: item.zones?.name,
        sportSlug,
        nextOccurrence: item,
        upcomingCount: 1,
      })
      continue
    }

    existing.upcomingCount += 1
    if (!existing.zoneName && item.zones?.name) {
      existing.zoneName = item.zones.name
    }
  }

  return Array.from(groups.values()).sort((a, b) => {
    if (!a.nextOccurrence || !b.nextOccurrence) return 0
    return new Date(a.nextOccurrence.start_datetime).getTime() - new Date(b.nextOccurrence.start_datetime).getTime()
  })
}
