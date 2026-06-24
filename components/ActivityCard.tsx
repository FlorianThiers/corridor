import { getSportDefinition } from '@/lib/sports'
import type { GroupedActiviteit } from '@/lib/agenda-helpers'

interface ActivityCardProps {
  activity: GroupedActiviteit
  variant?: 'upcoming' | 'past'
}

export function ActivityCard({ activity, variant = 'upcoming' }: ActivityCardProps) {
  const slot = activity.nextOccurrence
  const slotDate = slot ? new Date(slot.start_datetime) : null
  const slotEnd = slot?.end_datetime ? new Date(slot.end_datetime) : null
  const sport = getSportDefinition(activity.sportSlug, activity.title)
  const isPast = variant === 'past'

  return (
    <div
      className={`bg-white/60 backdrop-blur-sm rounded-3xl p-6 card-hover border-2 ${
        sport ? sport.borderClass : 'border-teal-300'
      } ${isPast ? 'opacity-90' : ''}`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-xl font-bold text-gray-800">{activity.title}</h3>
        <div className="flex flex-wrap gap-2 justify-end">
          {sport && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${sport.badgeClass}`}>
              {sport.label}
            </span>
          )}
          <span className="px-2 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-medium whitespace-nowrap">
            Activiteit
          </span>
        </div>
      </div>
      {activity.description && (
        <p className="text-gray-700 text-sm mb-3">{activity.description}</p>
      )}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
        {slotDate && (
          <span>
            {isPast ? 'Laatste' : 'Volgende'}: {slotDate.toLocaleDateString('nl-NL')} ·{' '}
            {slotDate.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
            {slotEnd
              ? ` – ${slotEnd.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}`
              : ''}
          </span>
        )}
        {activity.zoneName && <span>📍 {activity.zoneName}</span>}
        {activity.occurrenceCount > 1 && (
          <span className="text-gray-500">
            {isPast
              ? `${activity.occurrenceCount} keer georganiseerd`
              : `+${activity.occurrenceCount - 1} extra momenten gepland`}
          </span>
        )}
      </div>
    </div>
  )
}
