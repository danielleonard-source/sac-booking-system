import React, { useState } from 'react';
import { useDataStore } from '../../store/dataStore';
import { useUIStore } from '../../store/uiStore';

function TeachersList() {
  const { teachers, deleteTeacher } = useDataStore();
  const { openTeacherForm } = useUIStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTeachers = teachers.filter(teacher => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const name = teacher.name?.toLowerCase() || '';
      const email = teacher.email?.toLowerCase() || '';
      const code = teacher.code?.toLowerCase() || '';
      return name.includes(search) || email.includes(search) || code.includes(search);
    }
    return true;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Teachers Management</h2>
        <button
          onClick={() => openTeacherForm()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm transition"
        >
          ➕ Add Teacher
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search teachers by name, email, or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Code</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredTeachers.map(teacher => (
              <tr key={teacher.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{teacher.name}</td>
                <td className="px-4 py-3 font-mono">{teacher.code}</td>
                <td className="px-4 py-3 text-sm">{teacher.email}</td>
                <td className="px-4 py-3">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openTeacherForm(teacher)}
                      className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded font-medium text-sm transition"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete teacher ${teacher.name}?`)) {
                          deleteTeacher(teacher.id);
                        }
                      }}
                      className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded font-medium text-sm transition"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Showing {filteredTeachers.length} of {teachers.length} teachers
      </div>
    </div>
  );
}

export default TeachersList;
