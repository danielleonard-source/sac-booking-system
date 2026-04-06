// =======================================
// DATA STORE - Bookings, Learners, Teachers
// =======================================

import { create } from 'zustand'
import { api } from '../api/client'

export const useDataStore = create((set, get) => ({
  // State
  loading: false,
  error: null,
  
  // Data
  bookings: [],
  bookingHistory: [],
  learners: [],
  teachers: [],
  readerWriters: [],
  venues: [],
  subjects: [],
  blockedSlots: [],
  sessionCapacities: {},
  notifications: [],

  // Actions
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),

  // Load all data from backend
  loadData: async () => {
    set({ loading: true, error: null })
    try {
      const result = await api.getAll()
      
      set({
        bookings: result.bookings || [],
        bookingHistory: result.bookingHistory || [],
        learners: result.learners || [],
        teachers: result.teachers || [],
        readerWriters: result.readerWriters || [],
        venues: result.venues || [],
        subjects: result.subjects || [],
        blockedSlots: result.blockedSlots || [],
        sessionCapacities: result.sessionCapacities || {},
        notifications: result.notifications || [],
        loading: false
      })

      return result
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  // Save bookings
  saveBookings: async (bookings) => {
    set({ loading: true, error: null })
    try {
      const result = await api.saveBookings(bookings)
      set({ bookings, loading: false })
      return result
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  // Save learners
  saveLearners: async (learners) => {
    set({ loading: true, error: null })
    try {
      const result = await api.saveLearners(learners)
      set({ learners, loading: false })
      return result
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  // Save teachers
  saveTeachers: async (teachers) => {
    set({ loading: true, error: null })
    try {
      const result = await api.saveTeachers(teachers)
      set({ teachers, loading: false })
      return result
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  // Save reader/writers
  saveReaderWriters: async (readerWriters) => {
    set({ loading: true, error: null })
    try {
      const result = await api.saveReaderWriters(readerWriters)
      set({ readerWriters, loading: false })
      return result
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  // Save venues
  saveVenues: async (venues) => {
    set({ loading: true, error: null })
    try {
      const result = await api.saveVenues(venues)
      set({ venues, loading: false })
      return result
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  // Batch save
  saveBatch: async (operations) => {
    set({ loading: true, error: null })
    try {
      const result = await api.saveBatch(operations)
      
      // Update local state for each operation
      operations.forEach(op => {
        switch (op.sheetName) {
          case 'Bookings':
            set({ bookings: op.data })
            break
          case 'Learners':
            set({ learners: op.data })
            break
          case 'Teachers':
            set({ teachers: op.data })
            break
          // ... add more as needed
        }
      })
      
      set({ loading: false })
      return result
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  // Send emails
  sendEmails: async (emailData) => {
    set({ loading: true, error: null })
    try {
      const result = await api.sendEmails(emailData)
      set({ loading: false })
      return result
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  // Add booking
  addBooking: (booking) => {
    const bookings = [...get().bookings, booking]
    set({ bookings })
  },

  // Update booking
  updateBooking: (id, updates) => {
    const bookings = get().bookings.map(b => 
      b.id === id ? { ...b, ...updates } : b
    )
    set({ bookings })
  },

  // Delete booking
  deleteBooking: (id) => {
    const bookings = get().bookings.filter(b => b.id !== id)
    set({ bookings })
  },

  // Get booking by ID
  getBooking: (id) => {
    return get().bookings.find(b => b.id === id)
  },

  // Get bookings for specific date
  getBookingsByDate: (date) => {
    return get().bookings.filter(b => b.date === date)
  },

  // Get bookings for specific teacher
  getBookingsByTeacher: (teacherEmail) => {
    return get().bookings.filter(b => 
      b.teacherEmail?.toLowerCase() === teacherEmail.toLowerCase()
    )
  }
}))
