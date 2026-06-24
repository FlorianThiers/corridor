import type { SportSlug } from '@/lib/sports'

export interface WeeklyScheduleSlot {
  slug: SportSlug
  time: string
}

export interface WeeklyScheduleDay {
  key: string
  label: string
  shortLabel: string
  slots: WeeklyScheduleSlot[]
  note?: string
}

/** Wekelijks zomerprogramma — sync met affiche Corri D'Or */
export const SUMMER_WEEKLY_SCHEDULE: WeeklyScheduleDay[] = [
  { key: 'ma', label: 'Maandag', shortLabel: 'Ma', slots: [] },
  {
    key: 'di',
    label: 'Dinsdag',
    shortLabel: 'Di',
    slots: [{ slug: 'wandelvoetbal', time: '10u – 11u' }],
  },
  {
    key: 'wo',
    label: 'Woensdag',
    shortLabel: 'Wo',
    slots: [
      { slug: 'corribar', time: '14u – 17u' },
      { slug: 'basketbal', time: '15u – 18u' },
    ],
  },
  {
    key: 'do',
    label: 'Donderdag',
    shortLabel: 'Do',
    slots: [{ slug: 'sportkar', time: '16u – 18u' }],
  },
  {
    key: 'vr',
    label: 'Vrijdag',
    shortLabel: 'Vr',
    slots: [{ slug: 'basketbal', time: '16u – 19u' }],
  },
  {
    key: 'za',
    label: 'Zaterdag',
    shortLabel: 'Za',
    slots: [
      { slug: 'corribar', time: '14u – 17u' },
      { slug: 'skate', time: '14u – 16u' },
    ],
  },
  {
    key: 'zo',
    label: 'Zondag',
    shortLabel: 'Zo',
    slots: [{ slug: 'corrihop', time: '14u – 17u' }],
    note: 'Enkel 28/06, 9/08 en 30/08',
  },
]

export const SUMMER_SCHEDULE_PERIOD = '28 juni – 30 augustus 2026'
