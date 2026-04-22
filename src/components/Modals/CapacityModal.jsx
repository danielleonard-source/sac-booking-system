import React, { useState, useEffect } from 'react';
import { useUIStore } from '../../store/uiStore';
import { useDataStore } from '../../store/dataStore';

function CapacityModal() {
  const { capacityModalOpen, capacityModalData, closeCapacityModal, showNotification } = useUIStore();
  const { getMaxCapacity, getBookedSlotsCount, updateCapacity } = useDataStore();
  
  const [newCapacity, setNewCapacity] = useState(6);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (capacityModalOpen && capacityModalData) {
      const { date, day, period } = capacityModalData;
      const currentCapacity = getMaxCapacity(date, day, period);
      setNewCapacity(currentCapacity);
    }
  }, [capacityModalOpen, capacityModalData, getMaxCapacity]);

  if (!capacityModalOpen || !capacityModalData) return null;

  const { date, day, period } = capacityModalData;
  const currentCapacity = getMaxCapacity(date, day, period);
  const bookedCount = getBookedSlotsCount(date, day, period);

  const handleSave = async () => {
    if (newCapacity < bookedCount) {
      showNotification(
        `Cannot set capacity to ${newCapacity}. There are already ${bookedCount} bookings.`,
        'error'
      );
      return;
    }

    if (newCapacity < 1 || newCapacity > 20) {
      showNotification('Capacity must be between 1 and 20', 'error');
      return;
    }

    setLoading(true);
    try {
      await updateCapacity(date, day, period, newCapacity);
      showNotification('Capacity updated successfully', 'success');
      closeCapacityModal();
    } catch (error) {
      showNotification('Failed to update capacity: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const availableAfterChange = newCapacity - bookedCount;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
        
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">📊 Adjust Capacity</h2>
          <button
            onClick={closeCapacityModal}
            className="text-white hover:bg-blue-700 rounded-full p-2 transition"
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

          {/* Current Status */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">Current Status:</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>Current Capacity:</strong> {currentCapacity} learners</p>
              <p><strong>Currently Booked:</strong> {bookedCount} learners</p>
              <p><strong>Available Slots:</strong> {currentCapacity - bookedCount} learners</p>
            </div>
          </div>

          {/* Capacity Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              New Capacity <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setNewCapacity(Math.max(1, newCapacity - 1))}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 font-bold"
                disabled={loading || newCapacity <= 1}
              >
                −
              </button>
              <input
                type="number"
                min="1"
                max="20"
                value={newCapacity}
                onChange={(e) => setNewCapacity(parseInt(e.target.value) || 1)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-center text-2xl font-bold focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <button
                onClick={() => setNewCapacity(Math.min(20, newCapacity + 1))}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 font-bold"
                disabled={loading || newCapacity >= 20}
              >
                +
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Minimum: {bookedCount} (current bookings) • Maximum: 20
            </p>
          </div>

          {/* Preview */}
          <div className={`mb-6 p-4 rounded-lg border ${
            availableAfterChange >= 0 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <h3 className={`font-semibold mb-2 ${
              availableAfterChange >= 0 ? 'text-green-800' : 'text-red-800'
            }`}>
              After Change:
            </h3>
            <div className={`text-sm space-y-1 ${
              availableAfterChange >= 0 ? 'text-green-700' : 'text-red-700'
            }`}>
              <p><strong>New Capacity:</strong> {newCapacity} learners</p>
              <p><strong>Booked:</strong> {bookedCount} learners</p>
              <p><strong>Available:</strong> {availableAfterChange} learners</p>
            </div>
          </div>

          {/* Warning if trying to reduce below bookings */}
          {newCapacity < bookedCount && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>❌ Error:</strong> Cannot set capacity below current bookings ({bookedCount}).
                You must cancel some bookings first.
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={closeCapacityModal}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={loading || newCapacity < bookedCount || newCapacity < 1 || newCapacity > 20}
            >
              {loading ? 'Saving...' : '💾 Save Capacity'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CapacityModal;
