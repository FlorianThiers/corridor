import Link from 'next/link'
import { SUMMER_WEEKLY_SCHEDULE, SUMMER_SCHEDULE_PERIOD } from '@/lib/weekly-schedule'
import { getSportDefinition, type SportSlug } from '@/lib/sports'

interface WeeklyActivityScheduleProps {
  activeSport?: SportSlug
}

export function WeeklyActivitySchedule({ activeSport }: WeeklyActivityScheduleProps) {
  return (
    <section className="mb-12" aria-labelledby="weekrooster-titel">
      <div className="text-center mb-6">
        <h2 id="weekrooster-titel" className="text-3xl font-bold text-gray-800 graffiti-text mb-2">
          Weekrooster zomervakantie
        </h2>
        <p className="text-gray-600">{SUMMER_SCHEDULE_PERIOD}</p>
      </div>

      <div className="bg-[#7ec8c8]/30 backdrop-blur-sm rounded-3xl p-4 md:p-6 border border-teal-200/60 shadow-lg">
        <div className="hidden md:grid md:grid-cols-7 gap-3">
          {SUMMER_WEEKLY_SCHEDULE.map((day) => (
            <DayColumn key={day.key} day={day} activeSport={activeSport} />
          ))}
        </div>

        <div className="md:hidden space-y-3">
          {SUMMER_WEEKLY_SCHEDULE.map((day) => (
            <DayColumn key={day.key} day={day} activeSport={activeSport} mobile />
          ))}
        </div>

        <p className="mt-6 text-center text-sm text-gray-600 max-w-2xl mx-auto">
          Dit is het georganiseerd aanbod. Corrid&apos;Or blijft ook buiten deze momenten open om te sporten —
          er staat een urban cubby met leenmateriaal (kubb, basketbal, voetbal, …).
        </p>
      </div>
    </section>
  )
}

function DayColumn({
  day,
  activeSport,
  mobile = false,
}: {
  day: (typeof SUMMER_WEEKLY_SCHEDULE)[number]
  activeSport?: SportSlug
  mobile?: boolean
}) {
  const visibleSlots = activeSport
    ? day.slots.filter((slot) => slot.slug === activeSport)
    : day.slots

  const isEmptyDay = visibleSlots.length === 0 && day.slots.length === 0
  const isFilteredOut = activeSport && day.slots.length > 0 && visibleSlots.length === 0

  if (isFilteredOut) return null

  return (
    <div
      className={`rounded-2xl bg-white/70 p-3 min-h-[120px] flex flex-col ${
        mobile ? 'border border-teal-100' : ''
      }`}
    >
      <p className={`font-bold text-gray-800 mb-2 ${mobile ? 'text-base' : 'text-sm text-center'}`}>
        {mobile ? day.label : day.shortLabel}
      </p>

      {isEmptyDay ? (
        <p className="text-xs text-gray-400 flex-1 flex items-center justify-center text-center">—</p>
      ) : (
        <ul className="space-y-2 flex-1">
          {visibleSlots.map((slot) => {
            const sport = getSportDefinition(slot.slug)
            const href = `/activiteiten?sport=${slot.slug}`
            return (
              <li key={`${day.key}-${slot.slug}`}>
                <Link
                  href={href}
                  className={`block rounded-xl px-2 py-2 text-center transition-transform hover:scale-[1.02] border-2 ${
                    sport?.borderClass ?? 'border-gray-200'
                  } ${sport?.badgeClass ?? 'bg-white'}`}
                >
                  <span className="block text-xs font-bold leading-tight">{sport?.label ?? slot.slug}</span>
                  <span className="block text-[11px] mt-0.5 opacity-80">{slot.time}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}

      {day.note && (!activeSport || day.slots.some((s) => s.slug === activeSport)) && (
        <p className="text-[10px] text-gray-500 mt-2 leading-snug">{day.note}</p>
      )}
    </div>
  )
}
