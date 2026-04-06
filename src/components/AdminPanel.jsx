// =======================================
// ADMIN PANEL COMPONENT
// =======================================

import { useState } from 'react'
import { useDataStore } from '../store/dataStore'
import { useUIStore } from '../store/uiStore'
import { filterBySearch, exportToExcel } from '../utils/helpers'

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('pending')
  
  const { bookings, learners, teachers, readerWriters } = useDataStore()
  const { searches, setSearch, openModal } = useUIStore()

  const tabs = [
    { id: 'pending', label: 'Pending', icon: '⏳' },
    { id: 'approved', label: 'Approved', icon: '✓' },
    { id: 'declined', label: 'Declined', icon: '✕' },
    { id: 'learners', label: 'Learners', icon: '👥' },
    { id: 'teachers', label: 'Teachers', icon: '👨‍🏫' },
    { id: 'readerwriters', label: 'Reader/Writers', icon: '📝' }
  ]

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex overflow-x-auto scrollbar-thin">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'pending' && <PendingBookings />}
        {activeTab === 'approved' && <ApprovedBookings />}
        {activeTab === 'declined' && <DeclinedBookings />}
        {activeTab === 'learners' && <LearnersTab />}
        {activeTab === 'teachers' && <TeachersTab />}
        {activeTab === 'readerwriters' && <ReaderWritersTab />}
      </div>
    </div>
  )
}

// =======================================
// PENDING BOOKINGS TAB
// =======================================

function PendingBookings() {
  const { bookings, saveBookings } = useDataStore()
  const { showNotification, openModal } = useUIStore()

  const pendingBookings = bookings.filter(b => b.status === 'pending')

  const handleApprove = async (bookingId) => {
    try {
      const updated = bookings.map(b =>
        b.id === bookingId
          ? { ...b, status: 'approved', updatedAt: new Date().toISOString() }
          : b
      )
      await saveBookings(updated)
      showNotification('Booking approved!', 'success')
    } catch (error) {
      showNotification('Failed to approve booking', 'error')
    }
  }

  const handleDecline = (booking) => {
    openModal('decline', { booking })
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Pending Bookings ({pendingBookings.length})
        </h3>
      </div>

      {pendingBookings.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">📭</div>
          <p>No pending bookings</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingBookings.map(booking => (
            <BookingCard
              key={booking.id}
              booking={booking}
              actions={
                <>
                  <button
                    onClick={() => handleApprove(booking.id)}
                    className="btn btn-success btn-sm"
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => handleDecline(booking)}
                    className="btn btn-danger btn-sm"
                  >
                    ✕ Decline
                  </button>
                  <button
                    onClick={() => openModal('bookingForm', { ...booking, mode: 'edit' })}
                    className="btn btn-secondary btn-sm"
                  >
                    Edit
                  </button>
                </>
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}

// =======================================
// APPROVED BOOKINGS TAB
// =======================================

function ApprovedBookings() {
  const { bookings } = useDataStore()
  const { openModal } = useUIStore()

  const approvedBookings = bookings.filter(b => b.status === 'approved')

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Approved Bookings ({approvedBookings.length})
        </h3>
        
        <button
          onClick={() => exportToExcel(approvedBookings, 'approved-bookings.xlsx')}
          className="btn btn-secondary btn-sm"
        >
          📊 Export
        </button>
      </div>

      {approvedBookings.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">📋</div>
          <p>No approved bookings yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {approvedBookings.map(booking => (
            <BookingCard
              key={booking.id}
              booking={booking}
              actions={
                <>
                  <button
                    onClick={() => openModal('bookingForm', { ...booking, mode: 'edit' })}
                    className="btn btn-secondary btn-sm"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => openModal('emailConfirm', { booking })}
                    className="btn btn-primary btn-sm"
                  >
                    📧 Send Emails
                  </button>
                </>
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}

// =======================================
// DECLINED BOOKINGS TAB
// =======================================

function DeclinedBookings() {
  const { bookings } = useDataStore()

  const declinedBookings = bookings.filter(b => b.status === 'declined')

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold">
          Declined Bookings ({declinedBookings.length})
        </h3>
      </div>

      {declinedBookings.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">✓</div>
          <p>No declined bookings</p>
        </div>
      ) : (
        <div className="space-y-4">
          {declinedBookings.map(booking => (
            <BookingCard
              key={booking.id}
              booking={booking}
              showDeclineReason
            />
          ))}
        </div>
      )}
    </div>
  )
}

// =======================================
// LEARNERS TAB
// =======================================

function LearnersTab() {
  const { learners } = useDataStore()
  const { searches, setSearch, openModal } = useUIStore()

  const filtered = filterBySearch(
    learners,
    searches.learner,
    'firstName',
    'lastName',
    'yearLevel',
    'specialConditions'
  )

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Learners ({learners.length})
        </h3>

        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={searches.learner}
            onChange={(e) => setSearch('learner', e.target.value)}
            placeholder="Search learners..."
            className="input"
          />
          <button
            onClick={() => openModal('learnerForm')}
            className="btn btn-primary"
          >
            + Add Learner
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Name</th>
              <th>Year Level</th>
              <th>Student ID</th>
              <th>SAC Conditions</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(learner => (
              <tr key={learner.id}>
                <td className="font-medium">
                  {learner.firstName} {learner.lastName}
                </td>
                <td>Year {learner.yearLevel}</td>
                <td>{learner.studentId}</td>
                <td>
                  {learner.specialConditions?.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {learner.specialConditions.map((cond, idx) => (
                        <span key={idx} className="badge badge-primary">
                          {cond}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400">None</span>
                  )}
                </td>
                <td className="text-sm text-gray-600">
                  {learner.studentEmail}
                </td>
                <td>
                  <button
                    onClick={() => openModal('learnerForm', { ...learner, mode: 'edit' })}
                    className="btn btn-secondary btn-sm"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// =======================================
// TEACHERS TAB
// =======================================

function TeachersTab() {
  const { teachers } = useDataStore()
  const { searches, setSearch, openModal } = useUIStore()

  const filtered = filterBySearch(
    teachers,
    searches.teacher,
    'firstName',
    'lastName',
    'code',
    'email'
  )

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Teachers ({teachers.length})
        </h3>

        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={searches.teacher}
            onChange={(e) => setSearch('teacher', e.target.value)}
            placeholder="Search teachers..."
            className="input"
          />
          <button
            onClick={() => openModal('teacherForm')}
            className="btn btn-primary"
          >
            + Add Teacher
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Name</th>
              <th>Code</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(teacher => (
              <tr key={teacher.id}>
                <td className="font-medium">
                  {teacher.firstName} {teacher.lastName}
                </td>
                <td>
                  <span className="badge badge-primary">
                    {teacher.code}
                  </span>
                </td>
                <td className="text-sm text-gray-600">
                  {teacher.email}
                </td>
                <td>
                  <button
                    onClick={() => openModal('teacherForm', { ...teacher, mode: 'edit' })}
                    className="btn btn-secondary btn-sm"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// =======================================
// READER/WRITERS TAB
// =======================================

function ReaderWritersTab() {
  const { readerWriters } = useDataStore()
  const { searches, setSearch, openModal } = useUIStore()

  const filtered = filterBySearch(
    readerWriters,
    searches.readerWriter,
    'firstName',
    'lastName',
    'email'
  )

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Reader/Writers ({readerWriters.length})
        </h3>

        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={searches.readerWriter}
            onChange={(e) => setSearch('readerWriter', e.target.value)}
            placeholder="Search R/W..."
            className="input"
          />
          <button
            onClick={() => openModal('rwForm')}
            className="btn btn-primary"
          >
            + Add Reader/Writer
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Days Available</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(rw => (
              <tr key={rw.id}>
                <td className="font-medium">
                  {rw.firstName} {rw.lastName}
                </td>
                <td className="text-sm text-gray-600">{rw.email}</td>
                <td>
                  {rw.daysAvailable?.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {rw.daysAvailable.map((day, idx) => (
                        <span key={idx} className="badge badge-gray">
                          {day}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400">Not specified</span>
                  )}
                </td>
                <td>
                  <button
                    onClick={() => openModal('rwForm', { ...rw, mode: 'edit' })}
                    className="btn btn-secondary btn-sm"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// =======================================
// BOOKING CARD - Reusable component
// =======================================

function BookingCard({ booking, actions, showDeclineReason }) {
  const { learners } = useDataStore()

  const getLearnerNames = () => {
    if (!booking.learners || booking.learners.length === 0) return []
    
    return booking.learners
      .map(id => {
        const learner = learners.find(l => l.id === id)
        return learner ? `${learner.firstName} ${learner.lastName}` : null
      })
      .filter(Boolean)
  }

  const learnerNames = getLearnerNames()

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-lg">{booking.subject}</h4>
          <p className="text-sm text-gray-600">
            {booking.day}, {booking.date} • {booking.periodName} ({booking.periodStart} - {booking.periodEnd})
          </p>
        </div>
        <span className={`badge ${
          booking.status === 'approved' ? 'badge-success' :
          booking.status === 'pending' ? 'badge-warning' :
          'badge-danger'
        }`}>
          {booking.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
        <div>
          <span className="text-gray-600">Teacher:</span>
          <span className="ml-2 font-medium">{booking.teacher}</span>
        </div>
        <div>
          <span className="text-gray-600">Room:</span>
          <span className="ml-2 font-medium">{booking.room}</span>
        </div>
        <div>
          <span className="text-gray-600">Learners:</span>
          <span className="ml-2 font-medium">{learnerNames.length}</span>
        </div>
        <div>
          <span className="text-gray-600">Year Level:</span>
          <span className="ml-2 font-medium">Year {booking.yearLevel}</span>
        </div>
      </div>

      {learnerNames.length > 0 && (
        <div className="mb-3">
          <span className="text-sm text-gray-600">Students: </span>
          <span className="text-sm">{learnerNames.join(', ')}</span>
        </div>
      )}

      {showDeclineReason && booking.declineReason && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded">
          <span className="text-sm font-medium text-red-800">Decline Reason: </span>
          <span className="text-sm text-red-700">{booking.declineReason}</span>
        </div>
      )}

      {booking.teacherComment && (
        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded">
          <span className="text-sm font-medium text-blue-800">Note: </span>
          <span className="text-sm text-blue-700">{booking.teacherComment}</span>
        </div>
      )}

      {actions && (
        <div className="flex items-center space-x-2 pt-3 border-t border-gray-200">
          {actions}
        </div>
      )}
    </div>
  )
}
