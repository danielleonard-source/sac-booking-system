import React, { useState, useEffect } from 'react';
import { useUIStore } from '../../store/uiStore';
import { useDataStore } from '../../store/dataStore';

function LearnerFormModal() {
  const { learnerFormOpen, editingItem, closeLearnerForm, showNotification } = useUIStore();
  const { addLearner, updateLearner } = useDataStore();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    yearLevel: '',
    email: '',
    parentEmail: '',
    studentId: '',
    sacConditions: '',
    isDeclined: false
  });

  useEffect(() => {
    if (learnerFormOpen && editingItem) {
      // Edit mode - pre-fill form
      setForm({
        firstName: editingItem.firstName || '',
        lastName: editingItem.lastName || '',
        yearLevel: editingItem.yearLevel?.toString() || '',
        email: editingItem.email || '',
        parentEmail: editingItem.parentEmail || '',
        studentId: editingItem.studentId || '',
        sacConditions: editingItem.sacConditions || '',
        isDeclined: editingItem.isDeclined || false
      });
    } else if (learnerFormOpen) {
      // New mode - reset form
      setForm({
        firstName: '',
        lastName: '',
        yearLevel: '',
        email: '',
        parentEmail: '',
        studentId: '',
        sacConditions: '',
        isDeclined: false
      });
    }
  }, [learnerFormOpen, editingItem]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const learnerData = {
        ...form,
        yearLevel: parseInt(form.yearLevel)
      };

      if (editingItem) {
        await updateLearner(editingItem.id, learnerData);
        showNotification('Learner updated successfully', 'success');
      } else {
        await addLearner(learnerData);
        showNotification('Learner added successfully', 'success');
      }
      
      closeLearnerForm();
    } catch (error) {
      showNotification('Failed to save learner: ' + error.message, 'error');
    }
  };

  if (!learnerFormOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center sticky top-0">
          <h2 className="text-2xl font-bold text-white">
            {editingItem ? '✏️ Edit Learner' : '➕ Add New Learner'}
          </h2>
          <button
            onClick={closeLearnerForm}
            className="text-white hover:bg-blue-800 rounded-full p-2 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => setForm(prev => ({ ...prev, firstName: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Year Level and Student ID */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Year Level <span className="text-red-500">*</span>
              </label>
              <select
                value={form.yearLevel}
                onChange={(e) => setForm(prev => ({ ...prev, yearLevel: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Year Level</option>
                {[7, 8, 9, 10, 11, 12, 13].map(year => (
                  <option key={year} value={year}>Year {year}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Student ID
              </label>
              <input
                type="text"
                value={form.studentId}
                onChange={(e) => setForm(prev => ({ ...prev, studentId: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Email Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Student Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Parent Email
              </label>
              <input
                type="email"
                value={form.parentEmail}
                onChange={(e) => setForm(prev => ({ ...prev, parentEmail: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* SAC Conditions */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              SAC Conditions
            </label>
            <textarea
              value={form.sacConditions}
              onChange={(e) => setForm(prev => ({ ...prev, sacConditions: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="e.g., Reader/Writer, Extra Time, Separate Room"
            />
          </div>

          {/* Is Declined */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isDeclined"
              checked={form.isDeclined}
              onChange={(e) => setForm(prev => ({ ...prev, isDeclined: e.target.checked }))}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isDeclined" className="ml-2 text-sm text-gray-700">
              SAC Declined
            </label>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={closeLearnerForm}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              {editingItem ? 'Update Learner' : 'Add Learner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LearnerFormModal;
