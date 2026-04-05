import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: null,
  team: null,
  isAuthenticated: false,
  isAdmin: false,
  loading: true,

  // Team login (mock for now)
  login: async (mobile, password) => {
    // Simulate API call
    await new Promise(r => setTimeout(r, 800))
    
    // Mock: accept any 10-digit mobile with password "test123"
    if (mobile.length === 10 && password === 'test123') {
      const mockTeam = {
        id: '1',
        team_name: 'Royal Challengers',
        captain_name: 'Arjun Sharma',
        mobile,
        status: 'approved',
      }
      set({ user: { id: '1', mobile }, team: mockTeam, isAuthenticated: true, isAdmin: false, loading: false })
      return { success: true }
    }
    return { success: false, error: 'Invalid credentials' }
  },

  // Admin login (mock for now)
  adminLogin: async (email, password) => {
    await new Promise(r => setTimeout(r, 800))
    
    if (email === 'admin@masterstroke.com' && password === 'admin123') {
      set({
        user: { id: 'admin', email },
        team: null,
        isAuthenticated: true,
        isAdmin: true,
        loading: false,
      })
      return { success: true }
    }
    return { success: false, error: 'Invalid credentials' }
  },

  logout: () => {
    set({ user: null, team: null, isAuthenticated: false, isAdmin: false, loading: false })
  },

  setLoading: (loading) => set({ loading }),

  // Initialize: check for stored session
  initialize: () => {
    set({ loading: false })
  },
}))
