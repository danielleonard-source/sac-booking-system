// =======================================
// MAIN APP COMPONENT
// =======================================

import { useEffect, useState } from 'react'
import { useAuthStore } from './store/authStore'
import { useDataStore } from './store/dataStore'
import { useUIStore } from './store/uiStore'

import Login from './components/Login'
import LoadingOverlay from './components/LoadingOverlay'
import NotificationToast from './components/NotificationToast'
import Calendar from './components/Calendar'
import BookingFormModal from './components/BookingFormModal'
import EmailConfirmModal from './components/EmailConfirmModal'
import DeclineModal from './components/DeclineModal'
import AdminPanel from './components/AdminPanel'

function MainApp() {
  const [activeView, setActiveView] = useState('calendar')
  
  const { currentUser, userRole, logout } = useAuthStore()
  const { loadData } = useDataStore()
  const { showNotification, setLoading } = useUIStore()

  useEffect(() => {
    // Load data when app mounts
    const initializeData = async () => {
      setLoading(true, 'Loading data...')
      try {
        await loadData()
        showNotification('Data loaded successfully!', 'success')
      } catch (error) {
        showNotification('Failed to load data. Please refresh the page.', 'error')
      } finally {
        setLoading(false)
      }
    }

    initializeData()
  }, [loadData, showNotification, setLoading])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                SAC Booking System
              </h1>
              <p className="text-sm text-gray-600">
                Bethlehem College • {userRole === 'admin' ? 'Administrator' : 'Teacher'} Dashboard
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {currentUser?.name}
                </p>
                <p className="text-xs text-gray-600">{currentUser?.email}</p>
              </div>
              <button
                onClick={logout}
                className="btn btn-secondary btn-sm"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveView('calendar')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeView === 'calendar'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📅 Calendar
            </button>
            
            {userRole === 'admin' && (
              <button
                onClick={() => setActiveView('admin')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeView === 'admin'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                ⚙️ Admin Panel
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'calendar' && <Calendar />}
        {activeView === 'admin' && userRole === 'admin' && <AdminPanel />}
      </main>

      {/* Modals */}
      <BookingFormModal />
      <EmailConfirmModal />
      <DeclineModal />
    </div>
  )
}

export default function App() {
  const { isLoggedIn } = useAuthStore()

  return (
    <>
      {isLoggedIn ? <MainApp /> : <Login />}
      <LoadingOverlay />
      <NotificationToast />
    </>
  )
}
