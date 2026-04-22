import { create } from 'zustand';
import { isSameLocalDate, toLocalDateString } from '../utils/dateUtils';
import api from '../api/client';
import { generateUniqueId, getCapacityKey } from '../utils/helpers';
import { DEFAULT_MAX_CAPACITY } from '../config';

// Helper function for JSON parsing
const safeJSONParse = (value, fallback) => {
  if (!value) return fallback;
  if (typeof value === 'object') return value;
  
  // Handle broken "[object Object]" strings from Sheets
  if (value === '[object Object]' || value === 'undefined' || value === 'null') {
    return fallback;
  }
  
  try {
    return JSON.parse(value);
  } catch (error) {
    // Silently ignore [object Object] errors from Sheets
    if (value !== '[object Object]') {
      console.error('JSON parse error:', error, value);
    }
    return fallback;
  }
};



const useDataStore = create((set, get) => ({
  // Data state
  loading: false,
  error: null,
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

  // Load all data from backend with JSON parsing
  loadData: async () => {
    set({ loading: true, error: null });
    try {
      const result = await api.getAll();
      const data = result.data || result;
      
      // Parse bookings with JSON fields
      console.log('📥 Loading bookings from Sheets, sample:', data.bookings?.[0]);
      const parsedBookings = (data.bookings || []).map(booking => {
        // Parse selectedSAC first
        let selectedSAC = {};
        if (typeof booking.selectedSAC === 'string' && booking.selectedSAC) {
          try {
            selectedSAC = JSON.parse(booking.selectedSAC);
          } catch (e) {
            selectedSAC = {};
          }
        } else if (typeof booking.selectedSAC === 'object') {
          selectedSAC = booking.selectedSAC;
        }
        
        // Parse learners from CSV or extract from selectedSAC
        let learners = [];
        if (typeof booking.learners === 'string' && booking.learners) {
          learners = booking.learners.split(',').map(id => id.trim()).filter(Boolean);
        } else if (Array.isArray(booking.learners) && booking.learners.length > 0) {
          learners = booking.learners;
        } else if (Object.keys(selectedSAC).length > 0) {
          // Extract learner IDs from selectedSAC keys and look up studentIds
          const generatedIds = Object.keys(selectedSAC);
          learners = generatedIds.map(genId => {
            const learner = get().learners.find(l => l.id === genId);
            return learner?.studentId || genId;
          }).filter(Boolean);
        }
        
        return {
          ...booking,
          learners,
          learnerNames: typeof booking.learnerNames === 'string' && booking.learnerNames ? booking.learnerNames.split(', ').map(name => name.trim()).filter(Boolean) : (Array.isArray(booking.learnerNames) ? booking.learnerNames : []),
          readerWriters: safeJSONParse(booking.readerWriters, {}),
          learnerVenues: safeJSONParse(booking.learnerVenues, {}),
          smallGroups: safeJSONParse(booking.smallGroups, []),
          readerWriterAssignments: safeJSONParse(booking.readerWriterAssignments, {}),
          selectedSAC
        };
      });
      console.log('📥 Parsed bookings, first one:', parsedBookings[0]);
      set({
        bookings: parsedBookings,
        bookingHistory: data.bookingHistory || [],
        learners: data.learners || [],
        teachers: data.teachers || [],
        readerWriters: data.readerWriters || [],
        venues: data.venues || [],
        subjects: data.subjects || [],
        blockedSlots: data.blockedSlots || [],
        sessionCapacities: data.sessionCapacities || {},
        notifications: data.notifications || [],
        loading: false
      });
      
      console.log('Data loaded:', {
        bookings: parsedBookings.length,
        learners: data.learners?.length || 0,
        teachers: data.teachers?.length || 0
      });
      
      return true;
    } catch (error) {
      console.error('Load data error:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Save bookings (handles both single and multi-session)
  saveBooking: async (form, isEdit = false) => {
    const { bookings, bookingHistory } = get();
    set({ loading: true });

    try {
      let newBookings = [...bookings];
      let newHistory = [...bookingHistory];
      const now = new Date().toISOString();

      if (form.isMultiSession) {
        // Multi-session booking
        const groupId = generateUniqueId();
        const sessions = form.multiSessionData || [];
        const totalSessions = sessions.length;

        // Create primary booking
        const primaryBooking = {
          ...form,
          id: isEdit ? form.id : generateUniqueId(),
          isMultiSession: true,
          multiSessionGroupId: groupId,
          isPrimarySession: true,
          sessionNumber: 1,
          totalSessions: totalSessions,
          linkedSessionIds: [],
          createdAt: isEdit ? form.createdAt : now,
          updatedAt: now
        };

        // Create additional bookings (sessions 2 onwards from multiSessionData)
        const additionalBookings = sessions.slice(1).map((session, idx) => ({
          ...form,
          id: generateUniqueId(),
          date: session.date,
          day: session.day,
          period: session.period,
          isMultiSession: true,
          multiSessionGroupId: groupId,
          isPrimarySession: false,
          sessionNumber: idx + 2,
          totalSessions: totalSessions,
          linkedSessionIds: [],
          createdAt: now,
          updatedAt: now
        }));

        // Link all sessions
        const allSessionIds = [
          primaryBooking.id,
          ...additionalBookings.map(b => b.id)
        ];

        primaryBooking.linkedSessionIds = allSessionIds.filter(id => id !== primaryBooking.id);
        additionalBookings.forEach(booking => {
          booking.linkedSessionIds = allSessionIds.filter(id => id !== booking.id);
        });

        // Update bookings array
        if (isEdit) {
          newBookings = newBookings.map(b => 
            b.id === primaryBooking.id ? primaryBooking : b
          ).concat(additionalBookings);
        } else {
          newBookings = [...newBookings, primaryBooking, ...additionalBookings];
        }

        // Add history entries
        const historyAction = isEdit ? 'edited' : 'created';
        allSessionIds.forEach(id => {
          newHistory.push({
            id: generateUniqueId(),
            bookingId: id,
            timestamp: now,
            action: historyAction,
            user: form.teacherEmail,
            changes: { multiSession: true }
          });
        });

      } else {
        // Single booking
        const booking = {
          ...form,
          id: isEdit ? form.id : generateUniqueId(),
          isMultiSession: false,
          createdAt: isEdit ? form.createdAt : now,
          updatedAt: now
        };

        if (isEdit) {
          newBookings = newBookings.map(b => b.id === booking.id ? booking : b);
        } else {
          newBookings = [...newBookings, booking];
        }

        newHistory.push({
          id: generateUniqueId(),
          bookingId: booking.id,
          timestamp: now,
          action: isEdit ? 'edited' : 'created',
          user: form.teacherEmail,
          changes: {}
        });
      }

      // Save to backend
      await api.saveMultiple([
        { action: 'saveBookings', data: newBookings },
        { action: 'saveBookingHistory', data: newHistory }
      ]);

      set({ bookings: newBookings, bookingHistory: newHistory, loading: false });
      return true;
    } catch (error) {
      console.error('Save booking error:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateBookingStatus: async (bookingId, newStatus, reason = null, rwAssignments = null) => {
    console.log('🔵 updateBookingStatus called with:', { bookingId, newStatus, rwAssignments });
    const { bookings } = get();
    const booking = bookings.find(b => b.id === bookingId);
    
    if (!booking) {
      throw new Error('Booking not found');
    }

    // Update the booking
    const updatedBooking = {
      ...booking,
      status: newStatus,
      declineReason: reason,
      readerWriterAssignments: rwAssignments || booking.readerWriterAssignments,
      updatedAt: new Date().toISOString()
    };

    // Update in state
    set((state) => ({
      bookings: state.bookings.map(b =>
        b.id === bookingId ? updatedBooking : b
      )
    }));

    // Save to localStorage
    const updatedBookings = get().bookings;
    localStorage.setItem('sac_bookings', JSON.stringify(updatedBookings));

    return updatedBooking;
  },

  // Update booking (for status changes, R/W assignments, etc.)
  updateBooking: async (bookingId, updates, reason = '') => {
    const { bookings, bookingHistory } = get();
    set({ loading: true });

    try {
      const newBookings = bookings.map(b => 
        b.id === bookingId ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b
      );

      const historyEntry = {
        id: generateUniqueId(),
        bookingId: bookingId,
        timestamp: new Date().toISOString(),
        action: 'updated',
        user: updates.user || 'system',
        reason: reason,
        changes: updates
      };

      const newHistory = [...bookingHistory, historyEntry];

      await api.saveMultiple([
        { action: 'saveBookings', data: newBookings },
        { action: 'saveBookingHistory', data: newHistory }
      ]);

      set({ bookings: newBookings, bookingHistory: newHistory, loading: false });
      return true;
    } catch (error) {
      console.error('Update booking error:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Delete booking
  deleteBooking: async (bookingId, reason, userEmail) => {
    const { bookings, bookingHistory } = get();
    set({ loading: true });

    try {
      const booking = bookings.find(b => b.id === bookingId);
      
      // If multi-session, delete all linked bookings
      let idsToDelete = [bookingId];
      if (booking?.isMultiSession && booking?.linkedSessionIds) {
        idsToDelete = [bookingId, ...booking.linkedSessionIds];
      }

      const newBookings = bookings.filter(b => !idsToDelete.includes(b.id));
      
      const historyEntries = idsToDelete.map(id => ({
        id: generateUniqueId(),
        bookingId: id,
        timestamp: new Date().toISOString(),
        action: 'deleted',
        user: userEmail,
        reason: reason
      }));

      const newHistory = [...bookingHistory, ...historyEntries];

      await api.saveMultiple([
        { action: 'saveBookings', data: newBookings },
        { action: 'saveBookingHistory', data: newHistory }
      ]);

      set({ bookings: newBookings, bookingHistory: newHistory, loading: false });
      return true;
    } catch (error) {
      console.error('Delete booking error:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Approve booking
  approveBooking: async (id) => {
    return get().updateBooking(id, { status: 'confirmed' });
  },

  // Decline booking
  declineBooking: async (id, reason) => {
    return get().updateBooking(id, { 
      status: 'declined',
      declineReason: reason,
      declinedAt: new Date().toISOString()
    });
  },

  // Learner management
  addLearner: async (learner) => {
    const { learners } = get();
    set({ loading: true });

    try {
      const newLearner = {
        ...learner,
        id: generateUniqueId()
      };

      const newLearners = [...learners, newLearner];
      await api.saveLearners(newLearners);
      set({ learners: newLearners, loading: false });
      return true;
    } catch (error) {
      console.error('Add learner error:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateLearner: async (id, updates) => {
    const { learners } = get();
    set({ loading: true });

    try {
      const newLearners = learners.map(l => 
        l.id === id ? { ...l, ...updates } : l
      );
      await api.saveLearners(newLearners);
      set({ learners: newLearners, loading: false });
      return true;
    } catch (error) {
      console.error('Update learner error:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteLearner: async (learnerId) => {
    const { learners } = get();
    set({ loading: true });

    try {
      const newLearners = learners.filter(l => l.id !== learnerId);
      await api.saveLearners(newLearners);
      set({ learners: newLearners, loading: false });
      return true;
    } catch (error) {
      console.error('Delete learner error:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Teacher management
  addTeacher: async (teacher) => {
    const { teachers } = get();
    set({ loading: true });

    try {
      const newTeacher = {
        ...teacher,
        id: generateUniqueId()
      };

      const newTeachers = [...teachers, newTeacher];
      await api.saveTeachers(newTeachers);
      set({ teachers: newTeachers, loading: false });
      return true;
    } catch (error) {
      console.error('Add teacher error:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateTeacher: async (id, updates) => {
    const { teachers } = get();
    set({ loading: true });

    try {
      const newTeachers = teachers.map(t => 
        t.id === id ? { ...t, ...updates } : t
      );
      await api.saveTeachers(newTeachers);
      set({ teachers: newTeachers, loading: false });
      return true;
    } catch (error) {
      console.error('Update teacher error:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteTeacher: async (teacherId) => {
    const { teachers } = get();
    set({ loading: true });

    try {
      const newTeachers = teachers.filter(t => t.id !== teacherId);
      await api.saveTeachers(newTeachers);
      set({ teachers: newTeachers, loading: false });
      return true;
    } catch (error) {
      console.error('Delete teacher error:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Reader/Writer management
  addReaderWriter: async (rw) => {
    const { readerWriters } = get();
    set({ loading: true });

    try {
      const newRW = {
        ...rw,
        id: generateUniqueId()
      };

      const newReaderWriters = [...readerWriters, newRW];
      await api.saveReaderWriters(newReaderWriters);
      set({ readerWriters: newReaderWriters, loading: false });
      return true;
    } catch (error) {
      console.error('Add R/W error:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateReaderWriter: async (id, updates) => {
    const { readerWriters } = get();
    set({ loading: true });

    try {
      const newReaderWriters = readerWriters.map(rw => 
        rw.id === id ? { ...rw, ...updates } : rw
      );
      await api.saveReaderWriters(newReaderWriters);
      set({ readerWriters: newReaderWriters, loading: false });
      return true;
    } catch (error) {
      console.error('Update R/W error:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteReaderWriter: async (rwId) => {
    const { readerWriters } = get();
    set({ loading: true });

    try {
      const newReaderWriters = readerWriters.filter(rw => rw.id !== rwId);
      await api.saveReaderWriters(newReaderWriters);
      set({ readerWriters: newReaderWriters, loading: false });
      return true;
    } catch (error) {
      console.error('Delete R/W error:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Venue management
  addVenue: async (venue) => {
    const { venues } = get();
    set({ loading: true });

    try {
      const newVenue = {
        ...venue,
        id: generateUniqueId()
      };

      const newVenues = [...venues, newVenue];
      await api.saveVenues(newVenues);
      set({ venues: newVenues, loading: false });
      return true;
    } catch (error) {
      console.error('Add venue error:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateVenue: async (id, updates) => {
    const { venues } = get();
    set({ loading: true });

    try {
      const newVenues = venues.map(v => 
        v.id === id ? { ...v, ...updates } : v
      );
      await api.saveVenues(newVenues);
      set({ venues: newVenues, loading: false });
      return true;
    } catch (error) {
      console.error('Update venue error:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteVenue: async (venueId) => {
    const { venues } = get();
    set({ loading: true });

    try {
      const newVenues = venues.filter(v => v.id !== venueId);
      await api.saveVenues(newVenues);
      set({ venues: newVenues, loading: false });
      return true;
    } catch (error) {
      console.error('Delete venue error:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Subject management
  addSubject: async (subject) => {
    const { subjects } = get();
    set({ loading: true });

    try {
      const newSubject = {
        ...subject,
        id: generateUniqueId()
      };

      const newSubjects = [...subjects, newSubject];
      await api.saveSubjects(newSubjects);
      set({ subjects: newSubjects, loading: false });
      return true;
    } catch (error) {
      console.error('Add subject error:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateSubject: async (id, updates) => {
    const { subjects } = get();
    set({ loading: true });

    try {
      const newSubjects = subjects.map(s => 
        s.id === id ? { ...s, ...updates } : s
      );
      await api.saveSubjects(newSubjects);
      set({ subjects: newSubjects, loading: false });
      return true;
    } catch (error) {
      console.error('Update subject error:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteSubject: async (subjectId) => {
    const { subjects } = get();
    set({ loading: true });

    try {
      const newSubjects = subjects.filter(s => s.id !== subjectId);
      await api.saveSubjects(newSubjects);
      set({ subjects: newSubjects, loading: false });
      return true;
    } catch (error) {
      console.error('Delete subject error:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Blocked slots management
  blockSlot: async (slot, reason) => {
    const { blockedSlots } = get();
    set({ loading: true });

    try {
      const newSlot = {
        id: generateUniqueId(),
        ...slot,
        reason: reason,
        blockedAt: new Date().toISOString()
      };

      const newBlockedSlots = [...blockedSlots, newSlot];
      await api.saveBlockedSlots(newBlockedSlots);
      set({ blockedSlots: newBlockedSlots, loading: false });
      return true;
    } catch (error) {
      console.error('Block slot error:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  unblockSlot: async (date, day, period) => {
    const { blockedSlots } = get();
    set({ loading: true });

    try {
      const newBlockedSlots = blockedSlots.filter(s => 
        !(s.date === date && s.day === day && s.period === period)
      );
      await api.saveBlockedSlots(newBlockedSlots);
      set({ blockedSlots: newBlockedSlots, loading: false });
      return true;
    } catch (error) {
      console.error('Unblock slot error:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  deleteBlockedSlot: async (id) => {
    const { blockedSlots } = get();
    set({ loading: true });

    try {
      const newBlockedSlots = blockedSlots.filter(s => s.id !== id);
      await api.saveBlockedSlots(newBlockedSlots);
      set({ blockedSlots: newBlockedSlots, loading: false });
      return true;
    } catch (error) {
      console.error('Delete blocked slot error:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Session capacity management
  setSessionCapacity: async (date, day, period, capacity) => {
    const { sessionCapacities } = get();
    set({ loading: true });

    try {
      const key = getCapacityKey({ date, day, period });
      const newCapacities = {
        ...sessionCapacities,
        [key]: capacity
      };

      await api.saveSessionCapacities(newCapacities);
      set({ sessionCapacities: newCapacities, loading: false });
      return true;
    } catch (error) {
      console.error('Set capacity error:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Alias for compatibility
  updateCapacity: async (date, day, period, capacity) => {
    return get().setSessionCapacity(date, day, period, capacity);
  },

  getMaxCapacity: (date, day, period) => {
    const { sessionCapacities } = get();
    const key = getCapacityKey({ date, day, period });
    return sessionCapacities[key] || DEFAULT_MAX_CAPACITY;
  },

  // Get count of booked slots for a specific session
  // Get count of LEARNERS (not bookings) for a specific session
  getBookedSlotsCount: (date, day, period) => {
    const bookings = get().bookings;
    const relevantBookings = bookings.filter(b => 
      isSameLocalDate(b.date, date) && 
      b.day === day && 
      b.period === period &&
      (b.status === 'confirmed' || b.status === 'pending')
    );
    
    // Count total learners across all bookings
    let totalLearners = 0;
    relevantBookings.forEach(booking => {
      // Parse learners array
      let learners = [];
      if (Array.isArray(booking.learners)) {
        learners = booking.learners;
      } else if (typeof booking.learners === 'string') {
        try {
          learners = JSON.parse(booking.learners);
        } catch (e) {
          learners = [];
        }
      }
      totalLearners += learners.length || 0;
    });
    
    return totalLearners;
  },

  // Helper functions
  getAvailableSlots: (date, day, period) => {
    const { bookings } = get();
    const max = get().getMaxCapacity(date, day, period);
    
    // Get all bookings for this slot (pending + confirmed, exclude fully declined)
    const slotBookings = bookings.filter(b => 
      isSameLocalDate(b.date, date) && 
      b.day === day && 
      String(b.period) === String(period) &&
      b.status !== 'declined' // Exclude fully declined bookings
    );
    
    let slotsUsed = 0;
    
    slotBookings.forEach(booking => {
      if (booking.status === 'pending') {
        // PENDING: Check if R/W assignments exist
        const rwAssignments = booking.readerWriterAssignments || {};
        const hasRWAssignments = Object.keys(rwAssignments).length > 0;
        
        if (hasRWAssignments) {
          // Admin has assigned R/W but not yet approved - count R/W assignments
          slotsUsed += Object.keys(rwAssignments).length;
        } else {
          // No R/W assigned yet - count learners WITH SAC (exclude declined SAC)
          const learnersWithSAC = booking.learners.filter(learnerId => 
            !booking.declinedSACLearners?.includes(learnerId)
          );
          slotsUsed += learnersWithSAC.length;
        }
        
      } else if (booking.status === 'confirmed' || booking.status === 'edit_confirmed') {
        // CONFIRMED: Count R/W assignments
        // Each R/W assignment = 1 slot (whether it's a group or one-on-one)
        const rwAssignments = booking.readerWriterAssignments || {};
        slotsUsed += Object.keys(rwAssignments).length;
      }
    });
    
    const available = Math.max(0, max - slotsUsed);
    
    console.log('📊 getAvailableSlots FIXED:', {
      date, day, period, max,
      slotBookings: slotBookings.map(b => ({
        id: b.id,
        status: b.status,
        totalLearners: b.learners?.length,
        declinedSAC: b.declinedSACLearners?.length || 0,
        rwAssignments: Object.keys(b.readerWriterAssignments || {}).length,
        rwDetails: b.readerWriterAssignments // Show the actual assignments
      })),
      slotsUsed,
      available
    });
    
    return available;
  },

  isSlotBlocked: (date, day, period) => {
    const { blockedSlots } = get();
    return blockedSlots.some(s => 
      s.date === date && 
      s.day === day && 
      String(s.period) === String(period)
    );
  },

  canBookSlots: (date, day, period, learnersCount) => {
    const available = get().getAvailableSlots(date, day, period);
    return available >= learnersCount;
  }
}));

  // =======================================
  // EMAIL FUNCTIONALITY
  // =======================================

  /**
   * Send emails for a booking (client-side via mailto)
   * Opens email client with pre-filled content
   */
  sendEmails: async (booking, emailType = 'all') => {
    const { learners: allLearners, readerWriters, teachers } = get();
    
    try {
      // Get learner objects for this booking
      const bookingLearnerIds = Array.isArray(booking.learners) 
        ? booking.learners 
        : (typeof booking.learners === 'string' ? booking.learners.split(',').map(id => id.trim()) : []);
      
      const bookingLearners = bookingLearnerIds
        .map(id => allLearners.find(l => l.id === id || l.studentId === id))
        .filter(Boolean);

      const results = {
        success: true,
        teacherSent: false,
        learnersSent: 0,
        totalLearners: bookingLearners.length,
        errors: []
      };

      // Send teacher email
      if (emailType === 'all' || emailType === 'teacher') {
        try {
          const { generateTeacherEmail, sendEmail } = await import('../utils/emailHelpers');
          const emailData = generateTeacherEmail(booking, bookingLearners);
          sendEmail(emailData);
          results.teacherSent = true;
          
          // Update booking with teacher email status
          await get().updateBooking(booking.id, {
            teacherEmailSent: true,
            teacherEmailDate: new Date().toISOString()
          });
        } catch (error) {
          console.error('Teacher email error:', error);
          results.errors.push(`Teacher: ${error.message}`);
        }
      }

      // Send learner emails (one at a time via sequential mailto links)
      if (emailType === 'all' || emailType === 'learners') {
        for (const learner of bookingLearners) {
          try {
            const { generateLearnerEmail, sendEmail } = await import('../utils/emailHelpers');
            const emailData = generateLearnerEmail(booking, learner);
            
            if (emailData.to) {
              sendEmail(emailData);
              results.learnersSent++;
              
              // Small delay between emails to allow email client to process
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          } catch (error) {
            console.error(`Learner email error (${learner.firstName}):`, error);
            results.errors.push(`${learner.firstName}: ${error.message}`);
          }
        }

        // Update booking with learner email status
        if (results.learnersSent > 0) {
          await get().updateBooking(booking.id, {
            learnerEmailsSent: results.learnersSent,
            learnerEmailsDate: new Date().toISOString()
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Send emails error:', error);
      throw error;
    }
  },

  /**
   * Send R/W weekly duties email
   */
  sendRWDuties: async (rwId, weekOffset = 0) => {
    const { readerWriters, bookings, learners: allLearners } = get();
    const rw = readerWriters.find(r => r.id === rwId);
    
    if (!rw) {
      throw new Error('Reader/Writer not found');
    }

    // Calculate week dates
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) + (weekOffset * 7));
    
    const weekDates = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      weekDates.push(date);
    }

    // Find assignments for this R/W
    const rwName = `${rw.firstName} ${rw.lastName}`;
    const assignments = [];

    weekDates.forEach(date => {
      const dayIndex = date.getDay();
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = dayNames[dayIndex];

      // Check if R/W is available this day
      if (!rw.daysAvailable?.includes(dayName)) return;

      const dateStr = date.toISOString().split('T')[0];

      // Find bookings for this date where this R/W is assigned
      bookings.forEach(booking => {
        if (booking.date !== dateStr || booking.status !== 'confirmed') return;

        // Check readerWriterAssignments for this R/W
        if (booking.readerWriterAssignments) {
          Object.entries(booking.readerWriterAssignments).forEach(([key, assignment]) => {
            if (assignment.readerWriter === rwName) {
              const learnerIds = assignment.type === 'group' 
                ? assignment.learners 
                : [key];

              learnerIds.forEach(learnerId => {
                const learner = allLearners.find(l => l.id === learnerId);
                if (learner) {
                  const periodInfo = SCHEDULE[booking.day]?.[booking.period] || {};
                  assignments.push({
                    date,
                    period: periodInfo,
                    learner: `${learner.firstName} ${learner.lastName}`,
    subject: booking.subject,
                    venue: assignment.venue || 'TBD'
                  });
                }
              });
            }
          });
        }
      });
    });

    if (assignments.length === 0) {
      throw new Error('No assignments for this R/W this week');
    }

    // Generate and send email
    const { generateRWWeeklyEmail, sendEmail } = await import('../utils/emailHelpers');
    const emailData = generateRWWeeklyEmail(rw, assignments, weekDates[0], weekDates[4]);
    sendEmail(emailData);

    return {
      success: true,
      assignmentsCount: assignments.length
    };
  }
}));



export { useDataStore };
export default useDataStore;
