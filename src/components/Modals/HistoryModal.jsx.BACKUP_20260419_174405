import React from 'react';
import { useUIStore } from '../../store/uiStore';
import { useDataStore } from '../../store/dataStore';

function HistoryModal() {
  console.log('🟣 HistoryModal rendering');
  const { historyModalOpen, historyBooking, closeHistoryModal } = useUIStore();
  console.log('🟣 historyModalOpen:', historyModalOpen);
  console.log('🟣 historyBooking:', historyBooking);
  const { bookingHistory } = useDataStore();
  console.log('🟣 bookingHistory entries:', bookingHistory?.length);

  if (!historyModalOpen || !historyBooking) {
    console.log('🟣 Modal not showing - historyModalOpen or historyBooking is null');
    return null;
  }

  // Get all history entries for this booking
  const bookingHistoryEntries = bookingHistory
    .filter(h => h.bookingId === historyBooking.id || h.id === historyBooking.id)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Newest first

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-NZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getChangeTypeLabel = (type) => {
    const labels = {
      created: 'Created',
      updated: 'Updated',
      status_changed: 'Status Changed',
      approved: 'Approved',
      declined: 'Declined',
      deleted: 'Deleted',
      edit_requested: 'Edit Requested',
      edit_approved: 'Edit Approved',
      edit_declined: 'Edit Declined'
    };
    return labels[type] || type;
  };

  const getChangeTypeBadge = (type) => {
    const badges = {
      created: 'bg-blue-100 text-blue-800',
      updated: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      declined: 'bg-red-100 text-red-800',
      deleted: 'bg-gray-100 text-gray-800',
      edit_requested: 'bg-orange-100 text-orange-800',
      edit_approved: 'bg-green-100 text-green-800',
      edit_declined: 'bg-red-100 text-red-800'
    };
    return badges[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Booking History</h2>
              <p className="text-sm text-gray-600 mt-1">
                {historyBooking.subject} - {historyBooking.day} P{historyBooking.period}
              </p>
            </div>
            <button
              onClick={closeHistoryModal}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* History Timeline */}
        <div className="flex-1 overflow-y-auto p-6">
          {bookingHistoryEntries.length > 0 ? (
            <div className="space-y-4">
              {bookingHistoryEntries.map((entry, index) => (
                <div key={entry.id || index} className="flex">
                  {/* Timeline dot and line */}
                  <div className="flex flex-col items-center mr-4">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    {index < bookingHistoryEntries.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-300 mt-1"></div>
                    )}
                  </div>

                  {/* Entry content */}
                  <div className="flex-1 pb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getChangeTypeBadge(entry.changeType)}`}>
                            {getChangeTypeLabel(entry.changeType)}
                          </span>
                          <span className="ml-2 text-sm text-gray-600">
                            v{entry.version}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(entry.timestamp)}
                        </span>
                      </div>

                      {/* Changed by */}
                      <p className="text-sm text-gray-700 mb-2">
                        <span className="font-semibold">By:</span> {entry.changedBy || 'System'}
                      </p>

                      {/* Status */}
                      <p className="text-sm text-gray-700 mb-2">
                        <span className="font-semibold">Status:</span> {entry.status || 'N/A'}
                      </p>

                      {/* Change reason */}
                      {entry.changeReason && (
                        <p className="text-sm text-gray-700 mt-2">
                          <span className="font-semibold">Reason:</span> {entry.changeReason}
                        </p>
                      )}

                      {/* Booking data summary (if available) */}
                      {entry.bookingData && (
                        <details className="mt-3">
                          <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800">
                            View Details
                          </summary>
                          <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-x-auto">
                            {JSON.stringify(entry.bookingData, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No history available for this booking</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <button
            onClick={closeHistoryModal}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default HistoryModal;
