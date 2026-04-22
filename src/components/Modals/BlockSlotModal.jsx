import React, { useState } from 'react';
import { useUIStore } from '../../store/uiStore';
import { useDataStore } from '../../store/dataStore';

function BlockSlotModal() {
  const { blockSlotModalOpen, blockSlotModalData, closeBlockSlotModal, showNotification } = useUIStore();
  const { blockSlot, blockedSlots } = useDataStore();
  
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  if (!blockSlotModalOpen || !blockSlotModalData) return null;

  const { date, day, period } = blockSlotModalData;

  const handleBlock = async () => {
    if (!reason.trim()) {
      showNotification('Please provide a reason for blocking this slot', 'error');
      return;
    }

    setLoading(true);
    try {
      await blockSlot({ date, day, period }, reason);
      showNotification('Slot blocked successfully', 'success');
      closeBlockSlotModal();
      setReason('');
    } catch (error) {
      showNotification('Failed to block slot: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
        
        {/* Header */}
        <div className="bg-red-600 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">🚫 Block Slot</h2>
          <button
            onClick={closeBlockSlotModal}
            className="text-white hover:bg-red-700 rounded-full p-2 transition"
            disabled={loading}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Slot Information */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-2">Slot Details:</h3>
            <div className="text-sm text-gray-700 space-y-1">
              <p><strong>Date:</strong> {date}</p>
              <p><strong>Day:</strong> {day}</p>
              <p><strong>Period:</strong> {period}</p>
            </div>
          </div>

          {/* Reason Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Reason for Blocking <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              rows="4"
              placeholder="e.g., Staff meeting, School assembly, Venue unavailable..."
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              This reason will be visible to teachers when they try to book this slot.
            </p>
          </div>

          {/* Warning */}
          <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Warning:</strong> Blocking this slot will prevent any bookings for this time. 
              Existing bookings will not be affected.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={closeBlockSlotModal}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleBlock}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={loading || !reason.trim()}
            >
              {loading ? 'Blocking...' : '🚫 Block Slot'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlockSlotModal;
