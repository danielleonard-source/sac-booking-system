import React, { useState, useEffect } from 'react';
import { useUIStore } from '../../store/uiStore';
import { useDataStore } from '../../store/dataStore';

function RWFormModal() {
  const { rwFormOpen, editingItem, closeRWForm, showNotification } = useUIStore();
  const { addReaderWriter, updateReaderWriter } = useDataStore();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    daysAvailable: '',
    employmentType: 'casual' // NEW FIELD - defaults to casual
  });

  useEffect(() => {
    if (rwFormOpen && editingItem) {
      // Edit mode
      setForm({
        firstName: editingItem.firstName || '',
        lastName: editingItem.lastName || '',
        email: editingItem.email || '',
        daysAvailable: editingItem.daysAvailable || '',
        employmentType: editingItem.employmentType || 'casual' // NEW - default to casual if not set
      });
    } else if (rwFormOpen) {
      // New mode
      setForm({
        firstName: '',
        lastName: '',
        email: '',
        daysAvailable: '',
        employmentType: 'casual' // NEW - default to casual
      });
    }
  }, [rwFormOpen, editingItem]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingItem) {
        await updateReaderWriter(editingItem.id, form);
        showNotification('Reader/Writer updated successfully', 'success');
      } else {
        await addReaderWriter(form);
        showNotification('Reader/Writer added successfully', 'success');
      }
      
      closeRWForm();
    } catch (error) {
      showNotification('Failed to save reader/writer: ' + error.message, 'error');
    }
  };

  if (!rwFormOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">
            {editingItem ? '✏️ Edit Reader/Writer' : '➕ Add New Reader/Writer'}
          </h2>
          <button
            onClick={closeRWForm}
            className="text-white hover:bg-green-800 rounded-full p-2 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => setForm(prev => ({ ...prev, firstName: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => setForm(prev => ({ ...prev, lastName: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="rw@beth.school.nz"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Days Available
            </label>
            <input
              type="text"
              value={form.daysAvailable}
              onChange={(e) => setForm(prev => ({ ...prev, daysAvailable: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="e.g., Monday, Wednesday, Friday"
            />
            <p className="text-xs text-gray-500 mt-1">Days this R/W is available to assist</p>
          </div>

          {/* NEW FIELD - Employment Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Employment Type <span className="text-red-500">*</span>
            </label>
            <select
              value={form.employmentType}
              onChange={(e) => setForm(prev => ({ ...prev, employmentType: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="casual">Casual</option>
              <option value="permanent">Permanent</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Select employment status for budget tracking</p>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={closeRWForm}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
            >
              {editingItem ? 'Update Reader/Writer' : 'Add Reader/Writer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RWFormModal;
