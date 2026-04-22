import { SCRIPT_URL } from '../config';

class APIClient {
  constructor() {
    this.baseURL = SCRIPT_URL;
    this.timeout = 30000; // 30 seconds
  }

  async request(action, data = null) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(this.baseURL, {
        method: 'POST',
        body: JSON.stringify({ action, data }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Unknown error from backend');
      }

      return result;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please check your connection and try again.');
      }
      throw error;
    }
  }

  async getAll() {
    return this.request('getAll');
  }

  async saveData(action, data) {
    return this.request(action, data);
  }

  async saveBookings(bookings) {
    return this.request('saveBookings', bookings);
  }

  async saveBookingHistory(history) {
    return this.request('saveBookingHistory', history);
  }

  async saveLearners(learners) {
    return this.request('saveLearners', learners);
  }

  async saveTeachers(teachers) {
    return this.request('saveTeachers', teachers);
  }

  async saveReaderWriters(readerWriters) {
    return this.request('saveReaderWriters', readerWriters);
  }

  async saveVenues(venues) {
    return this.request('saveVenues', venues);
  }

  async saveSubjects(subjects) {
    return this.request('saveSubjects', subjects);
  }

  async saveBlockedSlots(blockedSlots) {
    return this.request('saveBlockedSlots', blockedSlots);
  }

  async saveSessionCapacities(sessionCapacities) {
    return this.request('saveSessionCapacities', sessionCapacities);
  }

  async saveNotifications(notifications) {
    return this.request('saveNotifications', notifications);
  }

  // CRUD Operations for Bookings
  async createBooking(booking) {
    return this.request('createBooking', booking);
  }

  async updateBooking(id, updates) {
    return this.request('updateBooking', { id, ...updates });
  }

  async deleteBooking(id) {
    return this.request('deleteBooking', { id });
  }

  async approveBooking(id) {
    return this.request('approveBooking', { id });
  }

  async declineBooking(id, reason) {
    return this.request('declineBooking', { id, reason });
  }

  // CRUD Operations for Learners
  async createLearner(learner) {
    return this.request('createLearner', learner);
  }

  async updateLearner(id, updates) {
    return this.request('updateLearner', { id, ...updates });
  }

  async deleteLearner(id) {
    return this.request('deleteLearner', { id });
  }

  // CRUD Operations for Teachers
  async createTeacher(teacher) {
    return this.request('createTeacher', teacher);
  }

  async updateTeacher(id, updates) {
    return this.request('updateTeacher', { id, ...updates });
  }

  async deleteTeacher(id) {
    return this.request('deleteTeacher', { id });
  }

  // CRUD Operations for Reader/Writers
  async createReaderWriter(rw) {
    return this.request('createReaderWriter', rw);
  }

  async updateReaderWriter(id, updates) {
    return this.request('updateReaderWriter', { id, ...updates });
  }

  async deleteReaderWriter(id) {
    return this.request('deleteReaderWriter', { id });
  }

  // CRUD Operations for Venues
  async createVenue(venue) {
    return this.request('createVenue', venue);
  }

  async updateVenue(id, updates) {
    return this.request('updateVenue', { id, ...updates });
  }

  async deleteVenue(id) {
    return this.request('deleteVenue', { id });
  }

  // CRUD Operations for Subjects
  async createSubject(subject) {
    return this.request('createSubject', subject);
  }

  async updateSubject(id, updates) {
    return this.request('updateSubject', { id, ...updates });
  }

  async deleteSubject(id) {
    return this.request('deleteSubject', { id });
  }

  // Capacity Management
  async updateCapacity(session, capacity) {
    return this.request('updateCapacity', { session, capacity });
  }

  async blockSlot(date, day, period, reason) {
    return this.request('blockSlot', { date, day, period, reason });
  }

  async unblockSlot(date, day, period) {
    return this.request('unblockSlot', { date, day, period });
  }

  // Sequential saves for reliability
  async saveMultiple(saves) {
    const results = [];
    for (const save of saves) {
      const result = await this.request(save.action, save.data);
      results.push(result);
    }
    return results;
  }
}

const api = new APIClient();
export default api;
