import type { Evenement } from '@/types'

interface EventCardProps {
  event: Evenement
}

function renderDescriptionWithLinks(text: string) {
  const splitRegex = /(https?:\/\/[^\s]+)/g
  const parts = text.split(splitRegex)

  return parts.map((part, index) => {
    if (/^https?:\/\/[^\s]+$/.test(part)) {
      return (
        <a
          key={`${part}-${index}`}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-700 underline break-all hover:text-blue-900"
        >
          {part}
        </a>
      )
    }

    return <span key={`text-${index}`}>{part}</span>
  })
}

export function EventCard({ event }: EventCardProps) {
  const startDate = new Date(event.start_datetime)
  const endDate = event.end_datetime ? new Date(event.end_datetime) : null
  const isCorrigirls = event.for_girls

  return (
    <div className={`bg-white/60 backdrop-blur-sm rounded-3xl p-6 card-hover ${isCorrigirls ? 'border-l-4 border-pink-500' : ''}`}>
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-xl font-bold text-gray-800">{event.title}</h3>
        <div className="flex gap-2">
          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium whitespace-nowrap">
            Evenement
          </span>
          {isCorrigirls && (
            <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-medium whitespace-nowrap">
              Corrigirls
            </span>
          )}
        </div>
      </div>
      {event.description && (
        <p className="text-gray-700 text-sm mb-2">{renderDescriptionWithLinks(event.description)}</p>
      )}
      <div className="flex items-center gap-4 text-xs text-gray-600">
        <span>📅 {startDate.toLocaleDateString('nl-NL')}</span>
        <span>
          🕐 {startDate.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
          {endDate ? ` - ${endDate.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}` : ''}
        </span>
        {event.zones && <span>📍 {event.zones.name}</span>}
      </div>
    </div>
  )
}
