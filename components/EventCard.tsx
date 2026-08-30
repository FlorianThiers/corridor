import type { Evenement } from '@/types'
import { EVENEMENT_KIND_LABELS, isEvenementKind } from '@/lib/agenda-helpers'
import { getSportDefinition } from '@/lib/sports'

interface EventCardProps {
  event: Evenement
}

function extractTicketUrl(text: string): string | null {
  const match = text.match(/https?:\/\/[^\s]+/)
  return match ? match[0] : null
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
  const isHighlight = Boolean(event.is_highlight)
  const kindLabel = EVENEMENT_KIND_LABELS[event.kind ?? 'evenement']
  const sport = getSportDefinition(event.sport_slug, event.title)
  const ticketUrl = event.description ? extractTicketUrl(event.description) : null

  return (
    <div
      className={`bg-white/60 backdrop-blur-sm rounded-3xl p-6 card-hover ${
        isHighlight
          ? 'border-2 border-amber-500 shadow-[0_0_0_1px_rgba(245,158,11,0.35)]'
          : isCorrigirls
          ? 'border-l-4 border-pink-500'
          : sport
          ? `border-2 ${sport.borderClass}`
          : ''
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-xl font-bold text-gray-800">{event.title}</h3>
        <div className="flex flex-wrap gap-2 justify-end">
          {isHighlight && (
            <span className="px-2 py-1 bg-amber-100 text-amber-900 border border-amber-500 rounded-full text-xs font-semibold whitespace-nowrap">
              Highlight
            </span>
          )}
          {sport && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${sport.badgeClass}`}>
              {sport.label}
            </span>
          )}
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
              isEvenementKind(event.kind)
                ? 'bg-purple-100 text-purple-700'
                : 'bg-teal-100 text-teal-800'
            }`}
          >
            {kindLabel}
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
      {ticketUrl && (
        <a
          href={ticketUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center mb-3 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-full text-sm font-medium transition-all hover:scale-105"
        >
          Tickets kopen
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
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
