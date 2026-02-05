'use client'

import { useState, useEffect } from 'react'
import { EventCard } from './EventCard'
import type { Evenement } from '@/types'

interface CalendarProps {
  events: Evenement[]
}

export function Calendar({ events }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

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
    const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1 // Monday = 0

    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    
    return days
  }

  const getEventsForDate = (date: Date | null) => {
    if (!date) return []
    return events.filter(event => {
      const eventDate = new Date(event.start_datetime)
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      )
    })
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
  const allEvents = events.filter(event => {
    const eventDate = new Date(event.start_datetime)
    return (
      eventDate.getMonth() === currentDate.getMonth() &&
      eventDate.getFullYear() === currentDate.getFullYear()
    )
  })

  return (
    <div>
      {/* Month Navigation */}
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

      {/* Calendar Grid */}
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 mb-6">
        <div className="grid grid-cols-7 gap-2 mb-4">
          {weekDays.map(day => (
            <div key={day} className="text-center font-bold text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            const dayEvents = day ? getEventsForDate(day) : []
            const hasEvents = dayEvents.length > 0
            const hasCorridgirlEvent = dayEvents.some(event => event.for_girls === true)
            const isSelected = selectedDate && day && (
              day.getDate() === selectedDate.getDate() &&
              day.getMonth() === selectedDate.getMonth() &&
              day.getFullYear() === selectedDate.getFullYear()
            )
            const isToday = day && (
              day.getDate() === new Date().getDate() &&
              day.getMonth() === new Date().getMonth() &&
              day.getFullYear() === new Date().getFullYear()
            )

            if (!day) {
              return <div key={index} className="h-12" />
            }

            return (
              <button
                key={index}
                onClick={() => setSelectedDate(day)}
                className={`h-12 rounded-lg transition-colors ${
                  isSelected
                    ? 'bg-pink-500 text-white'
                    : isToday
                    ? 'bg-pink-100 text-gray-800'
                    : hasEvents
                    ? hasCorridgirlEvent
                      ? 'bg-pink-100 text-gray-800 hover:bg-pink-200'
                      : 'bg-purple-100 text-gray-800 hover:bg-purple-200'
                    : 'bg-white/40 text-gray-800 hover:bg-white/60'
                }`}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <span className="text-sm font-medium">{day.getDate()}</span>
                  {hasEvents && (
                    <span className="text-xs mt-0.5">
                      {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'}
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected Day Events */}
      {selectedDate && selectedEvents.length > 0 && (
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Evenementen op {selectedDate.toLocaleDateString('nl-NL', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </h3>
          <div className="space-y-4">
            {selectedEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}

      {/* All Events List (fallback) */}
      {!selectedDate && allEvents.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Alle evenementen deze maand
          </h3>
          {allEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      {!selectedDate && allEvents.length === 0 && (
        <p className="text-gray-600 text-center">Geen evenementen deze maand.</p>
      )}
    </div>
  )
}
