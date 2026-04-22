import React, { useState, useEffect } from 'react';
import { useUIStore } from '../../store/uiStore';
import { useDataStore } from '../../store/dataStore';

function LearnerFormModal() {
  const { showLearnerForm, editingLearner, closeLearnerForm, showNotification } = useUIStore();
  const { addLearner, updateLearner } = useDataStore();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    studentId: '',
    yearLevel: '7',
    specialConditions: '',
    studentEmail: '',
    parentEmail: '',
    subjects: ''
  });

  useEffect(() => {
    if (showLearnerForm && editingLearner) {
      // Edit mode - populate form
      setForm({
        firstName: editingLearner.firstName || '',
        lastName: editingLearner.lastName || '',
        studentId: editingLearner.studentId || '',
        yearLevel: editingLearner.yearLevel || '7',
        specialConditions: editingLearner.specialConditions || '',
        studentEmail: editingLearner.studentEmail || '',
        parentEmail: editingLearner.parentEmail || '',
        subjects: editingLearner.subjects || ''
      });
    } else if (showLearnerForm) {
      // New mode - reset form
      setForm({
        firstName: '',
        lastName: '',
        studentId: '',
        yearLevel: '7',
        specialConditions: '',
        studentEmail: '',
        parentEmail: '',
        subjects: ''
      });
    }
  }, [showLearnerForm, editingLearner]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingLearner) {
        await updateLearner(editingLearner.id, form);
        showNotification('Learner updated successfully', 'success');
      } else {
        await addLearner(form);
        showNotification('Learner added successfully', 'success');
      }
      closeLearnerForm();
    } catch (error) {
      showNotification('Failed to save learner: ' + error.message, 'error');
    }
  };

  if (!showLearnerForm) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center sticky top-0">
          <h2 className="text-2xl font-bold text-white">
            {editingLearner ? '✏️ Edit Learner' : '➕ Add New Learner'}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Student ID
              </label>
              <input
                type="text"
                value={form.studentId}
                onChange={(e) => setForm(prev => ({ ...prev, studentId: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 21072"
              />
            </div>

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
                {['7', '8', '9', '10', '11', '12', '13'].map(year => (
                  <option key={year} value={year}>Year {year}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              SAC Conditions
            </label>
            <input
              type="text"
              value={form.specialConditions}
              onChange={(e) => setForm(prev => ({ ...prev, specialConditions: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Reader, Writer, Extra Time"
            />
            <p className="text-xs text-gray-500 mt-1">Special Assessment Conditions for this learner</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Student Email
            </label>
            <input
              type="email"
              value={form.studentEmail}
              onChange={(e) => setForm(prev => ({ ...prev, studentEmail: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="student@beth.school.nz"
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
              placeholder="parent@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Subjects
            </label>
            <input
              type="text"
              value={form.subjects}
              onChange={(e) => setForm(prev => ({ ...prev, subjects: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 12MAT;12ENG;12SCI"
            />
            <p className="text-xs text-gray-500 mt-1">Subject codes separated by semicolons</p>
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
              {editingLearner ? 'Update Learner' : 'Add Learner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LearnerFormModal;
