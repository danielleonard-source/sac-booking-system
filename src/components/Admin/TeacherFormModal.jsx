import React, { useState, useEffect } from 'react';
import { useUIStore } from '../../store/uiStore';
import { useDataStore } from '../../store/dataStore';

function TeacherFormModal() {
  const { showTeacherForm, editingTeacher, closeTeacherForm, showNotification } = useUIStore();
  const { addTeacher, updateTeacher } = useDataStore();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    name: '',
    code: '',
    email: ''
  });

  useEffect(() => {
    if (showTeacherForm && editingTeacher) {
      // Edit mode
      setForm({
        firstName: editingTeacher.firstName || '',
        lastName: editingTeacher.lastName || '',
        name: editingTeacher.name || '',
        code: editingTeacher.code || '',
        email: editingTeacher.email || ''
      });
    } else if (showTeacherForm) {
      // New mode
      setForm({
        firstName: '',
        lastName: '',
        name: '',
        code: '',
        email: ''
      });
    }
  }, [showTeacherForm, editingTeacher]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingTeacher) {
        await updateTeacher(editingTeacher.id, form);
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

  if (!showTeacherForm) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">
            {editingTeacher ? '✏️ Edit Teacher' : '➕ Add New Teacher'}
          </h2>
          <button
            onClick={closeTeacherForm}
            className="text-white hover:bg-purple-800 rounded-full p-2 transition"
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
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., John Smith"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Display name for teacher</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => setForm(prev => ({ ...prev, firstName: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => setForm(prev => ({ ...prev, lastName: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Teacher Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => setForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono"
              placeholder="e.g., JSM"
              required
            />
            <p className="text-xs text-gray-500 mt-1">3-4 letter teacher code</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
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
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
            >
              {editingTeacher ? 'Update Teacher' : 'Add Teacher'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TeacherFormModal;
