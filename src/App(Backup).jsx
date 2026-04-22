import React, { useEffect, useState } from 'react';
import { useDataStore } from './store/dataStore';
import { useAuthStore } from './store/authStore';
import { useUIStore } from './store/uiStore';
import Login from './components/Login';
import Navigation from './components/Navigation';
import Calendar from './components/Calendar/Calendar';
import Bookings from './components/Bookings/Bookings';
import AdminPanel from './components/Admin/AdminPanel';
import Dashboard from './components/Dashboard/Dashboard';
import LoadingOverlay from './components/Common/LoadingOverlay';
import Notification from './components/Common/Notification';
import ErrorBoundary from './components/Common/ErrorBoundary';

// Import all modals
import BookingFormModal from './components/Bookings/BookingFormModal';
import LearnerFormModal from './components/Admin/LearnerFormModal';
import TeacherFormModal from './components/Admin/TeacherFormModal';
import RWFormModal from './components/Admin/RWFormModal';
import VenueFormModal from './components/Admin/VenueFormModal';
import SubjectFormModal from './components/Admin/SubjectFormModal';
import BlockSlotModal from './components/Modals/BlockSlotModal';
import CapacityModal from './components/Modals/CapacityModal';
import DeclineModal from './components/Modals/DeclineModal';
import EmailModal from './components/Modals/EmailModal';
import BulkUploadModal from './components/Modals/BulkUploadModal';
import AssignRWModal from './components/Modals/AssignRWModal';
import AssignVenueModal from './components/Modals/AssignVenueModal';
import LinkedBookingsModal from './components/Modals/LinkedBookingsModal';
import HistoryModal from './components/Modals/HistoryModal';
import DeclineSACModal from './components/Modals/DeclineSACModal';

function App() {
  const { loadData, loading } = useDataStore();
  const { isLoggedIn, loadSavedUser } = useAuthStore();
  const { view, showNotification } = useUIStore();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Try to load saved user
    const savedUser = loadSavedUser();
    
    // If user is logged in, load data
    if (savedUser) {
      loadData()
        .then(() => {
          showNotification('Welcome back!', 'success');
        })
        .catch((error) => {
          showNotification('Failed to load data: ' + error.message, 'error');
        })
        .finally(() => {
          setInitializing(false);
        });
    } else {
      setInitializing(false);
    }
  }, []);

  if (initializing) {
    return <LoadingOverlay message="Initializing..." />;
  }

  if (!isLoggedIn) {
    return <Login />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <main className={view === 'dashboard' ? '' : 'max-w-7xl mx-auto px-4 py-6'}>
          {view === 'dashboard' && <Dashboard />}
          {view === 'calendar' && <Calendar />}
          {view === 'bookings' && <Bookings />}
          {view === 'admin' && <AdminPanel />}
        </main>

        {/* Modals */}
        <BookingFormModal />
        <LearnerFormModal />
        <TeacherFormModal />
        <RWFormModal />
        <VenueFormModal />
        <SubjectFormModal />
        <BlockSlotModal />
        <CapacityModal />
        <DeclineModal />
        <EmailModal />
        <BulkUploadModal />
        <AssignRWModal />
        <AssignVenueModal />
        <LinkedBookingsModal />
        <HistoryModal />
        <DeclineSACModal />

        {/* Global UI */}
        {loading && <LoadingOverlay />}
        <Notification />
      </div>
    </ErrorBoundary>
  );
}

export default App;
