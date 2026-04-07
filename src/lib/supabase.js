import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'
export const USER_SESSION_STORAGE_KEY = 'master-stroke-user-session'
export const ADMIN_SESSION_STORAGE_KEY = 'master-stroke-admin-session'
export const ACTIVE_PORTAL_STORAGE_KEY = 'master-stroke-active-portal'

// Client for operations in the user portal
export const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { storageKey: USER_SESSION_STORAGE_KEY }
})

// Client for operations in the admin portal (persistent session without interfering with user login)
export const supabaseAdminAuth = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true, storageKey: ADMIN_SESSION_STORAGE_KEY }
})

export function getPortalFromPathname(pathname = '') {
  return pathname.startsWith('/admin') ? 'admin' : 'user'
}

export function getSupabaseClientForPortal(portal) {
  return portal === 'admin' ? supabaseAdminAuth : supabaseUser
}

export function getPortalSessionStorageKey(portal) {
  return portal === 'admin' ? ADMIN_SESSION_STORAGE_KEY : USER_SESSION_STORAGE_KEY
}

export function hasPortalSessionToken(portal) {
  if (typeof window === 'undefined') {
    return false
  }

  const rawSession = window.localStorage.getItem(getPortalSessionStorageKey(portal))

  if (!rawSession) {
    return false
  }

  try {
    const parsed = JSON.parse(rawSession)
    return Boolean(
      parsed?.access_token ||
      parsed?.currentSession?.access_token ||
      parsed?.session?.access_token
    )
  } catch {
    return rawSession.includes('access_token')
  }
}

// Context-aware proxy that automatically routes queries to the correct client based on URL path
export const supabase = new Proxy(supabaseUser, {
  get: function(target, prop) {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
      const val = supabaseAdminAuth[prop];
      return typeof val === 'function' ? val.bind(supabaseAdminAuth) : val;
    }
    const val = target[prop];
    return typeof val === 'function' ? val.bind(target) : val;
  }
})

// Client with Service Role Key for securely forced password updates (Admin actions)
const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || ''
export const supabaseServiceRole = serviceRoleKey 
  ? createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } }) 
  : null
