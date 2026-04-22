import React, { useState, useEffect } from 'react';
import { useUIStore } from '../../store/uiStore';
import { useDataStore } from '../../store/dataStore';

function TeacherFormModal() {
  const { teacherFormOpen, editingItem, closeTeacherForm, showNotification } = useUIStore();
  const { addTeacher, updateTeacher } = useDataStore();

  const [form, setForm] = useState({
    name: '',
    code: '',
    email: ''
  });

  useEffect(() => {
    if (teacherFormOpen && editingItem) {
      // Edit mode
      setForm({
        name: editingItem.name || '',
        code: editingItem.code || '',
        email: editingItem.email || ''
      });
    } else if (teacherFormOpen) {
      // New mode
      setForm({
        name: '',
        code: '',
        email: ''
      });
    }
  }, [teacherFormOpen, editingItem]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingItem) {
        await updateTeacher(editingItem.id, form);
        showNotification('Teacher updated successfully', 'success');
      } else {
        await addTeacher(form);
        showNotification('Teacher added successfully', 'success');
      }
      
      closeTeacherForm();
    } catch (error) {
      showNotification('Failed to save teacher: ' + error.message, 'error');
    }
  };

  if (!teacherFormOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">
            {editingItem ? '✏️ Edit Teacher' : '➕ Add New Teacher'}
          </h2>
          <button
            onClick={closeTeacherForm}
            className="text-white hover:bg-blue-800 rounded-full p-2 transition"
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
              Teacher Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Hayley Aranas"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Teacher Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => setForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
              placeholder="e.g., ARA"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="teacher@beth.school.nz"
              required
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={closeTeacherForm}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              {editingItem ? 'Update Teacher' : 'Add Teacher'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TeacherFormModal;
