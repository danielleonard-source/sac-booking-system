// =======================================
// UI STORE - Modals, Views, UI State
// =======================================

import { create } from 'zustand'

export const useUIStore = create((set) => ({
  // View state
  currentView: 'calendar', // 'calendar', 'admin'
  adminTab: 'pending', // 'pending', 'approved', 'declined', 'learners', 'teachers', etc.
  selectedWeek: 0,

  // Modal states
  modals: {
    bookingForm: { show: false, data: null },
    emailConfirm: { show: false, data: null },
    decline: { show: false, data: null },
    history: { show: false, data: null },
    blockSlot: { show: false, data: null },
    capacity: { show: false, data: null },
    learnerForm: { show: false, data: null },
    teacherForm: { show: false, data: null },
    rwForm: { show: false, data: null },
    venueForm: { show: false, data: null }
  },

  // Search states
  searches: {
    learner: '',
    teacher: '',
    readerWriter: '',
    subject: '',
    venue: '',
    declined: ''
  },

  // Loading overlay
  showLoading: false,
  loadingMessage: 'Loading...',

  // Notification toast
  notification: {
    show: false,
    message: '',
    type: 'info' // 'success', 'error', 'warning', 'info'
  },

  // Actions
  setView: (view) => set({ currentView: view }),
  
  setAdminTab: (tab) => set({ adminTab: tab }),
  
  setSelectedWeek: (week) => set({ selectedWeek: week }),

  // Modal actions
  openModal: (modalName, data = null) => 
    set((state) => ({
      modals: {
        ...state.modals,
        [modalName]: { show: true, data }
      }
    })),

  closeModal: (modalName) =>
    set((state) => ({
      modals: {
        ...state.modals,
        [modalName]: { show: false, data: null }
      }
    })),

  closeAllModals: () =>
    set((state) => ({
      modals: Object.keys(state.modals).reduce((acc, key) => ({
        ...acc,
        [key]: { show: false, data: null }
      }), {})
    })),

  // Search actions
  setSearch: (searchType, value) =>
    set((state) => ({
      searches: {
        ...state.searches,
        [searchType]: value
      }
    })),

  clearSearch: (searchType) =>
    set((state) => ({
      searches: {
        ...state.searches,
        [searchType]: ''
      }
    })),

  clearAllSearches: () =>
    set({
      searches: {
        learner: '',
        teacher: '',
        readerWriter: '',
        subject: '',
        venue: '',
        declined: ''
      }
    }),

  // Loading overlay
  setLoading: (show, message = 'Loading...') =>
    set({ showLoading: show, loadingMessage: message }),

  // Notification toast
  showNotification: (message, type = 'info') => {
    set({
      notification: {
        show: true,
        message,
        type
      }
    })

    // Auto-hide after 5 seconds
    setTimeout(() => {
      set((state) => ({
        notification: {
          ...state.notification,
          show: false
        }
      }))
    }, 5000)
  },

  hideNotification: () =>
    set((state) => ({
      notification: {
        ...state.notification,
        show: false
      }
    }))
}))
