// =======================================
// CALENDAR COMPONENT - Weekly View
// =======================================

import { useState } from 'react'
import { useDataStore } from '../store/dataStore'
import { useUIStore } from '../store/uiStore'
import { useAuthStore } from '../store/authStore'
import { getWeekDates, getLocalDateString, getDayName } from '../utils/helpers'
import { SCHEDULE } from '../config'

export default function Calendar() {
  const [weekOffset, setWeekOffset] = useState(0)
  
  const { bookings } = useDataStore()
  const { openModal } = useUIStore()
  const { userRole } = useAuthStore()

  const weekDates = getWeekDates(weekOffset)
  const periods = ['1', '2', '3', '4', '5', '6']

  // Handle slot click - open booking modal
  const handleSlotClick = (date, day, period) => {
    const schedule = SCHEDULE[day]
    if (!schedule || !schedule[period]) return

    const periodInfo = schedule[period]
    openModal('bookingForm', {
      date,
      day,
      period,
      periodName: periodInfo.name,
      periodStart: periodInfo.start,
      periodEnd: periodInfo.end
    })
  }

  // Get bookings for a specific slot
  const getSlotBookings = (date, period) => {
    return bookings.filter(b => 
      b.date === date && String(b.period) === String(period)
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header with Navigation */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">
            📅 Weekly Calendar
          </h2>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setWeekOffset(weekOffset - 1)}
              className="btn btn-secondary btn-sm"
            >
              ← Previous
            </button>
            
            <button
              onClick={() => setWeekOffset(0)}
              className="btn btn-primary btn-sm"
              disabled={weekOffset === 0}
            >
              Current Week
            </button>
            
            <button
              onClick={() => setWeekOffset(weekOffset + 1)}
              className="btn btn-secondary btn-sm"
            >
              Next →
            </button>
          </div>
        </div>

        {/* Week indicator */}
        {weekOffset !== 0 && (
          <p className="text-sm text-gray-600 mt-2">
            {weekOffset > 0 
              ? `${weekOffset} week(s) ahead` 
              : `${Math.abs(weekOffset)} week(s) ago`}
          </p>
        )}

        {/* Date range */}
        <p className="text-sm text-gray-500 mt-1">
          {weekDates[0].toLocaleDateString('en-NZ', { month: 'long', day: 'numeric' })} - {' '}
          {weekDates[4].toLocaleDateString('en-NZ', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase border w-24">
                Period
              </th>
              {weekDates.map((date, idx) => {
                const day = getDayName(date)
                const displayDate = date.toLocaleDateString('en-NZ', { 
                  month: 'short', 
                  day: 'numeric' 
                })
                
                return (
                  <th 
                    key={idx} 
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase border"
                  >
                    <div className="font-bold text-gray-800">{day}</div>
                    <div className="text-gray-400 font-normal">{displayDate}</div>
                  </th>
                )
              })}
            </tr>
          </thead>

          <tbody className="bg-white">
            {periods.map(period => (
              <tr key={period}>
                {/* Period Label */}
                <td className="px-4 py-3 text-sm font-medium text-gray-900 border bg-gray-50">
                  Period {period}
                </td>

                {/* Day Cells */}
                {weekDates.map((date, idx) => {
                  const day = getDayName(date)
                  const dateStr = getLocalDateString(date)
                  const schedule = SCHEDULE[day]
                  const periodInfo = schedule?.[period]

                  // No period scheduled for this day (e.g. Period 6 on Monday)
                  if (!periodInfo) {
                    return (
                      <td key={idx} className="px-4 py-3 bg-gray-100 border text-center">
                        <span className="text-xs text-gray-400">-</span>
                      </td>
                    )
                  }

                  const slotBookings = getSlotBookings(dateStr, period)

                  return (
                    <td
                      key={idx}
                      className="px-4 py-3 border relative group cursor-pointer hover:bg-blue-50 transition-colors"
                      onClick={() => handleSlotClick(dateStr, day, period)}
                    >
                      {/* Time */}
                      <div className="text-xs text-gray-500 mb-2">
                        {periodInfo.start} - {periodInfo.end}
                      </div>

                      {/* Bookings */}
                      {slotBookings.length > 0 && (
                        <div className="space-y-1">
                          {slotBookings.map(booking => (
                            <div
                              key={booking.id}
                              className="bg-blue-100 border border-blue-300 rounded px-2 py-1 text-xs hover:bg-blue-200"
                              onClick={(e) => {
                                e.stopPropagation()
                                openModal('bookingForm', { 
                                  ...booking, 
                                  mode: 'edit' 
                                })
                              }}
                            >
                              <div className="font-medium truncate">
                                {booking.subject || 'Untitled'}
                              </div>
                              <div className="text-gray-600">
                                {Array.isArray(booking.learners) 
                                  ? booking.learners.length 
                                  : 0} learner(s)
                              </div>
                              {booking.room && (
                                <div className="text-gray-600">
                                  Room: {booking.room}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Empty slot - show create button on hover */}
                      {slotBookings.length === 0 && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-center">
                          <div className="text-xs text-blue-600 font-medium">
                            + Create Booking
                          </div>
                        </div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-center space-x-6 text-xs text-gray-600">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
            <span>Has Bookings</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-white border border-gray-300 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
            <span>No Period</span>
          </div>
        </div>
        <div className="text-center text-xs text-gray-500 mt-2">
          Click any slot to create or view bookings
        </div>
      </div>
    </div>
  )
}
