import Link from 'next/link'
import { SUMMER_WEEKLY_SCHEDULE, SUMMER_SCHEDULE_PERIOD } from '@/lib/weekly-schedule'
import { getScheduleLabel, getSportDefinition, type SportSlug } from '@/lib/sports'

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
        {/* Tablet: horizontaal scrollen i.p.v. gepropte 7 kolommen */}
        <div className="hidden md:block xl:hidden -mx-1 overflow-x-auto pb-1">
          <div className="flex gap-2 px-1 min-w-max">
            {SUMMER_WEEKLY_SCHEDULE.map((day) => (
              <div key={day.key} className="w-[8.75rem] flex-shrink-0">
                <DayColumn day={day} activeSport={activeSport} compact />
              </div>
            ))}
          </div>
        </div>

        {/* Breed scherm: 7 kolommen met min-w-0 tegen overflow */}
        <div className="hidden xl:grid xl:grid-cols-7 gap-2">
          {SUMMER_WEEKLY_SCHEDULE.map((day) => (
            <DayColumn key={day.key} day={day} activeSport={activeSport} compact />
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
  compact = false,
}: {
  day: (typeof SUMMER_WEEKLY_SCHEDULE)[number]
  activeSport?: SportSlug
  mobile?: boolean
  compact?: boolean
}) {
  const visibleSlots = activeSport
    ? day.slots.filter((slot) => slot.slug === activeSport)
    : day.slots

  const isEmptyDay = visibleSlots.length === 0 && day.slots.length === 0
  const isFilteredOut = activeSport && day.slots.length > 0 && visibleSlots.length === 0

  if (isFilteredOut) return null

  return (
    <div
      className={`rounded-2xl bg-white/70 flex flex-col min-w-0 ${
        compact ? 'p-2 min-h-[7.5rem]' : mobile ? 'p-3 border border-teal-100' : 'p-3 min-h-[120px]'
      }`}
    >
      <p
        className={`font-bold text-gray-800 mb-2 shrink-0 ${
          mobile ? 'text-base' : 'text-xs text-center'
        }`}
      >
        {mobile ? day.label : day.shortLabel}
      </p>

      {isEmptyDay ? (
        <p className="text-xs text-gray-400 flex-1 flex items-center justify-center text-center">—</p>
      ) : (
        <ul className="space-y-1.5 flex-1 min-w-0">
          {visibleSlots.map((slot) => {
            const sport = getSportDefinition(slot.slug)
            const href = `/activiteiten?sport=${slot.slug}`
            const label = getScheduleLabel(slot.slug)

            return (
              <li key={`${day.key}-${slot.slug}`} className="min-w-0">
                <Link
                  href={href}
                  title={`${sport?.label ?? slot.slug} · ${slot.time}`}
                  className={`block rounded-lg px-1.5 py-1.5 min-w-0 transition-transform hover:scale-[1.02] border-2 ${
                    sport?.borderClass ?? 'border-gray-200'
                  } ${sport?.badgeClass ?? 'bg-white'}`}
                >
                  <span className="block text-[10px] font-bold leading-snug break-words [overflow-wrap:anywhere]">
                    {label}
                  </span>
                  <span className="block text-[9px] mt-0.5 leading-tight opacity-90 break-words">
                    {slot.time}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}

      {day.note && (!activeSport || day.slots.some((s) => s.slug === activeSport)) && (
        <p className="text-[9px] text-gray-500 mt-1.5 leading-snug break-words [overflow-wrap:anywhere]">
          {day.note}
        </p>
      )}
    </div>
  )
}
