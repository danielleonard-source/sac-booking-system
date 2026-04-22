import React, { useState } from 'react';
import { useDataStore } from '../../store/dataStore';
import { useUIStore } from '../../store/uiStore';

function ReaderWritersList() {
  const { readerWriters, deleteReaderWriter } = useDataStore();
  const { openRWForm } = useUIStore();
  const [searchTerm, setSearchTerm] = useState('');

  // Helper to clean days available display
  const cleanDays = (days) => {
    if (!days) return 'Not specified';
    if (days === '[]' || days === '""' || days === '') return 'Not specified';
    // Remove brackets and quotes, replace commas with semicolons
    return days.replace(/[\[\]"]/g, '').replace(/,/g, '; ').trim() || 'Not specified';
  };

  const filteredRW = readerWriters.filter(rw => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const firstName = rw.firstName?.toLowerCase() || '';
      const lastName = rw.lastName?.toLowerCase() || '';
      const name = `${firstName} ${lastName}`.toLowerCase();
      const email = rw.email?.toLowerCase() || '';
      return name.includes(search) || email.includes(search);
    }
    return true;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Reader/Writers Management</h2>
        <button
          onClick={() => openRWForm()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm transition"
        >
          ➕ Add Reader/Writer
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search reader/writers..."
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
              <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Days Available</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Employment Type</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredRW.map(rw => (
              <tr key={rw.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{rw.firstName} {rw.lastName}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{rw.email || '-'}</td>
                <td className="px-4 py-3 text-sm">
                  <span className="text-gray-700">{cleanDays(rw.daysAvailable)}</span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    (rw.employmentType || 'casual') === 'permanent' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {(rw.employmentType || 'casual') === 'permanent' ? 'Permanent' : 'Casual'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => openRWForm(rw)}
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
        Showing {filteredRW.length} of {readerWriters.length} reader/writers
      </div>
    </div>
  );
}

export default ReaderWritersList;
