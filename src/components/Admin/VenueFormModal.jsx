import React, { useState, useEffect } from 'react';
import { useUIStore } from '../../store/uiStore';
import { useDataStore } from '../../store/dataStore';

function VenueFormModal() {
  const { showVenueForm, editingVenue, closeVenueForm, showNotification } = useUIStore();
  const { addVenue, updateVenue } = useDataStore();

  const [form, setForm] = useState({
    name: '',
    capacity: '',
    description: ''
  });

  useEffect(() => {
    if (showVenueForm && editingVenue) {
      // Edit mode
      setForm({
        name: editingVenue.name || '',
        capacity: editingVenue.capacity || '',
        description: editingVenue.description || ''
      });
    } else if (showVenueForm) {
      // New mode
      setForm({
        name: '',
        capacity: '',
        description: ''
      });
    }
  }, [showVenueForm, editingVenue]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingVenue) {
        await updateVenue(editingVenue.id, form);
        showNotification('Venue updated successfully', 'success');
      } else {
        await addVenue(form);
        showNotification('Venue added successfully', 'success');
      }
      closeVenueForm();
    } catch (error) {
      showNotification('Failed to save venue: ' + error.message, 'error');
    }
  };

  if (!showVenueForm) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">
            {editingVenue ? '✏️ Edit Venue' : '➕ Add New Venue'}
          </h2>
          <button
            onClick={closeVenueForm}
            className="text-white hover:bg-indigo-800 rounded-full p-2 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Venue Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Library, Q110, Hall"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Capacity
            </label>
            <input
              type="number"
              value={form.capacity}
              onChange={(e) => setForm(prev => ({ ...prev, capacity: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., 30"
              min="1"
            />
            <p className="text-xs text-gray-500 mt-1">Maximum number of learners this venue can accommodate</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Additional details about this venue..."
              rows="3"
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={closeVenueForm}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
            >
              {editingVenue ? 'Update Venue' : 'Add Venue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default VenueFormModal;
