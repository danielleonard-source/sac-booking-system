import React, { useState } from 'react';
import { useDataStore } from '../../store/dataStore';
import { useUIStore } from '../../store/uiStore';

function LearnersList() {
  const { learners, deleteLearner } = useDataStore();
  const { openLearnerForm } = useUIStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState('all');
  // Helper to clean special conditions display
  const cleanConditions = (conditions) => {
    if (!conditions) return 'None';
    if (conditions === '[]' || conditions === '""' || conditions === '') return 'None';
    // Remove brackets and quotes, replace commas with semicolons for readability
    return conditions.replace(/[\[\]"]/g, '').replace(/,/g, '; ').trim() || 'None';
  };



  const filteredLearners = learners.filter(learner => {
    if (filterYear !== 'all' && learner.yearLevel !== filterYear) {
      return false;
    }
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const name = `${learner.firstName} ${learner.lastName}`.toLowerCase();
      return name.includes(search);
    }
    return true;
  });

  const yearLevels = ['7', '8', '9', '10', '11', '12', '13'];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Learners Management</h2>
        <button
          onClick={() => openLearnerForm()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm transition"
        >
          ➕ Add Learner
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 space-y-3">
        <input
          type="text"
          placeholder="Search learners..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        />
        
        <div className="flex space-x-2">
          <button
            onClick={() => setFilterYear('all')}
            className={`px-3 py-1 rounded ${filterYear === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            All Years
          </button>
          {yearLevels.map(year => (
            <button
              key={year}
              onClick={() => setFilterYear(year)}
              className={`px-3 py-1 rounded ${filterYear === year ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Y{year}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Student ID</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Year</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">SAC Conditions</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Student Email</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Parent Email</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredLearners.map(learner => (
              <tr key={learner.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{learner.firstName} {learner.lastName}</td>
                <td className="px-4 py-3 text-sm font-mono text-gray-600">{learner.studentId || '-'}</td>
                <td className="px-4 py-3">Year {learner.yearLevel}</td>
                <td className="px-4 py-3 text-sm">{cleanConditions(learner.specialConditions)}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{learner.studentEmail || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{learner.parentEmail || '-'}</td>
                <td className="px-4 py-3">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openLearnerForm(learner)}
                      className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded font-medium text-sm transition"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete ${learner.firstName} ${learner.lastName}?`)) {
                          deleteLearner(learner.id);
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
        Showing {filteredLearners.length} of {learners.length} learners
      </div>
    </div>
  );
}

export default LearnersList;
