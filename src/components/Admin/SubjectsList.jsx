import React, { useState } from 'react';
import { useDataStore } from '../../store/dataStore';
import { useUIStore } from '../../store/uiStore';

function SubjectsList() {
  const { subjects, deleteSubject } = useDataStore();
  const { openSubjectForm } = useUIStore();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter and sort subjects by year level
  const filteredSubjects = subjects
    .filter(subject => {
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return subject.name?.toLowerCase().includes(search) || 
               subject.code?.toLowerCase().includes(search) ||
               subject.ttCode?.toLowerCase().includes(search);
      }
      return true;
    })
    .sort((a, b) => {
      const levelA = parseInt(a.level) || 999;
      const levelB = parseInt(b.level) || 999;
      return levelA - levelB;
    });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Subjects Management</h2>
        <button
          onClick={() => openSubjectForm()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm transition"
        >
          ➕ Add Subject
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search subjects..."
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
              <th className="px-4 py-3 text-left text-sm font-semibold">Subject Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Code</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Year Level</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredSubjects.map(subject => (
              <tr key={subject.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{subject.name}</td>
                <td className="px-4 py-3 font-mono text-sm">{subject.ttCode || '-'}</td>
                <td className="px-4 py-3">{subject.level || 'All Years'}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => openSubjectForm(subject)}
                    className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded font-medium text-sm transition"
                  >
                    ✏️ Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Showing {filteredSubjects.length} of {subjects.length} subjects
      </div>
    </div>
  );
}

export default SubjectsList;
