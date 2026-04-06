import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

// Client for operations in the user portal
export const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { storageKey: 'master-stroke-user-session' }
})

// Client for operations in the admin portal (persistent session without interfering with user login)
export const supabaseAdminAuth = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true, storageKey: 'master-stroke-admin-session' }
})

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
