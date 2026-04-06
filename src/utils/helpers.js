// =======================================
// UTILITY FUNCTIONS
// =======================================

import { format, addDays, startOfWeek, addWeeks } from 'date-fns'

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHTML(html) {
  const div = document.createElement('div')
  div.textContent = html
  return div.innerHTML
}

/**
 * Generate unique ID
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Format date for display
 */
export function formatDate(date, formatStr = 'yyyy-MM-dd') {
  if (!date) return ''
  if (typeof date === 'string') {
    date = new Date(date + 'T12:00:00')
  }
  return format(date, formatStr)
}

/**
 * Get day name from date
 */
export function getDayName(date) {
  if (typeof date === 'string') {
    date = new Date(date + 'T12:00:00')
  }
  return format(date, 'EEEE')
}

/**
 * Get week dates
 */
export function getWeekDates(weekOffset = 0) {
  const today = new Date()
  const monday = startOfWeek(addWeeks(today, weekOffset), { weekStartsOn: 1 })
  
  return Array.from({ length: 5 }, (_, i) => {
    const date = addDays(monday, i)
    return {
      date: formatDate(date),
      day: format(date, 'EEEE'),
      displayDate: format(date, 'MMM d')
    }
  })
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Deep clone object
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Group array by key
 */
export function groupBy(array, key) {
  return array.reduce((result, item) => {
    const group = item[key]
    if (!result[group]) {
      result[group] = []
    }
    result[group].push(item)
    return result
  }, {})
}

/**
 * Sort by multiple keys
 */
export function sortBy(array, ...keys) {
  return array.sort((a, b) => {
    for (const key of keys) {
      const aVal = a[key]
      const bVal = b[key]
      
      if (aVal < bVal) return -1
      if (aVal > bVal) return 1
    }
    return 0
  })
}

/**
 * Filter array by search term
 */
export function filterBySearch(array, searchTerm, ...fields) {
  if (!searchTerm) return array
  
  const term = searchTerm.toLowerCase()
  return array.filter(item =>
    fields.some(field => {
      const value = item[field]
      if (Array.isArray(value)) {
        return value.some(v => 
          String(v).toLowerCase().includes(term)
        )
      }
      return String(value || '').toLowerCase().includes(term)
    })
  )
}

/**
 * Validate email
 */
export function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

/**
 * Get initials from name
 */
export function getInitials(firstName, lastName) {
  const first = firstName?.charAt(0) || ''
  const last = lastName?.charAt(0) || ''
  return `${first}${last}`.toUpperCase()
}

/**
 * Truncate text
 */
export function truncate(text, maxLength) {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Class name helper
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

/**
 * Export to Excel (using XLSX library)
 */
export async function exportToExcel(data, filename) {
  const XLSX = await import('xlsx')
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
  XLSX.writeFile(wb, filename)
}

/**
 * Download as CSV
 */
export function downloadCSV(data, filename) {
  if (!data || data.length === 0) return
  
  const headers = Object.keys(data[0])
  const csv = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(',')
    )
  ].join('\n')
  
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  window.URL.revokeObjectURL(url)
}

/**
 * Copy to clipboard
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    // Fallback for older browsers
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    return true
  }
}
