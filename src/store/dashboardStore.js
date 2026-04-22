import { create } from 'zustand';

const useDashboardStore = create((set, get) => ({
  // Filter state
  selectedTerm: 'Term 1 2026',
  selectedYearLevel: 'All',
  selectedSubject: 'All',
  selectedTeacher: 'All',
  dateRange: null,

  // Actions
  setFilters: (filters) => set(filters),
  resetFilters: () => set({
    selectedTerm: 'Term 1 2026',
    selectedYearLevel: 'All',
    selectedSubject: 'All',
    selectedTeacher: 'All',
    dateRange: null
  }),

  // ============================================
  // CALCULATION FUNCTIONS
  // ============================================

  /**
   * Get filtered bookings based on current filters
   */
  getFilteredBookings: (allBookings) => {
    const state = get();
    let filtered = [...allBookings];

    console.log(`🔍 FILTER DEBUG: Starting with ${filtered.length} bookings`);
    console.log(`   Selected term: ${state.selectedTerm}`);
    
    // Debug: Show pending bookings specifically
    const pendingBookings = filtered.filter(b => 
      b.status === 'pending' || b.status === 'edit_pending' || b.status === 'deletion_pending'
    );
    console.log(`   📋 Found ${pendingBookings.length} pending bookings (any term):`);
    pendingBookings.forEach(b => {
      const bookingDate = new Date(b.date);
      console.log(`      - ID ${b.id}:`);
      console.log(`        Status: ${b.status}`);
      console.log(`        Date field: ${b.date}`);
      console.log(`        Day: ${b.day}`);
      console.log(`        Subject: ${b.subject || 'N/A'}`);
      console.log(`        Local date: ${bookingDate.toLocaleDateString()}`);
      console.log(`        Year level: ${b.yearLevel || 'N/A'}`);
    });

    // Filter by term dates
    const termDates = {
      'Term 1 2026': { start: new Date('2026-02-01'), end: new Date('2026-04-17') },
      'Term 2 2026': { start: new Date('2026-04-20'), end: new Date('2026-07-10') },
      'Term 3 2026': { start: new Date('2026-07-27'), end: new Date('2026-10-02') },
      'Term 4 2026': { start: new Date('2026-10-19'), end: new Date('2026-12-11') },
      'Term 1 2025': { start: new Date('2025-02-03'), end: new Date('2025-04-18') },
      'Term 2 2025': { start: new Date('2025-05-05'), end: new Date('2025-07-11') },
      'Term 3 2025': { start: new Date('2025-07-28'), end: new Date('2025-10-03') },
      'Term 4 2025': { start: new Date('2025-10-20'), end: new Date('2025-12-12') }
    };

    if (state.selectedTerm && termDates[state.selectedTerm]) {
      const { start, end } = termDates[state.selectedTerm];
      console.log(`   Term dates: ${start.toISOString()} to ${end.toISOString()}`);
      console.log(`   Term dates (local): ${start.toLocaleDateString()} to ${end.toLocaleDateString()}`);
      
      let matchedCount = 0;
      filtered = filtered.filter(b => {
        // Parse booking date and convert to NZ timezone (local date)
        let bookingDate;
        if (typeof b.date === 'string') {
          bookingDate = new Date(b.date);
        } else {
          bookingDate = b.date;
        }
        
        // Create a date string in NZ timezone for comparison
        // Extract year, month, day in LOCAL timezone (NZ)
        const nzYear = bookingDate.getFullYear();
        const nzMonth = bookingDate.getMonth();
        const nzDay = bookingDate.getDate();
        const bookingDateNZ = new Date(nzYear, nzMonth, nzDay);
        
        const inRange = bookingDateNZ >= start && bookingDateNZ <= end;
        
        if (inRange) matchedCount++;
        
        // Log first 5 bookings that match AND first 5 that don't
        if ((inRange && matchedCount <= 5) || (!inRange && (filtered.indexOf(b) - matchedCount) < 5)) {
          console.log(`   📅 Booking ${b.id}: date="${b.date}"`);
          console.log(`      UTC: ${bookingDate.toISOString()}`);
          console.log(`      NZ local: ${bookingDate.toLocaleDateString()} (${nzYear}-${String(nzMonth+1).padStart(2,'0')}-${String(nzDay).padStart(2,'0')})`);
          console.log(`      Comparing: ${bookingDateNZ.toLocaleDateString()} vs ${start.toLocaleDateString()} to ${end.toLocaleDateString()}`);
          console.log(`      -> in range? ${inRange}`);
        }
        
        return inRange;
      });
      console.log(`   ✅ After term filter: ${filtered.length} bookings (matched ${matchedCount})`);
    } else {
      console.log(`   ⚠️ No term filter applied (term: ${state.selectedTerm})`);
    }

    // Filter by year level
    if (state.selectedYearLevel !== 'All') {
      filtered = filtered.filter(b => String(b.yearLevel) === String(state.selectedYearLevel));
      console.log(`   After year filter: ${filtered.length} bookings`);
    }

    // Filter by subject
    if (state.selectedSubject !== 'All') {
      filtered = filtered.filter(b => b.subject === state.selectedSubject);
      console.log(`   After subject filter: ${filtered.length} bookings`);
    }

    // Filter by teacher
    if (state.selectedTeacher !== 'All') {
      filtered = filtered.filter(b => b.teacher === state.selectedTeacher);
      console.log(`   After teacher filter: ${filtered.length} bookings`);
    }

    console.log(`✅ Final filtered bookings: ${filtered.length}`);
    return filtered;
  },

  /**
   * Calculate pending approvals count
   */
  getPendingApprovals: (bookings) => {
    const pending = bookings.filter(b => b.status === 'pending').length;
    const editPending = bookings.filter(b => b.status === 'edit_pending').length;
    const deletionPending = bookings.filter(b => b.status === 'deletion_pending').length;

    return {
      total: pending + editPending + deletionPending,
      new: pending,
      edited: editPending,
      deletion: deletionPending
    };
  },

  /**
   * Calculate capacity warnings
   * Returns periods that are 85%+ full in the next 2 weeks
   */
  getCapacityWarnings: (bookings, getBookedSlotsCount, getMaxCapacity) => {
    const warnings = [];
    const today = new Date();
    const twoWeeksFromNow = new Date(today);
    twoWeeksFromNow.setDate(today.getDate() + 14);

    // Get unique date/day/period combinations from upcoming bookings
    const upcomingSlots = new Map();
    
    bookings.forEach(booking => {
      const bookingDate = new Date(booking.date);
      if (bookingDate >= today && bookingDate <= twoWeeksFromNow) {
        const key = `${booking.date}_${booking.day}_${booking.period}`;
        if (!upcomingSlots.has(key)) {
          upcomingSlots.set(key, {
            date: booking.date,
            day: booking.day,
            period: booking.period
          });
        }
      }
    });

    // Check capacity for each slot
    upcomingSlots.forEach(slot => {
      const booked = getBookedSlotsCount(slot.date, slot.day, slot.period);
      const max = getMaxCapacity(slot.date, slot.day, slot.period);
      const utilization = max > 0 ? (booked / max) * 100 : 0;

      if (utilization >= 85) {
        warnings.push({
          ...slot,
          booked,
          max,
          utilization: Math.round(utilization),
          available: max - booked
        });
      }
    });

    return warnings.sort((a, b) => b.utilization - a.utilization);
  },

  /**
   * Get high-usage learners (1+ booking per week average - showing top learners)
   */
  getHighUsageLearners: (bookings, learners) => {
    const learnerBookingCounts = {};
    
    console.log('🔍 DEBUG: Starting high-usage learner calculation');
    console.log(`   Total bookings to process: ${bookings.length}`);
    console.log(`   Total learners available: ${learners.length}`);
    
    // Count bookings per learner
    bookings.forEach(booking => {
      if (booking.status === 'deleted' || booking.status === 'declined') return;
      
      // Get learner IDs from multiple possible sources
      let learnerIds = [];
      
      // Try booking.learners array first
      if (Array.isArray(booking.learners) && booking.learners.length > 0) {
        learnerIds = booking.learners;
      } else {
        // Fallback: extract from selectedSAC
        try {
          let selectedSAC = {};
          if (typeof booking.selectedSAC === 'string' && booking.selectedSAC.trim()) {
            selectedSAC = JSON.parse(booking.selectedSAC);
          } else if (typeof booking.selectedSAC === 'object' && booking.selectedSAC !== null) {
            selectedSAC = booking.selectedSAC;
          }
          learnerIds = Object.keys(selectedSAC).filter(id => id && id !== 'null' && id !== 'undefined');
        } catch (e) {
          // Silent fail, try next source
        }
        
        // If still no learners, try readerWriters
        if (learnerIds.length === 0) {
          try {
            let readerWriters = {};
            if (typeof booking.readerWriters === 'string' && booking.readerWriters.trim()) {
              readerWriters = JSON.parse(booking.readerWriters);
            } else if (typeof booking.readerWriters === 'object' && booking.readerWriters !== null) {
              readerWriters = booking.readerWriters;
            }
            learnerIds = Object.keys(readerWriters).filter(id => id && id !== 'null' && id !== 'undefined');
          } catch (e) {
            // Silent fail, try next source
          }
        }
        
        // Last resort: try learnerVenues
        if (learnerIds.length === 0) {
          try {
            let learnerVenues = {};
            if (typeof booking.learnerVenues === 'string' && booking.learnerVenues.trim()) {
              learnerVenues = JSON.parse(booking.learnerVenues);
            } else if (typeof booking.learnerVenues === 'object' && booking.learnerVenues !== null) {
              learnerVenues = booking.learnerVenues;
            }
            learnerIds = Object.keys(learnerVenues).filter(id => id && id !== 'null' && id !== 'undefined');
          } catch (e) {
            // No learners found anywhere
          }
        }
      }
      
      // Count bookings per FULL learner ID (don't normalize)
      learnerIds.forEach(learnerId => {
        if (!learnerBookingCounts[learnerId]) {
          learnerBookingCounts[learnerId] = 0;
        }
        learnerBookingCounts[learnerId]++;
      });
    });

    console.log(`📊 Learner booking counts (using FULL IDs):`, learnerBookingCounts);
    console.log(`   Total unique learners with bookings: ${Object.keys(learnerBookingCounts).length}`);

    // Calculate per-week average (assuming term is ~10 weeks)
    const weeksInTerm = 10;
    const highUsageThreshold = 1; // 1 booking per week (10 bookings per term)

    const highUsage = [];
    Object.entries(learnerBookingCounts).forEach(([learnerId, count]) => {
      const perWeek = count / weeksInTerm;
      
      if (perWeek >= highUsageThreshold) {
        // Match learner by exact ID or by prefix (handle both string and number IDs)
        const learner = learners.find(l => String(l.id) === String(learnerId));
        
        if (learner) {
          // Extract SAC conditions from this learner's bookings
          const sacConditions = new Set();
          let bookingsChecked = 0;
          let bookingsWithSAC = 0;
          
          bookings.forEach(booking => {
            if (booking.status === 'deleted' || booking.status === 'declined') return;
            
            bookingsChecked++;
            
            // Check if this booking includes this learner
            try {
              let selectedSAC = {};
              if (typeof booking.selectedSAC === 'string' && booking.selectedSAC.trim()) {
                selectedSAC = JSON.parse(booking.selectedSAC);
              } else if (typeof booking.selectedSAC === 'object' && booking.selectedSAC !== null) {
                selectedSAC = booking.selectedSAC;
              }
              
              // If this learner is in this booking, add their SAC conditions
              if (selectedSAC[learnerId] && Array.isArray(selectedSAC[learnerId])) {
                bookingsWithSAC++;
                selectedSAC[learnerId].forEach(condition => sacConditions.add(condition));
              }
            } catch (e) {
              // Silent fail
            }
          });
          
          const conditions = Array.from(sacConditions);
          console.log(`   ✓ SHOWING: ${learner.firstName} ${learner.lastName} (ID: ${learnerId})`);
          console.log(`      - ${count} bookings (${perWeek.toFixed(1)}/week)`);
          console.log(`      - Checked ${bookingsChecked} bookings, found SAC in ${bookingsWithSAC}`);
          console.log(`      - SAC conditions extracted:`, conditions);
          console.log(`      - Learner record conditions:`, learner.conditions);
          console.log(`      - Final conditions to display:`, conditions.length > 0 ? conditions : (learner.conditions || []));
          
          highUsage.push({
            learner: {
              ...learner,
              conditions: conditions.length > 0 ? conditions : (learner.conditions || [])
            },
            totalBookings: count,
            perWeek: Math.round(perWeek * 10) / 10
          });
        } else {
          console.log(`   ✗ Learner ID ${learnerId} not found in learners array (${count} bookings)`);
        }
      }
    });

    console.log(`🎯 Final learners shown: ${highUsage.length}`);
    
    // If still no one meets threshold, show top 20 anyway
    if (highUsage.length === 0 && Object.keys(learnerBookingCounts).length > 0) {
      console.log(`⚠️ No learners met threshold, showing top 20 by booking count`);
      const sorted = Object.entries(learnerBookingCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20);
      
      sorted.forEach(([learnerId, count]) => {
        const learner = learners.find(l => String(l.id) === String(learnerId));
        if (learner) {
          // Extract SAC conditions from this learner's bookings
          const sacConditions = new Set();
          bookings.forEach(booking => {
            if (booking.status === 'deleted' || booking.status === 'declined') return;
            
            try {
              let selectedSAC = {};
              if (typeof booking.selectedSAC === 'string' && booking.selectedSAC.trim()) {
                selectedSAC = JSON.parse(booking.selectedSAC);
              } else if (typeof booking.selectedSAC === 'object' && booking.selectedSAC !== null) {
                selectedSAC = booking.selectedSAC;
              }
              
              if (selectedSAC[learnerId] && Array.isArray(selectedSAC[learnerId])) {
                selectedSAC[learnerId].forEach(condition => sacConditions.add(condition));
              }
            } catch (e) {
              // Silent fail
            }
          });
          
          const conditions = Array.from(sacConditions);
          const perWeek = count / weeksInTerm;
          
          highUsage.push({
            learner: {
              ...learner,
              conditions: conditions.length > 0 ? conditions : learner.conditions || []
            },
            totalBookings: count,
            perWeek: Math.round(perWeek * 10) / 10
          });
        }
      });
    }
    
    return highUsage.sort((a, b) => b.totalBookings - a.totalBookings);
  },

  /**
   * Get R/W utilization statistics
   */
  getRWUtilization: (bookings, readerWriters) => {
    const rwAssignments = {};

    // Count assignments per R/W
    bookings.forEach(booking => {
      if (booking.status === 'deleted' || booking.status === 'declined') return;
      
      let rwObj = {};
      try {
        if (typeof booking.readerWriters === 'string') {
          rwObj = JSON.parse(booking.readerWriters);
        } else if (typeof booking.readerWriters === 'object') {
          rwObj = booking.readerWriters || {};
        }
      } catch (e) {
        // Ignore parse errors
      }

      Object.values(rwObj).forEach(rwName => {
        if (rwName) {
          if (!rwAssignments[rwName]) {
            rwAssignments[rwName] = 0;
          }
          rwAssignments[rwName]++;
        }
      });
    });

    // Calculate utilization (assuming max ~50 bookings per term is 100% utilization)
    const maxBookingsPerTerm = 50;

    const utilization = readerWriters.map(rw => {
      const assignments = rwAssignments[rw.name] || 0;
      const utilizationPercent = Math.min(100, Math.round((assignments / maxBookingsPerTerm) * 100));
      
      return {
        rw,
        assignments,
        utilizationPercent,
        status: utilizationPercent >= 90 ? 'overloaded' : 
                utilizationPercent >= 70 ? 'busy' : 
                utilizationPercent >= 40 ? 'active' : 'available'
      };
    });

    return utilization.sort((a, b) => b.assignments - a.assignments);
  },

  /**
   * Get teacher engagement metrics
   */
  getTeacherEngagement: (bookings, teachers) => {
    const teacherBookingCounts = {};

    bookings.forEach(booking => {
      if (booking.status === 'deleted' || booking.status === 'declined') return;
      
      if (booking.teacher) {
        if (!teacherBookingCounts[booking.teacher]) {
          teacherBookingCounts[booking.teacher] = 0;
        }
        teacherBookingCounts[booking.teacher]++;
      }
    });

    const engagement = teachers.map(teacher => {
      const bookings = teacherBookingCounts[teacher.name] || 0;
      const status = bookings === 0 ? 'not_using' : 
                     bookings < 5 ? 'low_usage' : 'active';

      return {
        teacher,
        bookings,
        status
      };
    });

    return engagement.sort((a, b) => b.bookings - a.bookings);
  },

  /**
   * Get subject distribution
   */
  getSubjectDistribution: (bookings) => {
    const subjectCounts = {};

    bookings.forEach(booking => {
      if (booking.status === 'deleted' || booking.status === 'declined') return;
      
      if (booking.subject) {
        if (!subjectCounts[booking.subject]) {
          subjectCounts[booking.subject] = 0;
        }
        subjectCounts[booking.subject]++;
      }
    });

    return Object.entries(subjectCounts)
      .map(([subject, count]) => ({ subject, count }))
      .sort((a, b) => b.count - a.count);
  },

  /**
   * Get year level distribution
   */
  getYearLevelDistribution: (bookings) => {
    const yearCounts = {};

    bookings.forEach(booking => {
      if (booking.status === 'deleted' || booking.status === 'declined') return;
      
      if (booking.yearLevel) {
        const year = `Y${booking.yearLevel}`;
        if (!yearCounts[year]) {
          yearCounts[year] = 0;
        }
        yearCounts[year]++;
      }
    });

    return Object.entries(yearCounts)
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => {
        const aNum = parseInt(a.year.substring(1));
        const bNum = parseInt(b.year.substring(1));
        return aNum - bNum;
      });
  },

  /**
   * Get SAC condition breakdown
   */
  getSACBreakdown: (bookings, learners) => {
    const sacCounts = {
      'Reader': { learners: new Set(), bookings: 0 },
      'Writer': { learners: new Set(), bookings: 0 },
      'Extra Time': { learners: new Set(), bookings: 0 },
      'Computer': { learners: new Set(), bookings: 0 },
      'Separate Accommodation (Small Groups)': { learners: new Set(), bookings: 0 },
      'Separate accommodation - Isolation': { learners: new Set(), bookings: 0 },
      'Rest Breaks': { learners: new Set(), bookings: 0 }
    };

    bookings.forEach(booking => {
      if (booking.status === 'deleted' || booking.status === 'declined') return;
      
      // Parse selectedSAC
      let selectedSAC = {};
      try {
        if (typeof booking.selectedSAC === 'string') {
          selectedSAC = JSON.parse(booking.selectedSAC);
        } else if (typeof booking.selectedSAC === 'object') {
          selectedSAC = booking.selectedSAC || {};
        }
      } catch (e) {
        // Ignore
      }

      // Count SAC conditions per learner
      Object.entries(selectedSAC).forEach(([learnerId, conditions]) => {
        if (Array.isArray(conditions)) {
          conditions.forEach(condition => {
            if (sacCounts[condition]) {
              sacCounts[condition].learners.add(learnerId);
              sacCounts[condition].bookings++;
            }
          });
        }
      });
    });

    // Convert to array
    return Object.entries(sacCounts).map(([condition, data]) => ({
      condition,
      learnerCount: data.learners.size,
      bookingCount: data.bookings
    })).sort((a, b) => b.bookingCount - a.bookingCount);
  },

  /**
   * Get weekly capacity trend
   * Term 1 2026 starts: February 1, 2026 (Week 1)
   */
  getWeeklyTrend: (bookings) => {
    const weekCounts = {};
    
    // Define term start date (Term 1 2026 starts Feb 1)
    const term1Start = new Date('2026-02-01');

    bookings.forEach(booking => {
      if (booking.status === 'deleted' || booking.status === 'declined') return;
      
      const date = new Date(booking.date);
      
      // Calculate week number from term start
      const daysSinceTermStart = Math.floor((date - term1Start) / (1000 * 60 * 60 * 24));
      const weekNum = Math.floor(daysSinceTermStart / 7) + 1; // +1 because week 1 starts on day 0
      
      // Only include weeks 1-11 (Term 1 is typically 10-11 weeks)
      if (weekNum >= 1 && weekNum <= 11) {
        const key = `Week ${weekNum}`;
        
        if (!weekCounts[key]) {
          weekCounts[key] = { week: key, count: 0, sortKey: weekNum };
        }
        weekCounts[key].count++;
      }
    });

    return Object.values(weekCounts)
      .sort((a, b) => a.sortKey - b.sortKey)
      .map(({ week, count }) => ({ week, count }));
  },

  /**
   * Get blocked slots
   */
  getBlockedSlots: (blockedSlots) => {
    const now = new Date();
    return blockedSlots
      .filter(slot => {
        const slotDate = new Date(slot.date);
        return slotDate >= now;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  },

  /**
   * Get compliance metrics
   */
  getComplianceMetrics: (bookings) => {
    let within3DayWindow = 0;
    let totalLeadTime = 0;
    let cancellations = 0;
    let declinedSAC = 0;

    bookings.forEach(booking => {
      // Lead time calculation
      const createdDate = new Date(booking.createdAt);
      const bookingDate = new Date(booking.date);
      const leadDays = Math.floor((bookingDate - createdDate) / (1000 * 60 * 60 * 24));
      
      if (leadDays < 3) {
        within3DayWindow++;
      }
      totalLeadTime += leadDays;

      // Cancellations
      if (booking.status === 'deleted' || booking.status === 'declined') {
        cancellations++;
      }

      // Declined SAC
      if (booking.declinedSACLearners && booking.declinedSACLearners.length > 0) {
        declinedSAC++;
      }
    });

    const avgLeadTime = bookings.length > 0 ? Math.round(totalLeadTime / bookings.length * 10) / 10 : 0;
    const violationRate = bookings.length > 0 ? Math.round((within3DayWindow / bookings.length) * 100) : 0;
    const cancellationRate = bookings.length > 0 ? Math.round((cancellations / bookings.length) * 100) : 0;

    return {
      avgLeadTime,
      within3DayWindow,
      violationRate,
      cancellations,
      cancellationRate,
      declinedSAC
    };
  }
}));

export default useDashboardStore;
