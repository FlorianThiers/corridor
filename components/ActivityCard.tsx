import type { GroupedActiviteit } from '@/lib/agenda-helpers'

interface ActivityCardProps {
  activity: GroupedActiviteit
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const next = activity.nextOccurrence
  const nextDate = next ? new Date(next.start_datetime) : null
  const nextEnd = next?.end_datetime ? new Date(next.end_datetime) : null

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-6 border border-teal-200/50">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-xl font-bold text-gray-800">{activity.title}</h3>
        <span className="px-2 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-medium whitespace-nowrap">
          Activiteit
        </span>
      </div>
      {activity.description && (
        <p className="text-gray-700 text-sm mb-3">{activity.description}</p>
      )}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
        {nextDate && (
          <span>
            Volgende: {nextDate.toLocaleDateString('nl-NL')} ·{' '}
            {nextDate.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
            {nextEnd
              ? ` – ${nextEnd.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}`
              : ''}
          </span>
        )}
        {activity.zoneName && <span>📍 {activity.zoneName}</span>}
        {activity.upcomingCount > 1 && (
          <span className="text-teal-700/80">+{activity.upcomingCount - 1} extra momenten gepland</span>
        )}
      </div>
    </div>
  )
}
