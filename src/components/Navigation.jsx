import React from 'react';
import useAuthStore from '../store/authStore';
import { useUIStore } from '../store/uiStore';

function Navigation() {
  const { currentUser, userRole, logout } = useAuthStore();
  const { view, setView } = useUIStore();

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-gray-900">
              SAC Booking System
            </h1>
            
            <div className="flex space-x-1">
              {userRole === 'admin' && (
                <button
                  onClick={() => setView('dashboard')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    view === 'dashboard'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  📊 Dashboard
                </button>
              )}
              
              <button
                onClick={() => setView('calendar')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  view === 'calendar'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Calendar
              </button>
              
              <button
                onClick={() => setView('bookings')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  view === 'bookings'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                My Bookings
              </button>
              
              {userRole === 'admin' && (
                <button
                  onClick={() => setView('admin')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    view === 'admin'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Admin
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900">
                {currentUser?.name}
              </div>
              <div className="text-xs text-gray-500">
                {userRole === 'admin' ? 'Administrator' : 'Teacher'}
              </div>
            </div>
            
            <button
              onClick={logout}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
