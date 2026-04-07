import { create } from 'zustand'
import {
  ACTIVE_PORTAL_STORAGE_KEY,
  getPortalFromPathname,
  getSupabaseClientForPortal,
  getPortalSessionStorageKey,
  hasPortalSessionToken,
  supabaseAdminAuth,
  supabaseUser,
} from '../lib/supabase'

const LOGGED_OUT_STATE = {
  user: null,
  team: null,
  isAuthenticated: false,
  isAdmin: false,
  activePortal: null,
}

let listenersBound = false
let syncPromise = null

function getStorage() {
  return typeof window === 'undefined' ? null : window.localStorage
}

function setActivePortalStorage(portal) {
  const storage = getStorage()

  if (!storage) {
    return
  }

  if (portal) {
    storage.setItem(ACTIVE_PORTAL_STORAGE_KEY, portal)
    return
  }

  storage.removeItem(ACTIVE_PORTAL_STORAGE_KEY)
}

function getPreferredPortal() {
  const storage = getStorage()
  const storedPortal = storage?.getItem(ACTIVE_PORTAL_STORAGE_KEY)

  if (storedPortal === 'admin' || storedPortal === 'user') {
    return storedPortal
  }

  if (typeof window === 'undefined') {
    return 'user'
  }

  return getPortalFromPathname(window.location.pathname)
}

async function clearPortalSession(portal) {
  const client = getSupabaseClientForPortal(portal)
  const storage = getStorage()

  try {
    await client.auth.signOut({ scope: 'local' })
  } catch {
    // Ignore cleanup failures and always remove the persisted token below.
  }

  storage?.removeItem(getPortalSessionStorageKey(portal))
}

async function clearAllSessions() {
  await Promise.all([
    clearPortalSession('user'),
    clearPortalSession('admin'),
  ])
  setActivePortalStorage(null)
}

async function getApprovedTeam(authUserId) {
  const { data, error } = await supabaseUser
    .from('teams')
    .select('*')
    .eq('auth_user_id', authUserId)
    .maybeSingle()

  if (error) {
    throw error
  }

  if (!data || data.status !== 'approved') {
    return null
  }

  return data
}

async function getValidatedUserSession() {
  const { data: { session } } = await supabaseUser.auth.getSession()

  if (!hasPortalSessionToken('user')) {
    if (session) {
      await clearPortalSession('user')
    }
    return null
  }

  if (!session) {
    getStorage()?.removeItem(getPortalSessionStorageKey('user'))
    return null
  }

  const team = await getApprovedTeam(session.user.id)

  if (!team) {
    await clearPortalSession('user')
    return null
  }

  return {
    user: session.user,
    team,
    isAdmin: false,
    activePortal: 'user',
  }
}

async function getValidatedAdminSession() {
  const { data: { session } } = await supabaseAdminAuth.auth.getSession()

  if (!hasPortalSessionToken('admin')) {
    if (session) {
      await clearPortalSession('admin')
    }
    return null
  }

  if (!session) {
    getStorage()?.removeItem(getPortalSessionStorageKey('admin'))
    return null
  }

  if (session.user.user_metadata?.role !== 'admin') {
    await clearPortalSession('admin')
    return null
  }

  return {
    user: session.user,
    team: null,
    isAdmin: true,
    activePortal: 'admin',
  }
}

function bindSessionListeners(get) {
  if (listenersBound || typeof window === 'undefined') {
    return
  }

  listenersBound = true

  const sync = () => {
    void get().syncSession()
  }

  supabaseUser.auth.onAuthStateChange(() => {
    sync()
  })

  supabaseAdminAuth.auth.onAuthStateChange(() => {
    sync()
  })

  window.addEventListener('storage', sync)
  window.addEventListener('focus', sync)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      sync()
    }
  })

  window.setInterval(() => {
    const { isAuthenticated, activePortal, logout } = get()

    if (!isAuthenticated || !activePortal) {
      return
    }

    if (!hasPortalSessionToken(activePortal)) {
      void logout()
    }
  }, 1000)
}

export const useAuthStore = create((set, get) => ({
  ...LOGGED_OUT_STATE,
  loading: true,

  // login: For team owners using Email (or Phone)
  login: async (email, password) => {
    set({ loading: true })
    setActivePortalStorage('user')

    try {
      const { data, error } = await supabaseUser.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      const teamData = await getApprovedTeam(data.user.id)

      if (!teamData) {
        await clearPortalSession('user')
        throw new Error("Your team has not been approved or has been rejected.")
      }

      await clearPortalSession('admin')
      setActivePortalStorage('user')

      set({
        user: data.user,
        team: teamData,
        isAuthenticated: true,
        isAdmin: false,
        activePortal: 'user',
        loading: false,
      })

      return { success: true }
    } catch (error) {
      await clearPortalSession('user')
      await get().syncSession()
      return { success: false, error: error.message }
    }
  },

  // adminLogin: Check for 'admin' role in user metadata
  adminLogin: async (email, password) => {
    set({ loading: true })
    setActivePortalStorage('admin')

    try {
      const { data, error } = await supabaseAdminAuth.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      const isAdmin = data.user.user_metadata?.role === 'admin'

      if (!isAdmin) {
        await clearPortalSession('admin')
        throw new Error('Unauthorized: Admin access required')
      }

      await clearPortalSession('user')
      setActivePortalStorage('admin')

      set({
        user: data.user,
        team: null,
        isAuthenticated: true,
        isAdmin: true,
        activePortal: 'admin',
        loading: false,
      })

      return { success: true }
    } catch (error) {
      await clearPortalSession('admin')
      await get().syncSession()
      return { success: false, error: error.message }
    }
  },

  logout: async () => {
    set({ loading: true })
    await clearAllSessions()
    set({ ...LOGGED_OUT_STATE, loading: false })
  },

  setLoading: (loading) => set({ loading }),

  syncSession: async ({ forceLoading = false } = {}) => {
    if (syncPromise) {
      return syncPromise
    }

    if (forceLoading) {
      set({ loading: true })
    }

    syncPromise = (async () => {
      try {
        const [userSession, adminSession] = await Promise.all([
          getValidatedUserSession(),
          getValidatedAdminSession(),
        ])

        if (userSession && adminSession) {
          const preferredPortal = getPreferredPortal()

          if (preferredPortal === 'admin') {
            await clearPortalSession('user')
            setActivePortalStorage('admin')
            set({
              user: adminSession.user,
              team: null,
              isAuthenticated: true,
              isAdmin: true,
              activePortal: 'admin',
              loading: false,
            })
            return
          }

          await clearPortalSession('admin')
          setActivePortalStorage('user')
          set({
            user: userSession.user,
            team: userSession.team,
            isAuthenticated: true,
            isAdmin: false,
            activePortal: 'user',
            loading: false,
          })
          return
        }

        if (adminSession) {
          setActivePortalStorage('admin')
          set({
            user: adminSession.user,
            team: null,
            isAuthenticated: true,
            isAdmin: true,
            activePortal: 'admin',
            loading: false,
          })
          return
        }

        if (userSession) {
          setActivePortalStorage('user')
          set({
            user: userSession.user,
            team: userSession.team,
            isAuthenticated: true,
            isAdmin: false,
            activePortal: 'user',
            loading: false,
          })
          return
        }

        setActivePortalStorage(null)
        set({ ...LOGGED_OUT_STATE, loading: false })
      } catch (error) {
        console.error('Failed to synchronize auth session:', error)
        await clearAllSessions()
        set({ ...LOGGED_OUT_STATE, loading: false })
      }
    })()

    try {
      await syncPromise
    } finally {
      syncPromise = null
    }
  },

  // Initialize: Check for active session in both portals
  initialize: async () => {
    bindSessionListeners(get)
    await get().syncSession({ forceLoading: true })
  },
}))
