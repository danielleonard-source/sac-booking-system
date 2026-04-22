// =======================================
// CALENDAR COMPONENT - Weekly View
// =======================================

import { useState } from 'react'
import { useDataStore } from '../store/dataStore'
import { useUIStore } from '../store/uiStore'
import useAuthStore from '../store/authStore'
import { getWeekDates, formatDate } from '../utils/helpers'
import { SCHEDULE, DAYS_OF_WEEK, SAC_DECLINE_REASONS } from '../config'

export default function Calendar() {
  const [weekOffset, setWeekOffset] = useState(0)
  
  const { bookings, blockedSlots = [] } = useDataStore()
  const { openModal } = useUIStore()
  const { userRole } = useAuthStore()
  
  const weekDates = getWeekDates(weekOffset)
  const periods = ['1', '2', '3', '4', '5', '6']

  // Get bookings for specific date and period
  const getSlotBookings = (date, period) => {
    return bookings.filter(b => 
      b.date === date && b.period === period
    )
  }

  // Check if slot is blocked
  const isSlotBlocked = (date, period) => {
    return blockedSlots.some(bs => 
      bs.date === date && bs.period === period
    )
  }

  // Get period info for the day
  const getPeriodInfo = (day, period) => {
    const schedule = SCHEDULE[day]
    if (!schedule || !schedule[period]) return null
    return schedule[period]
  }

  // Handle slot click
  const handleSlotClick = (date, day, period) => {
    const periodInfo = getPeriodInfo(day, period)
    if (!periodInfo) return

    openModal('bookingForm', {
      date,
      day,
      period,
      periodName: periodInfo.name,
      periodStart: periodInfo.start,
      periodEnd: periodInfo.end
    })
  }

  // Navigate weeks
  const goToCurrentWeek = () => setWeekOffset(0)
  const goToPreviousWeek = () => setWeekOffset(weekOffset - 1)
  const goToNextWeek = () => setWeekOffset(weekOffset + 1)

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">
            Weekly Calendar
          </h2>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPreviousWeek}
              className="btn btn-secondary btn-sm"
            >
              ← Previous
            </button>
            
            <button
              onClick={goToCurrentWeek}
              className="btn btn-primary btn-sm"
              disabled={weekOffset === 0}
            >
              Current Week
            </button>
            
            <button
              onClick={goToNextWeek}
              className="btn btn-secondary btn-sm"
            >
              Next →
            </button>
          </div>
        </div>

        {weekOffset !== 0 && (
          <p className="text-sm text-gray-600 mt-2">
            {weekOffset > 0 ? `${weekOffset} week(s) ahead` : `${Math.abs(weekOffset)} week(s) ago`}
          </p>
        )}
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">
                Period
              </th>
              {weekDates.map(({ date, day, displayDate }, idx) => (
                <th
                  key={idx}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  <div>{day}</div>
                  <div className="text-gray-400 font-normal">{displayDate}</div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {periods.map(period => (
              <tr key={period}>
                {/* Period Label */}
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  Period {period}
                </td>

                {/* Day Slots */}
                {weekDates.map(({ date, day }, idx) => {
                  const periodInfo = getPeriodInfo(day, period)
                  const slotBookings = getSlotBookings(date, period)
                  const blocked = isSlotBlocked(date, period)

                  // No period on this day (e.g., Period 6 on Monday)
                  if (!periodInfo) {
                    return (
                      <td
                        key={idx}
                        className="px-4 py-3 bg-gray-50"
                      >
                        <div className="text-xs text-gray-400">-</div>
                      </td>
                    )
                  }

                  return (
                    <td
                      key={idx}
                      className="px-4 py-3 relative group cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSlotClick(date, day, period)}
                    >
                      {/* Period Time */}
                      <div className="text-xs text-gray-500 mb-2">
                        {periodInfo.start} - {periodInfo.end}
                      </div>

                      {/* Blocked Slot */}
                      {blocked && (
                        <div className="bg-red-100 border border-red-300 rounded px-2 py-1 text-xs text-red-700">
                          🚫 Blocked
                        </div>
                      )}

                      {/* Bookings */}
                      {!blocked && slotBookings.length > 0 && (
                        <div className="space-y-1">
                          {slotBookings.map(booking => (
                            <BookingCard
                              key={booking.id}
                              booking={booking}
                              onClick={(e) => {
                                e.stopPropagation()
                                openModal('bookingForm', { ...booking, mode: 'edit' })
                              }}
                            />
                          ))}
                        </div>
                      )}

                      {/* Empty Slot - Show Create Button on Hover */}
                      {!blocked && slotBookings.length === 0 && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
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
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
              <span>Approved</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
              <span>Pending</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
              <span>Declined/Blocked</span>
            </div>
          </div>
          
          <div className="text-gray-500">
            Click any slot to create or view booking
          </div>
        </div>
      </div>
    </div>
  )
}

// =======================================
// BOOKING CARD - Mini booking display
// =======================================

function BookingCard({ booking, onClick }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 border-green-300 text-green-800'
      case 'pending':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800'
      case 'declined':
        return 'bg-red-100 border-red-300 text-red-800'
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800'
    }
  }

  const learnerCount = Array.isArray(booking.learners) 
    ? booking.learners.length 
    : 0

  return (
    <div
      onClick={onClick}
      className={`border rounded px-2 py-1 text-xs cursor-pointer hover:shadow-md transition-shadow ${getStatusColor(booking.status)}`}
    >
      <div className="font-medium truncate">
        {booking.subject || 'Untitled'}
      </div>
      <div className="text-xs opacity-75">
        {learnerCount} learner{learnerCount !== 1 ? 's' : ''}
        {booking.room && ` • ${booking.room}`}
      </div>
      {booking.isMultiSession && (
        <div className="text-xs opacity-75 mt-1">
          📅 Session {booking.sessionNumber}/{booking.totalSessions}
        </div>
      )}
    </div>
  )
}
