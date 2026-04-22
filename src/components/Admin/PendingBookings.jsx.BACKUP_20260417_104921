import React from 'react';
import { useDataStore } from '../../store/dataStore';
import { findLearnerById, findTeacherById, parseLearnersField } from '../../utils/helpers';
import RWAssignmentModal from './RWAssignmentModal';

function PendingBookings() {
  const [assigningBooking, setAssigningBooking] = React.useState(null);

  const { bookings, learners, teachers, readerWriters, venues, updateBookingStatus } = useDataStore();

  const pendingBookings = bookings
    .filter(b => b.status === 'pending')
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const handleApprove = (booking) => {
    console.log('🔵 handleApprove called with booking:', booking.id);
    console.log('🔵 Setting assigningBooking to:', booking);
    setAssigningBooking(booking);
    console.log('🔵 assigningBooking state should be set now');
  };

  const handleConfirmAssignment = async (rwAssignments) => {
    console.log('🟢 handleConfirmAssignment called with:', rwAssignments);
    console.log('🟢 assigningBooking.id:', assigningBooking.id);
    console.log('🟢 updateBookingStatus function:', updateBookingStatus);
    
    try {
      await updateBookingStatus(assigningBooking.id, 'confirmed', null, rwAssignments);
      console.log('🟢 updateBookingStatus completed');
      setAssigningBooking(null);
    } catch (error) {
      console.error('🔴 Error in handleConfirmAssignment:', error);
    }
  };

  const handleDecline = async (booking) => {
    const reason = prompt('Please provide a reason for declining:');
    if (reason) {
      await updateBookingStatus(booking.id, 'declined', reason);
    }
  };

  if (pendingBookings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">No pending bookings</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-bold">Pending Approvals</h3>
        <p className="text-sm text-gray-600">{pendingBookings.length} bookings awaiting approval</p>
      </div>

      <div className="space-y-4">
        {pendingBookings.map(booking => {
          // Parse learners
          const learnerIds = parseLearnersField(booking.learners);
          const bookingLearners = learnerIds
            .map(id => findLearnerById(learners, id))
            .filter(Boolean);

          // Parse reader/writers
          let rwAssignments = {};
          try {
            rwAssignments = typeof booking.readerWriters === 'string' 
              ? JSON.parse(booking.readerWriters) 
              : (booking.readerWriters || {});
          } catch (e) {
            rwAssignments = {};
          }

          // Get teacher
          const teacher = findTeacherById(teachers, booking.teacherId) || 
                          teachers.find(t => t.email === booking.teacherEmail);

          return (
            <div key={booking.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-400">
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-bold text-lg">{booking.subject}</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(booking.date).toLocaleDateString('en-NZ', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  <p className="text-sm text-gray-600">
                    {booking.day}, Period {booking.period} • Room {booking.room}
                  </p>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                  Pending
                </span>
              </div>

              {/* Teacher */}
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Teacher</p>
                  <p className="text-sm font-medium">
                    {teacher ? teacher.name : booking.teacher || 'Unknown'}
                  </p>
                  {booking.teacherEmail && (
                    <p className="text-xs text-gray-500">{booking.teacherEmail}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Year Level</p>
                  <p className="text-sm font-medium">Year {booking.yearLevel}</p>
                </div>
              </div>

              {/* Learners */}
              <div className="mb-3">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-2">
                  Learners ({bookingLearners.length})
                </p>
                <div className="space-y-2">
                  {bookingLearners.map(learner => {
                    // Check readerWriterAssignments (new format with NAMES)
                    let rwName = null;
                    let venueName = null;
                    
                    if (booking.readerWriterAssignments) {
                      // Check individual assignment
                      const individualAssignment = booking.readerWriterAssignments[learner.id];
                      if (individualAssignment) {
                        rwName = individualAssignment.readerWriter;
                        venueName = individualAssignment.venue;
                      } else {
                        // Check if in a group assignment
                        Object.values(booking.readerWriterAssignments).forEach(assignment => {
                          if (assignment.type === 'group' && assignment.learners?.includes(learner.id)) {
                            rwName = assignment.readerWriter;
                            venueName = assignment.venue;
                          }
                        });
                      }
                    }

                    return (
                      <div key={learner.id} className="bg-gray-50 rounded p-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">
                              {learner.firstName} {learner.lastName}
                              <span className="text-gray-500 text-xs ml-2">Y{learner.yearLevel}</span>
                            </p>
                            
                            {/* Student ID */}
                            {learner.studentId && (
                              <p className="text-xs text-gray-500">ID: {learner.studentId}</p>
                            )}

                            {/* SAC Conditions */}
                            {learner.sacConditions && (
                              <div className="mt-1">
                                <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                                  SAC: {learner.sacConditions}
                                </span>
                              </div>
                            )}

                            {/* Reader/Writer */}
                            {rwName && (
                              <div className="mt-1 space-x-2">
                                <span className="inline-block px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs">
                                  R/W: {rwName}
                                </span>
                                {venueName && (
                                  <span className="inline-block px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs">
                                    Venue: {venueName}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Emails */}
                            {(learner.studentEmail || learner.parentEmail) && (
                              <div className="mt-1 text-xs text-gray-500">
                                {learner.studentEmail && (
                                  <p>📧 Student: {learner.studentEmail}</p>
                                )}
                                {learner.parentEmail && (
                                  <p>📧 Parent: {learner.parentEmail}</p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Fallback to learner names if objects not found */}
                  {bookingLearners.length === 0 && booking.learnerNames && (
                    <p className="text-sm text-gray-600">
                      {booking.learnerNames}
                    </p>
                  )}
                </div>
              </div>

              {/* Venue */}
              {booking.venue && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Venue</p>
                  <p className="text-sm">{booking.venue}</p>
                </div>
              )}

              {/* Reason */}
              {booking.reason && (
                <div className="mb-3 bg-blue-50 rounded p-2">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Booking Reason</p>
                  <p className="text-sm text-gray-700 italic">{booking.reason}</p>
                </div>
              )}

              {/* Multi-Session */}
              {booking.isMultiSession && (
                <div className="mb-3">
                  <p className="text-xs text-purple-600 font-semibold">
                    🔗 Part of multi-session booking
                    {booking.sessionNumber && booking.totalSessions && (
                      <span className="ml-2">
                        (Session {booking.sessionNumber} of {booking.totalSessions})
                      </span>
                    )}
                  </p>
                </div>
              )}

              {/* Metadata */}
              <div className="mb-3 text-xs text-gray-400">
                <p>
                  Requested: {booking.createdAt ? new Date(booking.createdAt).toLocaleString('en-NZ') : 'Unknown'}
                  {booking.currentVersion && booking.currentVersion > 1 && (
                    <span className="ml-2">• Version {booking.currentVersion}</span>
                  )}
                </p>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-3 border-t">
                <button
                  onClick={() => handleApprove(booking)}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
                >
                  ✓ Approve
                </button>
                <button
                  onClick={() => handleDecline(booking)}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
                >
                  ✕ Decline
                </button>
                <button
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* R/W Assignment Modal */}
      {assigningBooking && (
        <RWAssignmentModal
          booking={assigningBooking}
          onClose={() => setAssigningBooking(null)}
          onConfirm={handleConfirmAssignment}
        />
      )}
    </div>
  );
}

export default PendingBookings;
