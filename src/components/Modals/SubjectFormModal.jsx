import React, { useState, useEffect } from 'react';
import { useUIStore } from '../../store/uiStore';
import { useDataStore } from '../../store/dataStore';

function SubjectFormModal() {
  const { subjectFormOpen, editingItem, closeSubjectForm, showNotification } = useUIStore();
  const { addSubject, updateSubject } = useDataStore();

  const [form, setForm] = useState({
    name: '',
    code: '',
    yearLevel: ''
  });

  useEffect(() => {
    if (subjectFormOpen && editingItem) {
      // Edit mode
      setForm({
        name: editingItem.name || '',
        code: editingItem.code || editingItem.ttCode || '',  // Fallback to ttCode if code missing
        yearLevel: editingItem.yearLevel || ''
      });
    } else if (subjectFormOpen) {
      // New mode
      setForm({
        name: '',
        code: '',
        yearLevel: ''
      });
    }
  }, [subjectFormOpen, editingItem]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingItem) {
        await updateSubject(editingItem.id, form);
        showNotification('Subject updated successfully', 'success');
      } else {
        await addSubject(form);
        showNotification('Subject added successfully', 'success');
      }
      
      closeSubjectForm();
    } catch (error) {
      showNotification('Failed to save subject: ' + error.message, 'error');
    }
  };

  if (!subjectFormOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">
            {editingItem ? '✏️ Edit Subject' : '➕ Add New Subject'}
          </h2>
          <button
            onClick={closeSubjectForm}
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
              Subject Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Mathematics, English, Science"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Subject Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => setForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono"
              placeholder="e.g., 9MAT, 13BIO, ENG"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Year Level
            </label>
            <select
              value={form.yearLevel}
              onChange={(e) => setForm(prev => ({ ...prev, yearLevel: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Year Levels</option>
              {[7, 8, 9, 10, 11, 12, 13].map(year => (
                <option key={year} value={year}>Year {year}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Leave blank for all year levels</p>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={closeSubjectForm}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
            >
              {editingItem ? 'Update Subject' : 'Add Subject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SubjectFormModal;
