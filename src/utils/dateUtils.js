/**
 * Date/Time Utilities - Handles timezone conversions consistently
 * All dates stored in backend are UTC, displayed dates are local (Auckland)
 */

/**
 * Convert a Date object or UTC string to local date string (YYYY-MM-DD)
 * @param {Date|string} dateInput - Date object or UTC string like '2026-04-21T12:00:00.000Z'
 * @returns {string} Local date in YYYY-MM-DD format like '2026-04-22'
 */
export function toLocalDateString(dateInput) {
  if (!dateInput) return null;
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return date.toLocaleDateString('en-CA'); // en-CA gives YYYY-MM-DD format
}

/**
 * Convert local date string to UTC ISO string for storage
 * @param {string} localDate - Local date string like '2026-04-22'
 * @returns {string} UTC ISO string like '2026-04-21T12:00:00.000Z'
 */
export function toUTCString(localDate) {
  if (!localDate) return null;
  // Create date at noon local time to avoid day boundary issues
  const [year, month, day] = localDate.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12, 0, 0);
  return date.toISOString();
}

/**
 * Compare two dates (handles both UTC strings and local date strings)
 * @param {string} date1 - First date (UTC string or local YYYY-MM-DD)
 * @param {string} date2 - Second date (UTC string or local YYYY-MM-DD)
 * @returns {boolean} True if dates represent the same local day
 */
export function isSameLocalDate(date1, date2) {
  if (!date1 || !date2) return false;
  const local1 = date1.includes('T') ? toLocalDateString(date1) : date1;
  const local2 = date2.includes('T') ? toLocalDateString(date2) : date2;
  return local1 === local2;
}

/**
 * Get today's date in local YYYY-MM-DD format
 * @returns {string} Today's date like '2026-04-22'
 */
export function getTodayLocal() {
  return toLocalDateString(new Date());
}
