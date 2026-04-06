// =======================================
// EMAIL CONFIRMATION MODAL
// =======================================

import { useState } from 'react'
import { useDataStore } from '../store/dataStore'
import { useUIStore } from '../store/uiStore'

export default function EmailConfirmModal() {
  const { modals, closeModal, showNotification } = useUIStore()
  const { learners, sendEmails } = useDataStore()
  const [sending, setSending] = useState(false)
  const [emailResults, setEmailResults] = useState(null)

  const modal = modals.emailConfirm
  const isOpen = modal.show
  const booking = modal.data?.booking

  if (!isOpen || !booking) return null

  // Get learner details
  const bookingLearners = booking.learners?.map(learnerId => 
    learners.find(l => l.id === learnerId)
  ).filter(Boolean) || []

  // Handle send emails
  const handleSendEmails = async () => {
    setSending(true)
    setEmailResults(null)

    try {
      // Prepare email data
      const emailData = {
        booking: {
          id: booking.id,
          date: booking.date,
          day: booking.day,
          period: booking.period,
          periodName: booking.periodName,
          periodStart: booking.periodStart,
          periodEnd: booking.periodEnd,
          subject: booking.subject,
          room: booking.room,
          teacher: booking.teacher,
          isMultiSession: booking.isMultiSession || false,
          sessionNumber: booking.sessionNumber || 1,
          totalSessions: booking.totalSessions || 1,
          sessionReason: booking.sessionReason || ''
        },
        learners: bookingLearners.map(learner => ({
          firstName: learner.firstName,
          lastName: learner.lastName,
          studentEmail: learner.studentEmail,
          parentEmail: learner.parentEmail,
          conditions: learner.specialConditions?.join(', ') || '',
          readerWriter: booking.readerWriters?.[learner.id] || '',
          venue: booking.learnerVenues?.[learner.id] || ''
        }))
      }

      // Send emails via backend
      const result = await sendEmails(emailData)

      setEmailResults(result)

      // Show success notification
      if (result.success) {
        showNotification(
          `Successfully sent ${result.summary.sent} email(s)!`,
          'success'
        )
      } else {
        showNotification(
          `Sent ${result.summary.sent}, failed ${result.summary.failed}, skipped ${result.summary.skipped}`,
          'warning'
        )
      }
    } catch (error) {
      showNotification('Failed to send emails. Please try again.', 'error')
      console.error('Email send error:', error)
    } finally {
      setSending(false)
    }
  }

  // Close and reset
  const handleClose = () => {
    setEmailResults(null)
    closeModal('emailConfirm')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">
            📧 Send Booking Confirmations
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {!emailResults ? (
            // Confirmation Screen
            <>
              {/* Booking Details */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Booking Details
                </h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>Subject:</strong> {booking.subject}</p>
                  <p><strong>Date:</strong> {booking.day}, {booking.date}</p>
                  <p><strong>Time:</strong> {booking.periodName} ({booking.periodStart} - {booking.periodEnd})</p>
                  <p><strong>Room:</strong> {booking.room}</p>
                  <p><strong>Teacher:</strong> {booking.teacher}</p>
                </div>
              </div>

              {/* Recipients */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">
                  Recipients ({bookingLearners.length} learners)
                </h3>

                {bookingLearners.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No learners found for this booking</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bookingLearners.map(learner => {
                      const hasStudentEmail = learner.studentEmail && learner.studentEmail.trim()
                      const hasParentEmail = learner.parentEmail && learner.parentEmail.trim()
                      const hasAnyEmail = hasStudentEmail || hasParentEmail

                      return (
                        <div
                          key={learner.id}
                          className={`border rounded-lg p-3 ${
                            hasAnyEmail
                              ? 'border-green-200 bg-green-50'
                              : 'border-red-200 bg-red-50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium">
                                {learner.firstName} {learner.lastName}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {hasStudentEmail && (
                                  <div>📧 Student: {learner.studentEmail}</div>
                                )}
                                {hasParentEmail && (
                                  <div>📧 Parent: {learner.parentEmail}</div>
                                )}
                                {!hasAnyEmail && (
                                  <div className="text-red-600">
                                    ⚠️ No email addresses on file
                                  </div>
                                )}
                              </div>
                            </div>
                            {hasAnyEmail ? (
                              <span className="badge badge-success">✓ Will Send</span>
                            ) : (
                              <span className="badge badge-danger">✕ Skip</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Email Preview */}
              <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Email Content Preview
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Subject:</strong> SAC Booking Confirmed: {booking.subject} - {booking.date}</p>
                  <p><strong>Content includes:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Assessment details (subject, date, time, room)</li>
                    <li>Student's SAC arrangements</li>
                    <li>Reader/Writer assignment (if applicable)</li>
                    <li>Venue information</li>
                    <li>Important absence policy reminder</li>
                  </ul>
                </div>
              </div>

              {/* Warning */}
              {bookingLearners.some(l => !l.studentEmail && !l.parentEmail) && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start">
                    <span className="text-yellow-600 text-xl mr-2">⚠️</span>
                    <div className="text-sm text-yellow-800">
                      <p className="font-semibold">Some learners have no email addresses</p>
                      <p className="mt-1">These learners will be skipped. You may need to contact them manually.</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            // Results Screen
            <div>
              <div className={`p-4 rounded-lg mb-4 ${
                emailResults.success
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-yellow-50 border border-yellow-200'
              }`}>
                <h3 className={`font-semibold mb-2 ${
                  emailResults.success ? 'text-green-900' : 'text-yellow-900'
                }`}>
                  {emailResults.success ? '✅ Emails Sent Successfully!' : '⚠️ Emails Sent with Some Issues'}
                </h3>
                <div className={`text-sm ${
                  emailResults.success ? 'text-green-800' : 'text-yellow-800'
                }`}>
                  <p>Sent: {emailResults.summary.sent}</p>
                  <p>Failed: {emailResults.summary.failed}</p>
                  <p>Skipped: {emailResults.summary.skipped}</p>
                </div>
              </div>

              {/* Detailed Results */}
              <div className="space-y-2">
                {emailResults.results.map((result, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded border ${
                      result.status === 'sent'
                        ? 'bg-green-50 border-green-200'
                        : result.status === 'skipped'
                        ? 'bg-gray-50 border-gray-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {result.learner}
                        </div>
                        {result.recipients?.to && (
                          <div className="text-xs text-gray-600 mt-1">
                            To: {result.recipients.to.join(', ')}
                          </div>
                        )}
                        {result.recipients?.cc && result.recipients.cc.length > 0 && (
                          <div className="text-xs text-gray-600">
                            CC: {result.recipients.cc.join(', ')}
                          </div>
                        )}
                        {result.reason && (
                          <div className="text-xs text-gray-600 mt-1">
                            {result.reason}
                          </div>
                        )}
                        {result.error && (
                          <div className="text-xs text-red-600 mt-1">
                            Error: {result.error}
                          </div>
                        )}
                      </div>
                      <span className={`badge ${
                        result.status === 'sent'
                          ? 'badge-success'
                          : result.status === 'skipped'
                          ? 'badge-gray'
                          : 'badge-danger'
                      }`}>
                        {result.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Remaining Quota */}
              {emailResults.remainingQuota !== undefined && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                  <strong>Remaining Email Quota Today:</strong> {emailResults.remainingQuota}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
          {!emailResults ? (
            <>
              <button
                onClick={handleClose}
                className="btn btn-secondary"
                disabled={sending}
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmails}
                disabled={sending || bookingLearners.length === 0}
                className="btn btn-primary"
              >
                {sending ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⏳</span>
                    Sending...
                  </>
                ) : (
                  <>📧 Send {bookingLearners.filter(l => l.studentEmail || l.parentEmail).length} Email(s)</>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={handleClose}
              className="btn btn-primary"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
