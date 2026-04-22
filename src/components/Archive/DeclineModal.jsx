// =======================================
// DECLINE BOOKING MODAL
// =======================================

import { useState } from 'react'
import { useDataStore } from '../store/dataStore'
import { useUIStore } from '../store/uiStore'
import { SCHEDULE, DAYS_OF_WEEK, SAC_DECLINE_REASONS } from '../config'

export default function DeclineModal() {
  const { modals, closeModal, showNotification } = useUIStore()
  const { bookings, saveBookings } = useDataStore()
  
  const [selectedReason, setSelectedReason] = useState('')
  const [customReason, setCustomReason] = useState('')
  const [declining, setDeclining] = useState(false)

  const modal = modals.decline
  const isOpen = modal.show
  const booking = modal.data?.booking

  if (!isOpen || !booking) return null

  const reasons = SAC_DECLINE_REASONS

  const handleDecline = async () => {
    const reason = selectedReason === 'custom' ? customReason : selectedReason

    if (!reason || reason.trim() === '') {
      showNotification('Please select or enter a decline reason', 'error')
      return
    }

    setDeclining(true)

    try {
      const updatedBookings = bookings.map(b =>
        b.id === booking.id
          ? {
              ...b,
              status: 'declined',
              declineReason: reason,
              updatedAt: new Date().toISOString()
            }
          : b
      )

      await saveBookings(updatedBookings)

      showNotification('Booking declined', 'success')
      closeModal('decline')
      
      // Reset form
      setSelectedReason('')
      setCustomReason('')
    } catch (error) {
      showNotification('Failed to decline booking', 'error')
      console.error('Decline error:', error)
    } finally {
      setDeclining(false)
    }
  }

  const handleClose = () => {
    setSelectedReason('')
    setCustomReason('')
    closeModal('decline')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">
            Decline Booking
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Booking Summary */}
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="text-sm space-y-1">
              <p><strong>Subject:</strong> {booking.subject}</p>
              <p><strong>Date:</strong> {booking.day}, {booking.date}</p>
              <p><strong>Time:</strong> {booking.periodName}</p>
              <p><strong>Teacher:</strong> {booking.teacher}</p>
            </div>
          </div>

          {/* Warning */}
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <span className="text-red-600 text-xl mr-2">⚠️</span>
              <div className="text-sm text-red-800">
                <p className="font-semibold">This action cannot be undone</p>
                <p className="mt-1">The teacher will be notified of the decline reason.</p>
              </div>
            </div>
          </div>

          {/* Reason Selection */}
          <div className="mb-6">
            <label className="label">Decline Reason *</label>
            
            <div className="space-y-2">
              {reasons.map((reason, index) => (
                <label
                  key={index}
                  className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="declineReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => {
                      setSelectedReason(e.target.value)
                      setCustomReason('')
                    }}
                    className="mt-1 mr-3"
                  />
                  <span className="text-sm">{reason}</span>
                </label>
              ))}

              <label className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="declineReason"
                  value="custom"
                  checked={selectedReason === 'custom'}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="mt-1 mr-3"
                />
                <span className="text-sm">Other (specify below)</span>
              </label>
            </div>

            {selectedReason === 'custom' && (
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Enter decline reason..."
                className="input mt-3"
                rows={3}
                autoFocus
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
          <button
            onClick={handleClose}
            className="btn btn-secondary"
            disabled={declining}
          >
            Cancel
          </button>
          <button
            onClick={handleDecline}
            disabled={declining || !selectedReason || (selectedReason === 'custom' && !customReason.trim())}
            className="btn btn-danger"
          >
            {declining ? 'Declining...' : 'Decline Booking'}
          </button>
        </div>
      </div>
    </div>
  )
}
