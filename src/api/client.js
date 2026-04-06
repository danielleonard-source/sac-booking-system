// =======================================
// API CLIENT - CORS-SAFE VERSION
// Uses GET requests to avoid CORS preflight
// =======================================

import { CONFIG } from '../config'

class APIClient {
  constructor() {
    this.baseUrl = CONFIG.SCRIPT_URL
    this.timeout = CONFIG.API.TIMEOUT_MS
    this.retryAttempts = CONFIG.API.RETRY_ATTEMPTS
  }

  /**
   * Make API request with retry logic
   * Using GET to avoid CORS preflight issues
   */
  async request(action, data = null, attempt = 1) {
    try {
      // Build query string with action and data
      const params = new URLSearchParams({
        action: action,
        _t: Date.now() // Cache buster
      })

      // Add data as JSON string in query parameter
      if (data) {
        params.append('data', JSON.stringify(data))
      }

      const url = `${this.baseUrl}?${params.toString()}`

      const response = await fetch(url, {
        method: 'GET',
        cache: 'no-cache'
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.success && result.error) {
        throw new Error(result.error)
      }

      return result

    } catch (error) {
      // Retry on network errors
      if (
        attempt < this.retryAttempts &&
        (error.name === 'AbortError' || error.message.includes('fetch'))
      ) {
        console.warn(`Request failed (attempt ${attempt}), retrying...`)
        await this.delay(CONFIG.API.RETRY_DELAY_MS * attempt)
        return this.request(action, data, attempt + 1)
      }

      // Log error
      console.error(`API Error (${action}):`, error)

      throw error
    }
  }

  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // ===================================
  // API METHODS
  // ===================================

  async getAll() {
    return this.request('getAll')
  }

  async saveLearners(data) {
    return this.request('saveLearners', data)
  }

  async saveTeachers(data) {
    return this.request('saveTeachers', data)
  }

  async saveReaderWriters(data) {
    return this.request('saveReaderWriters', data)
  }

  async saveVenues(data) {
    return this.request('saveVenues', data)
  }

  async saveSubjects(data) {
    return this.request('saveSubjects', data)
  }

  async saveBookings(data) {
    return this.request('saveBookings', data)
  }

  async saveBookingHistory(data) {
    return this.request('saveBookingHistory', data)
  }

  async saveBlockedSlots(data) {
    return this.request('saveBlockedSlots', data)
  }

  async saveSessionCapacities(data) {
    return this.request('saveSessionCapacities', data)
  }

  async saveNotifications(data) {
    return this.request('saveNotifications', data)
  }

  async saveBatch(operations) {
    return this.request('saveBatch', operations)
  }

  async sendEmails(emailData) {
    return this.request('sendEmails', emailData)
  }

  async healthCheck() {
    return this.request('healthCheck')
  }
}

// Export singleton instance
export const api = new APIClient()
