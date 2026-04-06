// =======================================
// AUTH STORE - Login & User Management
// =======================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CONFIG } from '../config'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      isLoggedIn: false,
      currentUser: null,
      userRole: 'teacher', // 'teacher' or 'admin'

      // Actions
      login: (user) => {
        set({
          isLoggedIn: true,
          currentUser: user,
          userRole: user.isAdmin ? 'admin' : 'teacher'
        })
      },

      logout: () => {
        set({
          isLoggedIn: false,
          currentUser: null,
          userRole: 'teacher'
        })
      },

      checkAdmin: (email) => {
        return CONFIG.SYSTEM_ADMINS.includes(email.toLowerCase())
      },

      // Get current user
      getUser: () => get().currentUser,

      // Check if user is admin
      isAdmin: () => get().userRole === 'admin'
    }),
    {
      name: 'sac-auth-storage', // localStorage key
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        currentUser: state.currentUser,
        userRole: state.userRole
      })
    }
  )
)
