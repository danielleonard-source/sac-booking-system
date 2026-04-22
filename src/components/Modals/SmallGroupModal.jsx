import React, { useState, useEffect } from 'react';
import { useUIStore } from '../../store/uiStore';
import { useDataStore } from '../../store/dataStore';
import { findReaderWriterById, findVenueById, findLearnerById } from '../../utils/helpers';

function SmallGroupModal() {
  const { smallGroupModalOpen, selectedBooking, closeSmallGroupModal, showNotification } = useUIStore();
  const { updateBooking, readerWriters, venues, learners } = useDataStore();
  
  const [smallGroups, setSmallGroups] = useState([]);
  const [selectedLearners, setSelectedLearners] = useState([]);
  const [groupRW, setGroupRW] = useState('');
  const [groupVenue, setGroupVenue] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (smallGroupModalOpen && selectedBooking) {
      // Load existing small groups
      let existingGroups = [];
      if (selectedBooking.smallGroups) {
        try {
          if (typeof selectedBooking.smallGroups === 'string') {
            existingGroups = JSON.parse(selectedBooking.smallGroups);
          } else if (Array.isArray(selectedBooking.smallGroups)) {
            existingGroups = selectedBooking.smallGroups;
          }
        } catch (e) {
          console.error('Error parsing existing small groups:', e);
        }
      }
      setSmallGroups(existingGroups);
      setSelectedLearners([]);
      setGroupRW('');
      setGroupVenue('');
    }
  }, [smallGroupModalOpen, selectedBooking]);

  if (!smallGroupModalOpen || !selectedBooking) return null;

  // Get all learner IDs from the booking
  const allLearnerIds = Array.isArray(selectedBooking.learners) ? selectedBooking.learners : [];
  
  // Get learners already in groups
  const learnersInGroups = new Set();
  smallGroups.forEach(group => {
    if (Array.isArray(group.learners)) {
      group.learners.forEach(id => learnersInGroups.add(id));
    }
  });
  
  // Available learners (not yet in any group)
  const availableLearners = allLearnerIds.filter(id => !learnersInGroups.has(id));

  const handleToggleLearner = (learnerId) => {
    setSelectedLearners(prev => 
      prev.includes(learnerId)
        ? prev.filter(id => id !== learnerId)
        : [...prev, learnerId]
    );
  };

  const handleCreateGroup = () => {
    if (selectedLearners.length === 0) {
      showNotification('Please select at least one learner for the group', 'error');
      return;
    }

    const newGroup = {
      id: `group_${Date.now()}`,
      learners: selectedLearners,
      readerWriter: groupRW || null,
      venue: groupVenue || null
    };

    setSmallGroups([...smallGroups, newGroup]);
    setSelectedLearners([]);
    setGroupRW('');
    setGroupVenue('');
    showNotification(`Small group created with ${selectedLearners.length} learners`, 'success');
  };

  const handleRemoveGroup = (groupId) => {
    setSmallGroups(smallGroups.filter(g => g.id !== groupId));
    showNotification('Small group removed', 'success');
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updatedBooking = {
        ...selectedBooking,
        smallGroups: smallGroups
      };
      
      await updateBooking(selectedBooking.id, updatedBooking);
      showNotification('Small groups saved successfully', 'success');
      closeSmallGroupModal();
    } catch (error) {
      showNotification('Failed to save small groups: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getLearnerName = (learnerId) => {
    const learner = findLearnerById(learners, learnerId);
    if (learner) {
      return `${learner.firstName} ${learner.lastName}`;
    }
    return learnerId.substring(0, 15) + '...';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="bg-purple-600 px-6 py-4 flex justify-between items-center sticky top-0">
          <h2 className="text-xl font-bold text-white">👥 Manage Small Groups</h2>
          <button
            onClick={closeSmallGroupModal}
            className="text-white hover:bg-purple-700 rounded-full p-2 transition"
            disabled={loading}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Booking Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-2">Booking Details:</h3>
            <div className="text-sm text-gray-700 space-y-1">
              <p><strong>Date:</strong> {selectedBooking.date} ({selectedBooking.day})</p>
              <p><strong>Period:</strong> {selectedBooking.period}</p>
              <p><strong>Subject:</strong> {selectedBooking.subject}</p>
              <p><strong>Total Learners:</strong> {allLearnerIds.length}</p>
            </div>
          </div>

          {/* Slot Impact */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">📊 Capacity Impact:</h3>
            <div className="text-sm text-blue-700">
              <p><strong>Current:</strong> {allLearnerIds.length} learners = {allLearnerIds.length} slots</p>
              <p><strong>After grouping:</strong> {smallGroups.length} groups + {availableLearners.length - selectedLearners.length} individuals = {smallGroups.length + availableLearners.length - selectedLearners.length} slots</p>
              {smallGroups.length > 0 && (
                <p className="mt-2 text-green-700 font-semibold">
                  ✅ Saves {allLearnerIds.length - (smallGroups.length + availableLearners.length)} slots
                </p>
              )}
            </div>
          </div>

          {/* Existing Groups */}
          {smallGroups.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">📦 Current Small Groups:</h3>
              <div className="space-y-3">
                {smallGroups.map(group => {
                  const rwName = group.readerWriter ? findReaderWriterById(readerWriters, group.readerWriter)?.name || group.readerWriter : 'Not assigned';
                  const venueName = group.venue ? findVenueById(venues, group.venue)?.name || group.venue : 'Not assigned';
                  
                  return (
                    <div key={group.id} className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-purple-900">
                            Group {group.id.substring(6, 12)} ({group.learners.length} learners)
                          </p>
                          <p className="text-sm text-purple-700 mt-1">
                            <strong>R/W:</strong> {rwName}
                          </p>
                          <p className="text-sm text-purple-700">
                            <strong>Venue:</strong> {venueName}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveGroup(group.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                          disabled={loading}
                        >
                          Remove
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {group.learners.map(learnerId => (
                          <span key={learnerId} className="px-2 py-1 bg-purple-200 text-purple-800 rounded text-xs">
                            {getLearnerName(learnerId)}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Create New Group */}
          {availableLearners.length > 0 && (
            <div className="mb-6 p-4 border-2 border-dashed border-gray-300 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">➕ Create New Small Group:</h3>
              
              {/* Select Learners */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Learners ({selectedLearners.length} selected):
                </label>
                <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2">
                  {availableLearners.map(learnerId => (
                    <label key={learnerId} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={selectedLearners.includes(learnerId)}
                        onChange={() => handleToggleLearner(learnerId)}
                        className="mr-3 w-4 h-4"
                      />
                      <span className="text-sm">{getLearnerName(learnerId)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Assign R/W (Optional) */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reader/Writer (Optional):
                </label>
                <select
                  value={groupRW}
                  onChange={(e) => setGroupRW(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">-- Assign later --</option>
                  {readerWriters.map(rw => (
                    <option key={rw.id} value={rw.id}>{rw.name}</option>
                  ))}
                </select>
              </div>

              {/* Assign Venue (Optional) */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Venue (Optional):
                </label>
                <select
                  value={groupVenue}
                  onChange={(e) => setGroupVenue(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">-- Assign later --</option>
                  {venues.map(venue => (
                    <option key={venue.id} value={venue.id}>{venue.name}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleCreateGroup}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold disabled:bg-gray-300"
                disabled={selectedLearners.length === 0}
              >
                ➕ Create Group ({selectedLearners.length} learners)
              </button>
            </div>
          )}

          {availableLearners.length === 0 && smallGroups.length === 0 && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-600">
              No learners available to group
            </div>
          )}

          {/* Buttons */}
          <div className="flex space-x-3 pt-4 border-t">
            <button
              onClick={closeSmallGroupModal}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Saving...' : '💾 Save Small Groups'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SmallGroupModal;
