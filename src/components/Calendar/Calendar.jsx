import React, { useState } from 'react';
import { useDataStore } from '../../store/dataStore';
import { useUIStore } from '../../store/uiStore';
import useAuthStore from '../../store/authStore';
import { SCHEDULE } from '../../config';

function Calendar() {
  const { bookings, blockedSlots, sessionCapacities, deleteBlockedSlot, getMaxCapacity, getAvailableSlots: getAvailableSlotsFromStore } = useDataStore();
  const { openModal } = useUIStore();
  const { userRole } = useAuthStore();
  const [weekOffset, setWeekOffset] = useState(0);

  // Get week dates
  const getWeekDates = (offset) => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff + (offset * 7));
    
    const dates = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates(weekOffset);

  // Helper functions
  const getLocalDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDayName = (date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  };

  const isSlotBookable = (date) => {
    const slotDate = new Date(date);
    slotDate.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let businessDaysToAdd = 3;
    let currentDate = new Date(today);
    
    while (businessDaysToAdd > 0) {
      currentDate.setDate(currentDate.getDate() + 1);
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        businessDaysToAdd--;
      }
    }
    
    return slotDate >= currentDate;
  };

  const isSlotBlocked = (dateStr, period) => {
    return blockedSlots?.some(bs => {
      const blockedDate = bs.date.split('T')[0]; // Extract date portion
      return blockedDate === dateStr && String(bs.period) === String(period);
    });
  };
  const getAvailableSlots = (dateStr, period) => {
    const tempDate = new Date(dateStr + 'T12:00:00');
    const day = getDayName(tempDate);
    return getAvailableSlotsFromStore(dateStr, day, period);
  };

  const handleSlotClick = (date, day, period) => {
    const dateStr = getLocalDateString(date);
    if (isSlotBlocked(dateStr, period) || date < new Date() || !isSlotBookable(date)) {
      return;
    }
    
    openModal('bookingForm', { date: dateStr, day, period });
  };

  const handleBlockSlot = (e, dateStr, day, period) => {
    e.stopPropagation();
    openModal('blockSlot', { date: dateStr, day, period });
  };

  const handleCapacity = (e, dateStr, day, period) => {
    e.stopPropagation();
    openModal('capacity', { date: dateStr, day, period });
  };

  const handleUnblock = async (e, blockedSlotId) => {
    e.stopPropagation();
    if (window.confirm('Unblock this slot?')) {
    console.log('Unblocking slot:', blockedSlotId);
      try {
        await deleteBlockedSlot(blockedSlotId);
      } catch (error) {
        console.error('Unblock failed:', error);
      }
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-4">
        <div className="flex justify-between items-center">
          <button
            onClick={() => setWeekOffset(weekOffset - 1)}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            ← Previous
          </button>
          <div className="text-center">
            <div className="font-bold text-xl">
              {weekDates[0].toLocaleDateString('en-NZ', { month: 'long', day: 'numeric' })} - {weekDates[4].toLocaleDateString('en-NZ', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
            <div className="text-sm text-gray-600">
              Week {weekOffset === 0 ? 'Current' : weekOffset > 0 ? '+' + weekOffset : weekOffset}
            </div>
          </div>
          <button
            onClick={() => setWeekOffset(weekOffset + 1)}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 border">Period</th>
              {weekDates.map((date, i) => (
                <th key={i} className="p-3 border text-center">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'][i]}
                  <br />
                  <span className="text-sm">
                    {date.toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' })}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {['1', '2', '3', '4', '5', '6'].map(period => (
              <tr key={period}>
                <td className="p-3 border bg-gray-50 font-semibold">P{period}</td>
                {weekDates.map((date, idx) => {
                  const day = getDayName(date);
                  const dateStr = getLocalDateString(date);
                  const sch = SCHEDULE[day];
                  
                  if (!sch || !sch[period]) {
                    return <td key={idx} className="p-3 border bg-gray-200"></td>;
                  }

                  const blocked = isSlotBlocked(dateStr, period);
                  const isPast = date < new Date();
                  const bookable = isSlotBookable(date);
                  const avail = getAvailableSlots(dateStr, period);
                  const max = getMaxCapacity(dateStr, day, period);
                  const booked = max - avail;

                  let cellClass, content;

                  if (isPast) {
                    cellClass = 'bg-gray-200 cursor-default';
                    content = (
                      <>
                        <div className="text-xs text-gray-600">{sch[period].start}-{sch[period].end}</div>
                        <div className="text-sm text-gray-500">Past</div>
                      </>
                    );
                  } else if (blocked) {
                    const blockedSlot = blockedSlots.find(s => s.date.split('T')[0] === dateStr && String(s.period) === String(period));
                    cellClass = 'bg-gray-300 cursor-not-allowed';
                    content = (
                      <>
                        {userRole === 'admin' && (
                          <div className="absolute top-1 right-1 flex space-x-1 z-10">
                            <button
                              onClick={(e) => handleCapacity(e, dateStr, day, period)}
                              className="text-xs bg-blue-500 text-white px-1 rounded"
                            >
                              📊
                            </button>
                            <button
                              onClick={(e) => handleUnblock(e, blockedSlot?.id)}
                              className="text-xs bg-green-500 text-white px-1 rounded"
                            >
                              ✓
                            </button>
                          </div>
                        )}
                        <div className="text-xs text-gray-600">{sch[period].start}-{sch[period].end}</div>
                        <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
                          <div className="text-gray-500 text-2xl font-bold opacity-60 transform -rotate-45 whitespace-nowrap">
                            BLOCKED
                          </div>
                        </div>
                        <div className="text-sm font-bold text-gray-600 mt-1">0 available</div>
                      </>
                    );
                  } else {
                    const isNotBookableRed = !bookable && avail > 0;
                    cellClass = avail <= 0 ? 'bg-red-100 cursor-not-allowed' :
                                bookable ? 'bg-green-100 cursor-pointer hover:bg-green-200' :
                                'bg-red-100 cursor-not-allowed';
                    
                    content = (
                      <>
                        {userRole === 'admin' && (
                          <div className="absolute top-1 right-1 flex space-x-1 z-10">
                            <button
                              onClick={(e) => handleCapacity(e, dateStr, day, period)}
                              className="text-xs bg-blue-500 text-white px-1 rounded"
                            >
                              📊
                            </button>
                            <button
                              onClick={(e) => handleBlockSlot(e, dateStr, day, period)}
                              className="text-xs bg-red-500 text-white px-1 rounded"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                        <div className="text-xs text-gray-600">{sch[period].start}-{sch[period].end}</div>
                        {!isNotBookableRed ? (
                          <>
                            <div className={`text-2xl font-bold ${avail > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {booked}/{max}
                            </div>
                            <div className="text-xs">{avail} avail</div>
                          </>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
                            <div className="text-red-300 text-xl font-bold opacity-50 transform -rotate-45 whitespace-nowrap">
                              Not bookable
                            </div>
                          </div>
                        )}
                      </>
                    );
                  }

                  const clickHandler = !blocked && !isPast && bookable ? 
                    () => handleSlotClick(date, day, period) : 
                    undefined;

                  return (
                    <td
                      key={idx}
                      className={`p-3 border text-center relative ${cellClass}`}
                      onClick={clickHandler}
                    >
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Calendar;
