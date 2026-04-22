// =======================================
// LOGIN COMPONENT
// =======================================

import { useState } from 'react'
import useAuthStore from '../store/authStore'
import { useDataStore } from '../store/dataStore'
import { useUIStore } from '../store/uiStore'

export default function Login() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  const { login, checkAdmin } = useAuthStore()
  const { teachers, loadData } = useDataStore()
  const { showNotification } = useUIStore()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email || !code) {
      showNotification('Please enter both email and teacher code', 'error')
      return
    }

    setLoading(true)

    try {
      const emailLower = email.trim().toLowerCase()
      const codeUpper = code.trim().toUpperCase()

      // Check if admin
      if (checkAdmin(emailLower)) {
        login({
          name: emailLower.split('@')[0].split('.').map(w => 
            w.charAt(0).toUpperCase() + w.slice(1)
          ).join(' '),
          email: emailLower,
          code: 'ADMIN',
          isAdmin: true
        })

        // Load data
        await loadData()
        showNotification('Welcome, Admin!', 'success')
        return
      }

      // Check if teacher exists
      const teacher = teachers.find(t =>
        t.email.toLowerCase() === emailLower && 
        t.code.toUpperCase() === codeUpper
      )

      if (teacher) {
        login({
          name: `${teacher.firstName} ${teacher.lastName}`,
          email: teacher.email,
          code: teacher.code,
          isAdmin: false
        })

        showNotification(`Welcome, ${teacher.firstName}!`, 'success')
      } else {
        showNotification('Invalid email or teacher code', 'error')
      }
    } catch (error) {
      showNotification('Login failed. Please try again.', 'error')
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            SAC Booking System
          </h1>
          <p className="text-gray-600">Bethlehem College</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teacher@beth.school.nz"
              className="input"
              autoFocus
              disabled={loading}
            />
          </div>

          <div>
            <label className="label">Teacher Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="ABC"
              className="input uppercase"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Contact the SAC Coordinator if you need assistance</p>
        </div>
      </div>
    </div>
  )
}
