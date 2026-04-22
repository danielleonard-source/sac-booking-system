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

const COLORS = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  warning: 'bg-yellow-500',
  info: 'bg-blue-500'
}

export default function NotificationToast() {
  const notification = useUIStore((state) => state.notification)
  const hideNotification = useUIStore((state) => state.hideNotification)

  useEffect(() => {
    if (notification?.show) {
      const timer = setTimeout(() => {
        hideNotification()
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [notification?.show, hideNotification])

  if (!notification?.show) return null

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`${COLORS[notification.type] || COLORS.info} text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 min-w-[300px] max-w-md`}>
        <span className="text-xl flex-shrink-0">
          {ICONS[notification.type]}
        </span>
        <span className="text-sm flex-1">{notification.message}</span>
        <button
          onClick={hideNotification}
          className="text-white hover:text-gray-200 font-bold text-xl leading-none ml-2 flex-shrink-0"
        >
          ×
        </button>
      </div>
    </div>
  )
}