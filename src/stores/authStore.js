import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useAuthStore = create((set) => ({
  user: null,
  team: null,
  isAuthenticated: false,
  isAdmin: false,
  loading: true,

  // login: For team owners using Email (or Phone)
  login: async (email, password) => {
    set({ loading: true })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // After auth login, find the team associated with this auth_user_id
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('auth_user_id', data.user.id)
        .maybeSingle()

      if (teamError) throw teamError

      if (teamData && teamData.status !== 'approved') {
        await supabase.auth.signOut()
        throw new Error("Your team has not been approved or has been rejected.")
      }

      set({ 
        user: data.user, 
        team: teamData, 
        isAuthenticated: true, 
        isAdmin: false, 
        loading: false 
      })
      return { success: true }
    } catch (error) {
      set({ loading: false })
      return { success: false, error: error.message }
    }
  },

  // adminLogin: Check for 'admin' role in user metadata
  adminLogin: async (email, password) => {
    set({ loading: true })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      const isAdmin = data.user.user_metadata?.role === 'admin'

      if (!isAdmin) {
        await supabase.auth.signOut()
        throw new Error('Unauthorized: Admin access required')
      }

      set({
        user: data.user,
        team: null,
        isAuthenticated: true,
        isAdmin: true,
        loading: false,
      })
      return { success: true }
    } catch (error) {
      set({ loading: false })
      return { success: false, error: error.message }
    }
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null, team: null, isAuthenticated: false, isAdmin: false, loading: false })
  },

  setLoading: (loading) => set({ loading }),

  // Initialize: Check for active session
  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
      const isAdmin = session.user.user_metadata?.role === 'admin'
      
      let teamData = null
      if (!isAdmin) {
        const { data } = await supabase
          .from('teams')
          .select('*')
          .eq('auth_user_id', session.user.id)
          .maybeSingle()
        teamData = data
      }

      set({ 
        user: session.user, 
        team: teamData, 
        isAuthenticated: true, 
        isAdmin, 
        loading: false 
      })
    } else {
      set({ loading: false })
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        set({ user: null, team: null, isAuthenticated: false, isAdmin: false })
      }
    })
  },
}))
