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
    localStorage.setItem('currentUser', JSON.stringify(user));
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
    const currentUser = get().currentUser;
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      set({ currentUser: updatedUser });
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  },
  
  loadSavedUser: () => {
    try {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        console.log('Loading saved user from localStorage:', user);
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
