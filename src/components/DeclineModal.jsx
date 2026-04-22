import { useState } from 'react'
import { useUIStore } from '../store/uiStore'
import { useDataStore } from '../store/dataStore'
import { SAC_DECLINE_REASONS } from '../config'

export default function DeclineModal() {
  const { declineModalOpen, declineBooking, closeDeclineModal, showNotification } = useUIStore()
  const { updateBooking } = useDataStore()
  const [selectedReason, setSelectedReason] = useState('')
  const [customReason, setCustomReason] = useState('')
  const [declining, setDeclining] = useState(false)

  const booking = declineBooking

  if (!declineModalOpen || !booking) return null

  const reasons = SAC_DECLINE_REASONS

  const handleDecline = async () => {
    const reason = selectedReason === 'Other' ? customReason : selectedReason
    
    if (!reason) {
      showNotification('Please select or enter a reason', 'error')
      return
    }

    setDeclining(true)
    try {
      await updateBooking(booking.id, {
        status: 'declined',
        declineReason: reason,
        declinedAt: new Date().toISOString()
      })
      showNotification('Booking declined', 'success')
      closeDeclineModal()
      setSelectedReason('')
      setCustomReason('')
    } catch (error) {
      showNotification('Failed to decline booking: ' + error.message, 'error')
    } finally {
      setDeclining(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
        <h2 className="text-xl font-bold mb-4">❌ Decline Booking</h2>
        
        <div className="mb-4">
          <label className="label">Reason for declining</label>
          <select
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
            className="input"
          >
            <option value="">Select a reason...</option>
            {reasons.map(reason => (
              <option key={reason} value={reason}>{reason}</option>
            ))}
          </select>
        </div>

        {selectedReason === 'Other' && (
          <div className="mb-4">
            <label className="label">Custom reason</label>
            <textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              className="input"
              rows="3"
              placeholder="Please provide details..."
            />
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={closeDeclineModal}
            className="btn btn-secondary flex-1"
            disabled={declining}
          >
            Cancel
          </button>
          <button
            onClick={handleDecline}
            className="btn btn-danger flex-1"
            disabled={declining}
          >
            {declining ? 'Declining...' : 'Decline Booking'}
          </button>
        </div>
      </div>
    </div>
  )
}
