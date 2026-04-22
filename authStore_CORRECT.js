import { create } from 'zustand';

const SYSTEM_ADMINS = [
  'daniel.leonard@beth.school.nz',
  'chanel.debruin@beth.school.nz'
];

const useAuthStore = create((set, get) => ({
  // State
  currentUser: null,
  isAuthenticated: false,
  isLoggedIn: false,
  userRole: null,
  
  // Actions
  setCurrentUser: (user) => {
    console.log('Setting current user:', user);
    set({ 
      currentUser: user, 
      isAuthenticated: true,
      isLoggedIn: true,
      userRole: user?.isAdmin ? 'admin' : 'teacher'
    });
  },
  
  login: (user) => {
    console.log('Login called with user:', user);
    set({ 
      currentUser: user, 
      isAuthenticated: true,
      isLoggedIn: true,
      userRole: user?.isAdmin ? 'admin' : 'teacher'
    });
    localStorage.setItem('currentUser', JSON.stringify(user));
  },
  
  logout: () => {
    console.log('Logout called');
    set({ 
      currentUser: null, 
      isAuthenticated: false,
      isLoggedIn: false,
      userRole: null
    });
    localStorage.removeItem('currentUser');
  },
  
  updateUser: (updates) => {
    set((state) => ({
      currentUser: state.currentUser ? { ...state.currentUser, ...updates } : null
    }));
  },
  
  loadSavedUser: () => {
    try {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        set({ 
          currentUser: user, 
          isAuthenticated: true,
          isLoggedIn: true,
          userRole: user?.isAdmin ? 'admin' : 'teacher'
        });
        return user;
      }
      return null;
    } catch (error) {
      console.error('Error loading saved user:', error);
      return null;
    }
  },
  
  checkAdmin: (email) => {
    return SYSTEM_ADMINS.includes(email?.toLowerCase());
  }
}));

export default useAuthStore;
