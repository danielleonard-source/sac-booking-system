import React, { useState } from 'react';
import { useDataStore } from '../../store/dataStore';
import { useUIStore } from '../../store/uiStore';

function VenuesList() {
  const { venues, deleteVenue } = useDataStore();
  const { openVenueForm } = useUIStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVenues = venues.filter(venue => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return venue.name?.toLowerCase().includes(search);
    }
    return true;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Venues Management</h2>
        <button
          onClick={() => openVenueForm()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm transition"
        >
          ➕ Add Venue
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search venues..."
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
              <th className="px-4 py-3 text-left text-sm font-semibold">Capacity</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Description</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredVenues.map(venue => (
              <tr key={venue.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold">{venue.name}</td>
                <td className="px-4 py-3">{venue.capacity || 'N/A'}</td>
                <td className="px-4 py-3 text-sm">{venue.description || '-'}</td>
                <td className="px-4 py-3">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openVenueForm(venue)}
                      className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded font-medium text-sm transition"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete venue ${venue.name}?`)) {
                          deleteVenue(venue.id);
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
        Showing {filteredVenues.length} of {venues.length} venues
      </div>
    </div>
  );
}

export default VenuesList;
