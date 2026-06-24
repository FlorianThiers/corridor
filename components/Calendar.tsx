'use client'

import { useState, useMemo } from 'react'
import { EventCard } from './EventCard'
import type { Evenement } from '@/types'
import { isActiviteitKind } from '@/lib/agenda-helpers'
import { getSportDefinition, resolveSportSlug, type SportSlug } from '@/lib/sports'

interface CalendarProps {
  events: Evenement[]
  sportFilter?: SportSlug
}

export function Calendar({ events, sportFilter }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const filteredEvents = useMemo(() => {
    if (!sportFilter) return events
    return events.filter((event) => resolveSportSlug(event.sport_slug, event.title) === sportFilter)
  }, [events, sportFilter])

  const monthNames = [
    'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
    'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'
  ]

  const weekDays = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo']

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1

    const days = []
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null)
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i))
    return days
  }

  const getEventsForDate = (date: Date | null) => {
    if (!date) return []
    return filteredEvents.filter((event) => {
      const eventDate = new Date(event.start_datetime)
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      )
    })
  }

  const getSportSlugsForDay = (dayEvents: Evenement[]) => {
    const slugs = new Set<SportSlug>()
    for (const event of dayEvents) {
      if (!isActiviteitKind(event.kind)) continue
      const slug = resolveSportSlug(event.sport_slug, event.title)
      if (slug) slugs.add(slug)
    }
    return Array.from(slugs)
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    setSelectedDate(null)
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    setSelectedDate(null)
  }

  const days = getDaysInMonth(currentDate)
  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : []
  const allEvents = filteredEvents.filter((event) => {
    const eventDate = new Date(event.start_datetime)
    return eventDate.getMonth() === currentDate.getMonth() && eventDate.getFullYear() === currentDate.getFullYear()
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={prevMonth}
          className="px-4 py-2 bg-white/60 backdrop-blur-sm rounded-lg hover:bg-white/80 transition-colors font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-gray-800">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <button
          onClick={nextMonth}
          className="px-4 py-2 bg-white/60 backdrop-blur-sm rounded-lg hover:bg-white/80 transition-colors font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 mb-6">
        <div className="grid grid-cols-7 gap-2 mb-4">
          {weekDays.map((day) => (
            <div key={day} className="text-center font-bold text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            const dayEvents = day ? getEventsForDate(day) : []
            const hasEvents = dayEvents.length > 0
            const hasHighlight = dayEvents.some((event) => event.is_highlight)
            const hasEvenement = dayEvents.some((event) => !isActiviteitKind(event.kind))
            const hasCorrigirls = dayEvents.some((event) => event.for_girls === true)
            const sportSlugs = getSportSlugsForDay(dayEvents)
            const isSelected =
              selectedDate &&
              day &&
              day.getDate() === selectedDate.getDate() &&
              day.getMonth() === selectedDate.getMonth() &&
              day.getFullYear() === selectedDate.getFullYear()
            const isToday =
              day &&
              day.getDate() === new Date().getDate() &&
              day.getMonth() === new Date().getMonth() &&
              day.getFullYear() === new Date().getFullYear()

            if (!day) return <div key={index} className="h-14" />

            let cellClass = 'bg-white/40 text-gray-800 hover:bg-white/60'
            if (isSelected) {
              cellClass = 'bg-pink-500 text-white'
            } else if (isToday) {
              cellClass = 'bg-pink-100 text-gray-800'
            } else if (hasHighlight) {
              cellClass = 'bg-white/80 text-gray-800 border-2 border-amber-500 shadow-sm'
            } else if (hasCorrigirls) {
              cellClass = 'bg-pink-100 text-gray-800 hover:bg-pink-200'
            } else if (hasEvenement) {
              cellClass = 'bg-purple-100 text-gray-800 hover:bg-purple-200'
            } else if (hasEvents) {
              cellClass = 'bg-white/75 text-gray-800 hover:bg-white border border-gray-200'
            }

            return (
              <button
                key={index}
                onClick={() => setSelectedDate(day)}
                className={`h-14 rounded-lg transition-colors ${cellClass}`}
              >
                <div className="flex flex-col items-center justify-center h-full px-1">
                  <span className="text-sm font-medium">{day.getDate()}</span>
                  {sportSlugs.length > 0 && !isSelected && (
                    <div className="flex gap-0.5 mt-1 flex-wrap justify-center max-w-full">
                      {sportSlugs.slice(0, 4).map((slug) => {
                        const sport = getSportDefinition(slug)
                        return (
                          <span
                            key={slug}
                            className={`calendar-sport-dot ${sport?.dotClass ?? 'bg-gray-400'}`}
                            title={sport?.label}
                          />
                        )
                      })}
                    </div>
                  )}
                  {hasHighlight && !isSelected && sportSlugs.length === 0 && (
                    <span className="text-[10px] mt-0.5 font-semibold text-amber-700">★</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mb-6 text-xs text-gray-600">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block w-4 h-4 rounded border-2 border-amber-500 bg-white/80" />
          Highlight
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block w-4 h-4 rounded bg-purple-100" />
          Evenement
        </span>
        {sportFilter && (
          <span className="inline-flex items-center gap-2">
            <span className={`calendar-sport-dot ${getSportDefinition(sportFilter)?.dotClass}`} />
            {getSportDefinition(sportFilter)?.label}
          </span>
        )}
      </div>

      {selectedDate && selectedEvents.length > 0 && (
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Agenda op{' '}
            {selectedDate.toLocaleDateString('nl-NL', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </h3>
          <div className="space-y-4">
            {selectedEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}

      {!selectedDate && allEvents.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Deze maand</h3>
          {allEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      {!selectedDate && allEvents.length === 0 && (
        <p className="text-gray-600 text-center">Geen items deze maand{sportFilter ? ' voor deze sport' : ''}.</p>
      )}
    </div>
  )
}
