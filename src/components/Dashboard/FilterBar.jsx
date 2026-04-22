import React from 'react';
import { useDataStore } from '../../store/dataStore';
import useDashboardStore from '../../store/dashboardStore';

const FilterBar = () => {
  const subjects = useDataStore(state => state.subjects);
  const teachers = useDataStore(state => state.teachers);
  
  const {
    selectedTerm,
    selectedYearLevel,
    selectedSubject,
    selectedTeacher,
    setFilters,
    resetFilters
  } = useDashboardStore();

  const terms = [
    'Term 1 2026',
    'Term 2 2026',
    'Term 3 2026',
    'Term 4 2026',
    'Term 1 2025',
    'Term 2 2025',
    'Term 3 2025',
    'Term 4 2025'
  ];

  const yearLevels = ['All', '7', '8', '9', '10', '11', '12', '13'];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Term Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Term
          </label>
          <select
            value={selectedTerm}
            onChange={(e) => setFilters({ selectedTerm: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {terms.map(term => (
              <option key={term} value={term}>{term}</option>
            ))}
          </select>
        </div>

        {/* Year Level Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Year Level
          </label>
          <select
            value={selectedYearLevel}
            onChange={(e) => setFilters({ selectedYearLevel: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {yearLevels.map(year => (
              <option key={year} value={year}>
                {year === 'All' ? 'All Years' : `Year ${year}`}
              </option>
            ))}
          </select>
        </div>

        {/* Subject Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subject
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setFilters({ selectedSubject: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Subjects</option>
            {subjects.map(subject => (
              <option key={subject.code} value={subject.name}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        {/* Teacher Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teacher
          </label>
          <select
            value={selectedTeacher}
            onChange={(e) => setFilters({ selectedTeacher: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Teachers</option>
            {teachers.map(teacher => (
              <option key={teacher.id} value={teacher.name}>
                {teacher.name}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex items-end space-x-2">
          <button
            onClick={resetFilters}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            🔄 Reset
          </button>
          <button
            className="flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            📊 Export
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
