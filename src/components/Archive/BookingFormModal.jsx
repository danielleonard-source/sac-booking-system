// =======================================
// BOOKING FORM MODAL
// =======================================

import { useState, useEffect } from 'react'
import { useDataStore } from '../store/dataStore'
import { useUIStore } from '../store/uiStore'
import useAuthStore from '../store/authStore'
import { generateId } from '../utils/helpers'

export default function BookingFormModal() {
  const { modals, closeModal, showNotification } = useUIStore()
  const { currentUser } = useAuthStore()
  const { 
    learners, 
    subjects, 
    readerWriters, 
    venues,
    bookings,
    saveBookings 
  } = useDataStore()

  const modal = modals.bookingForm
  const isOpen = modal.show
  const editMode = modal.data?.mode === 'edit'
  const initialData = modal.data || {}

  // Form state
  const [formData, setFormData] = useState({
    date: '',
    day: '',
    period: '',
    periodName: '',
    periodStart: '',
    periodEnd: '',
    teacher: '',
    teacherEmail: '',
    subject: '',
    subjectCode: '',
    room: '',
    yearLevel: '',
    learners: [],
    readerWriters: {},
    selectedSAC: {},
    learnerVenues: {},
    teacherComment: '',
    status: 'pending'
  })

  // Initialize form data
  useEffect(() => {
    if (isOpen && initialData) {
      if (editMode) {
        // Editing existing booking
        setFormData({
          ...initialData,
          learners: initialData.learners || [],
          readerWriters: initialData.readerWriters || {},
          selectedSAC: initialData.selectedSAC || {},
          learnerVenues: initialData.learnerVenues || {}
        })
      } else {
        // Creating new booking
        setFormData({
          date: initialData.date || '',
          day: initialData.day || '',
          period: initialData.period || '',
          periodName: initialData.periodName || '',
          periodStart: initialData.periodStart || '',
          periodEnd: initialData.periodEnd || '',
          teacher: currentUser?.name || '',
          teacherEmail: currentUser?.email || '',
          subject: '',
          subjectCode: '',
          room: '',
          yearLevel: '',
          learners: [],
          readerWriters: {},
          selectedSAC: {},
          learnerVenues: {},
          teacherComment: '',
          status: 'pending'
        })
      }
    }
  }, [isOpen, initialData, editMode, currentUser])

  if (!isOpen) return null

  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Handle subject selection
  const handleSubjectChange = (e) => {
    const subjectCode = e.target.value
    const subject = subjects.find(s => s.ttCode === subjectCode)
    
    if (subject) {
      handleChange('subjectCode', subject.ttCode)
      handleChange('subject', subject.name)
      handleChange('yearLevel', subject.level || '')
    }
  }

  // Toggle learner selection
  const toggleLearner = (learnerId) => {
    setFormData(prev => {
      const learners = prev.learners.includes(learnerId)
        ? prev.learners.filter(id => id !== learnerId)
        : [...prev.learners, learnerId]
      
      return { ...prev, learners }
    })
  }

  // Assign reader/writer to learner
  const assignReaderWriter = (learnerId, rwId) => {
    setFormData(prev => ({
      ...prev,
      readerWriters: {
        ...prev.readerWriters,
        [learnerId]: rwId
      }
    }))
  }

  // Assign venue to learner
  const assignVenue = (learnerId, venueId) => {
    setFormData(prev => ({
      ...prev,
      learnerVenues: {
        ...prev.learnerVenues,
        [learnerId]: venueId
      }
    }))
  }

  // Handle save
  const handleSave = async () => {
    // Validation
    if (!formData.subject) {
      showNotification('Please select a subject', 'error')
      return
    }

    if (formData.learners.length === 0) {
      showNotification('Please select at least one learner', 'error')
      return
    }

    if (!formData.room) {
      showNotification('Please enter a room', 'error')
      return
    }

    try {
      let updatedBookings

      if (editMode) {
        // Update existing booking
        updatedBookings = bookings.map(b => 
          b.id === formData.id ? formData : b
        )
      } else {
        // Create new booking
        const newBooking = {
          ...formData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          currentVersion: 1
        }
        updatedBookings = [...bookings, newBooking]
      }

      // Save to backend
      await saveBookings(updatedBookings)

      showNotification(
        editMode ? 'Booking updated successfully' : 'Booking created successfully',
        'success'
      )

      closeModal('bookingForm')
    } catch (error) {
      showNotification('Failed to save booking', 'error')
      console.error('Save error:', error)
    }
  }

  // Get selected learners
  const selectedLearners = learners.filter(l => 
    formData.learners.includes(l.id)
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">
            {editMode ? 'Edit Booking' : 'Create Booking'}
          </h2>
          <button
            onClick={() => closeModal('bookingForm')}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {/* Booking Details */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Booking Details</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="label">Date</label>
                <input
                  type="text"
                  value={`${formData.day}, ${formData.date}`}
                  className="input bg-gray-50"
                  disabled
                />
              </div>

              <div>
                <label className="label">Time</label>
                <input
                  type="text"
                  value={`${formData.periodName} (${formData.periodStart} - ${formData.periodEnd})`}
                  className="input bg-gray-50"
                  disabled
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="label">Subject *</label>
                <select
                  value={formData.subjectCode}
                  onChange={handleSubjectChange}
                  className="input"
                >
                  <option value="">Select subject...</option>
                  {subjects.map(subject => (
                    <option key={subject.ttCode} value={subject.ttCode}>
                      {subject.name} (Level {subject.level})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Room *</label>
                <input
                  type="text"
                  value={formData.room}
                  onChange={(e) => handleChange('room', e.target.value)}
                  placeholder="e.g., Q110"
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="label">Teacher Comment (Optional)</label>
              <textarea
                value={formData.teacherComment}
                onChange={(e) => handleChange('teacherComment', e.target.value)}
                placeholder="Additional notes or instructions..."
                className="input"
                rows={3}
              />
            </div>
          </div>

          {/* Learner Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">
              Select Learners ({selectedLearners.length})
            </h3>

            <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
              {learners.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No learners available
                </div>
              ) : (
                learners.map(learner => (
                  <div
                    key={learner.id}
                    className="flex items-center p-3 border-b border-gray-100 hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={formData.learners.includes(learner.id)}
                      onChange={() => toggleLearner(learner.id)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium">
                        {learner.firstName} {learner.lastName}
                      </div>
                      <div className="text-xs text-gray-500">
                        Year {learner.yearLevel}
                        {learner.specialConditions?.length > 0 && (
                          <span className="ml-2">
                            • {learner.specialConditions.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Selected Learners - Assign R/W and Venue */}
          {selectedLearners.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">
                Assign Reader/Writers & Venues
              </h3>

              <div className="space-y-3">
                {selectedLearners.map(learner => (
                  <div
                    key={learner.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="font-medium mb-3">
                      {learner.firstName} {learner.lastName}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label">Reader/Writer</label>
                        <select
                          value={formData.readerWriters[learner.id] || ''}
                          onChange={(e) => assignReaderWriter(learner.id, e.target.value)}
                          className="input"
                        >
                          <option value="">None</option>
                          {readerWriters.map(rw => (
                            <option key={rw.id} value={rw.id}>
                              {rw.firstName} {rw.lastName}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="label">Venue</label>
                        <select
                          value={formData.learnerVenues[learner.id] || ''}
                          onChange={(e) => assignVenue(learner.id, e.target.value)}
                          className="input"
                        >
                          <option value="">Select venue...</option>
                          {venues.map(venue => (
                            <option key={venue.id} value={venue.id}>
                              {venue.name}
                              {venue.capacity && ` (Capacity: ${venue.capacity})`}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
          <button
            onClick={() => closeModal('bookingForm')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn btn-primary"
          >
            {editMode ? 'Update Booking' : 'Create Booking'}
          </button>
        </div>
      </div>
    </div>
  )
}
