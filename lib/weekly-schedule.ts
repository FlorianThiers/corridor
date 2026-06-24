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
    slots: [{ slug: 'wandelvoetbal', time: '10:00 – 11:00' }],
  },
  {
    key: 'wo',
    label: 'Woensdag',
    shortLabel: 'Wo',
    slots: [
      { slug: 'corribar', time: '14:00 – 17:00' },
      { slug: 'basketbal', time: '15:00 – 18:00' },
    ],
  },
  {
    key: 'do',
    label: 'Donderdag',
    shortLabel: 'Do',
    slots: [{ slug: 'sportkar', time: '16:00 – 18:00' }],
  },
  {
    key: 'vr',
    label: 'Vrijdag',
    shortLabel: 'Vr',
    slots: [{ slug: 'basketbal', time: '16:00 – 19:00' }],
  },
  {
    key: 'za',
    label: 'Zaterdag',
    shortLabel: 'Za',
    slots: [
      { slug: 'corribar', time: '14:00 – 17:00' },
      { slug: 'skate', time: '14:00 – 16:00' },
    ],
  },
  {
    key: 'zo',
    label: 'Zondag',
    shortLabel: 'Zo',
    slots: [{ slug: 'corrihop', time: '14:00 – 17:00' }],
    note: 'Enkel op 28/06, 9/08 en 30/08 — zie kalender',
  },
]

export const SUMMER_SCHEDULE_PERIOD = '28 juni – 30 augustus 2026'
