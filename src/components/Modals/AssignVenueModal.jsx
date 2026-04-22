import React, { useState } from 'react';
import { useDataStore } from '../../store/dataStore';
import { useUIStore } from '../../store/uiStore';

function AssignVenueModal() {
  const { venues, updateBooking } = useDataStore();
  const { assignVenueModalOpen, closeAssignVenueModal, selectedBooking, showNotification } = useUIStore();
  const [selectedVenue, setSelectedVenue] = useState('');

  if (!assignVenueModalOpen || !selectedBooking) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await updateBooking(selectedBooking.id, {
        ...selectedBooking,
        venue: selectedVenue
      });
      
      showNotification('Venue assigned successfully', 'success');
      closeAssignVenueModal();
    } catch (error) {
      showNotification('Failed to assign venue: ' + error.message, 'error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Assign Venue</h3>
          <button
            onClick={closeAssignVenueModal}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-600">
            <strong>{selectedBooking.subject}</strong> - {selectedBooking.date}
          </p>
          <p className="text-sm text-gray-600">
            {selectedBooking.day}, Period {selectedBooking.period}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Select Venue</label>
            <select
              value={selectedVenue}
              onChange={(e) => setSelectedVenue(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              required
            >
              <option value="">Choose a venue...</option>
              {venues.map(venue => (
                <option key={venue.id} value={venue.name}>
                  {venue.name} {venue.capacity && `(Capacity: ${venue.capacity})`}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={closeAssignVenueModal}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Assign Venue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AssignVenueModal;
