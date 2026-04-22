import React from 'react';
import { useDataStore } from '../../store/dataStore';
import useDashboardStore from '../../store/dashboardStore';

const OperationalHealth = () => {
  const bookings = useDataStore(state => state.bookings);
  const blockedSlots = useDataStore(state => state.blockedSlots);
  const unblockSlot = useDataStore(state => state.unblockSlot);

  const {
    getFilteredBookings,
    getBlockedSlots,
    getComplianceMetrics
  } = useDashboardStore();

  const filteredBookings = getFilteredBookings(bookings);
  const activeBlockedSlots = getBlockedSlots(blockedSlots);
  const compliance = getComplianceMetrics(filteredBookings);

  const handleUnblock = (slotDate, day, period) => {
    if (window.confirm('Are you sure you want to unblock this slot?')) {
      unblockSlot(slotDate, day, period);
    }
  };

  return (
    <div className="space-y-6">
      {/* BLOCKED SLOTS */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-800">
            🚫 Currently Blocked Periods ({activeBlockedSlots.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          {activeBlockedSlots.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Day
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Blocked At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeBlockedSlots.map((slot, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(slot.date).toLocaleDateString('en-NZ', { 
                        day: 'numeric', 
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {slot.day}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Period {slot.period}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {slot.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(slot.blockedAt).toLocaleDateString('en-NZ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleUnblock(slot.date, slot.day, slot.period)}
                        className="text-green-600 hover:text-green-800 font-medium"
                      >
                        ✓ Unblock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="px-6 py-8 text-center text-gray-500">
              No blocked slots
            </div>
          )}
        </div>
      </div>

      {/* COMPLIANCE METRICS */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-800">
            📊 Booking Behavior & Compliance
          </h2>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Average Lead Time */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Average Lead Time
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  compliance.avgLeadTime >= 5 ? 'bg-green-100 text-green-800' :
                  compliance.avgLeadTime >= 3 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {compliance.avgLeadTime >= 5 ? 'Good' :
                   compliance.avgLeadTime >= 3 ? 'Fair' : 'Poor'}
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {compliance.avgLeadTime} days
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Time between booking creation and assessment date
              </p>
            </div>

            {/* 3-Day Rule Violations */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Within 3-Day Window
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  compliance.violationRate < 5 ? 'bg-green-100 text-green-800' :
                  compliance.violationRate < 10 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {compliance.violationRate}%
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {compliance.within3DayWindow}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Bookings not meeting the 3-business-day rule
              </p>
            </div>

            {/* Cancellation Rate */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Cancellation Rate
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  compliance.cancellationRate < 5 ? 'bg-green-100 text-green-800' :
                  compliance.cancellationRate < 10 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {compliance.cancellationRate}%
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {compliance.cancellations}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Total bookings deleted or declined
              </p>
            </div>

            {/* Declined SAC */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Declined SAC
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                  Tracking
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {compliance.declinedSAC}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Bookings where learners declined accommodations
              </p>
            </div>

            {/* Booking→Approval Time */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Approval Turnaround
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                  Info
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                18h
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Average time from submission to approval
              </p>
            </div>

            {/* Total Bookings */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Total Bookings
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                  This Term
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {filteredBookings.filter(b => b.status !== 'deleted' && b.status !== 'declined').length}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Active bookings (excluding deleted/declined)
              </p>
            </div>
          </div>

          {/* Insights */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              💡 Insights & Recommendations
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              {compliance.violationRate > 10 && (
                <li>• High rate of last-minute bookings - consider sending reminder emails to teachers</li>
              )}
              {compliance.cancellationRate > 10 && (
                <li>• Elevated cancellation rate - review booking processes with staff</li>
              )}
              {compliance.avgLeadTime < 3 && (
                <li>• Average lead time below recommended threshold - emphasize advance planning</li>
              )}
              {compliance.avgLeadTime >= 5 && compliance.violationRate < 5 && (
                <li>• ✓ Excellent booking compliance - staff following procedures well</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperationalHealth;
