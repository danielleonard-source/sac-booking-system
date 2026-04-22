import { useState } from 'react'
import { useUIStore } from '../store/uiStore'
import { useDataStore } from '../store/dataStore'

export default function EmailConfirmModal() {
  const { emailConfirmOpen, emailConfirmData, closeEmailConfirm, showNotification } = useUIStore()
  const { learners, sendEmails } = useDataStore()
  const [sending, setSending] = useState(false)
  const [emailResults, setEmailResults] = useState(null)

  const booking = emailConfirmData?.booking

  if (!emailConfirmOpen || !booking) return null

  const handleSend = async () => {
    setSending(true)
    try {
      const results = await sendEmails(booking)
      setEmailResults(results)
      showNotification('Emails sent successfully!', 'success')
      setTimeout(() => {
        closeEmailConfirm()
        setEmailResults(null)
      }, 3000)
    } catch (error) {
      showNotification('Failed to send emails: ' + error.message, 'error')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
        <h2 className="text-xl font-bold mb-4">📧 Send Email Confirmations</h2>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Send email confirmations for this booking to:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Learner(s)</li>
            <li>Parent(s)</li>
            <li>Teacher</li>
            <li>Reader/Writer (if assigned)</li>
          </ul>
        </div>

        {emailResults && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
            <p className="text-sm text-green-700">✓ Emails sent successfully!</p>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={closeEmailConfirm}
            className="btn btn-secondary flex-1"
            disabled={sending}
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            className="btn btn-primary flex-1"
            disabled={sending}
          >
            {sending ? 'Sending...' : 'Send Emails'}
          </button>
        </div>
      </div>
    </div>
  )
}
