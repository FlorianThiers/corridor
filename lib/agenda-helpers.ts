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
  /** Meest recente (komend) of laatste (afgelopen) slot in de groep */
  nextOccurrence?: Evenement
  occurrenceCount: number
}

export type GroupActiviteitenDirection = 'upcoming' | 'past'

/** Eén kaart per activiteitstype i.p.v. tientallen identieke week-slots */
export function groupActiviteiten(
  items: Evenement[],
  options: { now?: Date; direction?: GroupActiviteitenDirection } = {}
): GroupedActiviteit[] {
  const now = options.now ?? new Date()
  const direction = options.direction ?? 'upcoming'
  const nowMs = now.getTime()

  const filtered = items
    .filter((item) => {
      const t = new Date(item.start_datetime).getTime()
      return direction === 'upcoming' ? t >= nowMs : t < nowMs
    })
    .sort((a, b) => {
      const diff = new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime()
      return direction === 'upcoming' ? diff : -diff
    })

  const groups = new Map<string, GroupedActiviteit>()

  for (const item of filtered) {
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
        occurrenceCount: 1,
      })
      continue
    }

    existing.occurrenceCount += 1
    if (!existing.zoneName && item.zones?.name) {
      existing.zoneName = item.zones.name
    }
  }

  return Array.from(groups.values()).sort((a, b) => {
    if (!a.nextOccurrence || !b.nextOccurrence) return 0
    const diff =
      new Date(a.nextOccurrence.start_datetime).getTime() -
      new Date(b.nextOccurrence.start_datetime).getTime()
    return direction === 'upcoming' ? diff : -diff
  })
}
