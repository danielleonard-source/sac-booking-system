// =======================================
// NOTIFICATION TOAST COMPONENT
// =======================================

import { useEffect } from 'react'
import { useUIStore } from '../store/uiStore'

const ICONS = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ'
}

export default function NotificationToast() {
  const { notification, hideNotification } = useUIStore()

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        hideNotification()
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [notification.show, hideNotification])

  if (!notification.show) return null

  return (
    <div className={`toast toast-${notification.type} animate-slideIn`}>
      <span className="text-xl flex-shrink-0">
        {ICONS[notification.type]}
      </span>
      <span className="text-sm">{notification.message}</span>
      <button
        onClick={hideNotification}
        className="ml-auto flex-shrink-0 hover:opacity-75"
      >
        ✕
      </button>
    </div>
  )
}
