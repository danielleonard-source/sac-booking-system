import React from 'react';
import { useDataStore } from '../../store/dataStore';
import useDashboardStore from '../../store/dashboardStore';
import { useUIStore } from '../../store/uiStore';

const WarningBanner = () => {
  const setView = useUIStore(state => state.setView);
  const bookings = useDataStore(state => state.bookings);
  const getPendingApprovals = useDashboardStore(state => state.getPendingApprovals);

  const pending = getPendingApprovals(bookings);

  if (pending.total === 0) return null;

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-yellow-800">
            ⚠️ ACTION REQUIRED: {pending.total} Pending Approval{pending.total !== 1 ? 's' : ''}
          </p>
          <div className="mt-2 text-sm text-yellow-700">
            <ul className="list-disc pl-5 space-y-1">
              {pending.new > 0 && <li>{pending.new} New Booking{pending.new !== 1 ? 's' : ''}</li>}
              {pending.edited > 0 && <li>{pending.edited} Edited Booking{pending.edited !== 1 ? 's' : ''}</li>}
              {pending.deletion > 0 && <li>{pending.deletion} Deletion Request{pending.deletion !== 1 ? 's' : ''}</li>}
            </ul>
          </div>
        </div>
        <div className="ml-auto pl-3">
          <button
            onClick={() => setView('bookings')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            Review Now →
          </button>
        </div>
      </div>
    </div>
  );
};

export default WarningBanner;
