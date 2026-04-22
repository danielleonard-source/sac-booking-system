import React, { useState, useEffect } from 'react';
import { useDataStore } from '../../store/dataStore';

function RWAssignmentModal({ booking, onClose, onConfirm }) {
  console.log('🟡 RWAssignmentModal rendered with booking:', booking?.id);
  console.log('🟡 onConfirm function:', onConfirm);
  const { readerWriters, venues, learners, bookings } = useDataStore();
  const [assignments, setAssignments] = useState({});
  const [selectedLearners, setSelectedLearners] = useState({});
  const [groupName, setGroupName] = useState('');
  
  // Get learners for this booking
  const bookingLearners = learners.filter(l => 
    booking.learners.includes(l.id) && 
    !booking.declinedSACLearners?.includes(l.id)
  );

  // Initialize assignments
  useEffect(() => {
    const initial = {};
    bookingLearners.forEach(learner => {
      initial[learner.id] = {
        readerWriter: '',
        venue: '',
        type: 'individual' // 'individual' or 'group'
      };
    });
    setAssignments(initial);
  }, []);

  // Get available R/W for this slot (not already assigned)
  const getAvailableRW = () => {
    const usedRW = new Set();
    
    // Find all confirmed bookings for same date/period
    bookings.forEach(b => {
      if (b.id === booking.id) return; // Skip current booking
      if (b.status !== 'confirmed') return;
      if (b.date !== booking.date || String(b.period) !== String(booking.period)) return;
      
      // Add all assigned R/W to usedRW set
      const rwAssignments = b.readerWriterAssignments || {};
      Object.values(rwAssignments).forEach(assignment => {
        if (assignment.readerWriter) usedRW.add(assignment.readerWriter);
      });
    });
    
    return readerWriters.filter(rw => !usedRW.has(rw.id));
  };

  // Get available venues for this slot
  const getAvailableVenues = () => {
    const usedVenues = new Set();
    
    bookings.forEach(b => {
      if (b.id === booking.id) return;
      if (b.status !== 'confirmed') return;
      if (b.date !== booking.date || String(b.period) !== String(booking.period)) return;
      
      const rwAssignments = b.readerWriterAssignments || {};
      Object.values(rwAssignments).forEach(assignment => {
        if (assignment.venue) usedVenues.add(assignment.venue);
      });
    });
    
    return venues.filter(v => !usedVenues.has(v.id));
  };

  const availableRW = getAvailableRW();
  const availableVenues = getAvailableVenues();

  // Handle individual assignment
  const handleIndividualAssignment = (learnerId, field, value) => {
    setAssignments(prev => ({
      ...prev,
      [learnerId]: {
        ...prev[learnerId],
        [field]: value,
        type: 'individual'
      }
    }));
  };

  // Handle group assignment
  const handleCreateGroup = () => {
    const selectedIds = Object.keys(selectedLearners).filter(id => selectedLearners[id]);
    
    if (selectedIds.length < 2) {
      alert('Select at least 2 learners for a small group');
      return;
    }

    // Assign same R/W and venue to all selected learners
    const groupId = `group_${Date.now()}`;
    const newAssignments = { ...assignments };
    
    selectedIds.forEach(learnerId => {
      newAssignments[learnerId] = {
        ...newAssignments[learnerId],
        type: 'group',
        groupId,
        groupName: groupName || `Group ${Math.floor(Math.random() * 1000)}`
      };
    });

    setAssignments(newAssignments);
    setSelectedLearners({});
    setGroupName('');
  };

  // Validate and submit
  const handleSubmit = () => {
    alert('handleSubmit called!');
    console.log('🟡 RWAssignmentModal handleSubmit called');
    // Check all learners have R/W and venue assigned
    const unassigned = bookingLearners.filter(l => 
      !assignments[l.id]?.readerWriter || !assignments[l.id]?.venue
    );

    if (unassigned.length > 0) {
      alert(`Please assign R/W and venue for: ${unassigned.map(l => `${l.firstName} ${l.lastName}`).join(', ')}`);
      return;
    }

    // Build readerWriterAssignments object
    const rwAssignments = {};
    const groups = {};

    Object.entries(assignments).forEach(([learnerId, assignment]) => {
      if (assignment.type === 'group') {
        // Group learners together
        if (!groups[assignment.groupId]) {
          groups[assignment.groupId] = {
            learners: [],
            readerWriter: assignment.readerWriter,
            venue: assignment.venue,
            groupName: assignment.groupName
          };
        }
        groups[assignment.groupId].learners.push(learnerId);
      } else {
        // Individual assignment
        rwAssignments[learnerId] = {
          learners: [learnerId],
          readerWriter: assignment.readerWriter,
          venue: assignment.venue,
          type: 'individual'
        };
      }
    });

    // Add groups to assignments
    Object.values(groups).forEach(group => {
      const groupKey = group.learners.join('_');
      rwAssignments[groupKey] = {
        learners: group.learners,
        readerWriter: group.readerWriter,
        venue: group.venue,
        type: 'group',
        groupName: group.groupName
      };
    });

    onConfirm(rwAssignments);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 flex justify-between items-center sticky top-0">
          <h2 className="text-xl font-bold text-white">Assign Reader/Writers & Venues</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl">×</button>
        </div>

        <div className="p-6">
          {/* Available Resources */}
          <div className="mb-6 p-4 bg-blue-50 rounded">
            <p className="text-sm font-semibold text-blue-900">Available for this slot:</p>
            <p className="text-sm text-blue-700">
              📚 {availableRW.length} Reader/Writers • 🏠 {availableVenues.length} Venues
            </p>
          </div>

          {/* Group Creation */}
          <div className="mb-6 p-4 border-2 border-dashed border-purple-300 rounded">
            <h3 className="font-bold mb-2 text-purple-900">Create Small Group</h3>
            <p className="text-sm text-gray-600 mb-3">Select learners to group together (share 1 R/W)</p>
            
            <div className="space-y-2 mb-3">
              {bookingLearners.map(learner => (
                <label key={learner.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedLearners[learner.id] || false}
                    onChange={(e) => setSelectedLearners(prev => ({
                      ...prev,
                      [learner.id]: e.target.checked
                    }))}
                    disabled={assignments[learner.id]?.type === 'group'}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{learner.firstName} {learner.lastName}</span>
                  {assignments[learner.id]?.type === 'group' && (
                    <span className="text-xs text-purple-600">(in {assignments[learner.id].groupName})</span>
                  )}
                </label>
              ))}
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Group name (optional)"
                className="flex-1 px-3 py-2 border rounded"
              />
              <button
                onClick={handleCreateGroup}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Create Group
              </button>
            </div>
          </div>

          {/* Individual Assignments */}
          <h3 className="font-bold mb-3">Assign Reader/Writers & Venues</h3>
          <div className="space-y-4">
            {bookingLearners.map(learner => {
              const assignment = assignments[learner.id] || {};
              const isInGroup = assignment.type === 'group';

              return (
                <div key={learner.id} className={`p-4 border rounded ${isInGroup ? 'bg-purple-50 border-purple-300' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-medium">{learner.firstName} {learner.lastName}</p>
                      {isInGroup && (
                        <span className="text-xs text-purple-600">Small Group: {assignment.groupName}</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Reader/Writer</label>
                      <select
                        value={assignment.readerWriter || ''}
                        onChange={(e) => handleIndividualAssignment(learner.id, 'readerWriter', e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                        disabled={isInGroup}
                      >
                        <option value="">Select R/W...</option>
                        {availableRW.map(rw => (
                          <option key={rw.id} value={rw.id}>
                            {rw.firstName} {rw.lastName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Venue</label>
                      <select
                        value={assignment.venue || ''}
                        onChange={(e) => handleIndividualAssignment(learner.id, 'venue', e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                        disabled={isInGroup}
                      >
                        <option value="">Select venue...</option>
                        {availableVenues.map(v => (
                          <option key={v.id} value={v.id}>
                            {v.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="mt-6 flex space-x-3">
            <button
              onClick={handleSubmit}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
            >
              Confirm & Approve Booking
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RWAssignmentModal;
