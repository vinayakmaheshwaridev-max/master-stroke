import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { hasPortalSessionToken } from '../../lib/supabase'
import { PageLoader } from '../ui/Spinner'
import NotFoundPage from '../../pages/NotFoundPage'

const LOGIN_ROUTE_BY_PORTAL = {
  user: '/login',
  admin: '/admin/login',
}

const HOME_ROUTE_BY_PORTAL = {
  user: '/dashboard',
  admin: '/admin/dashboard',
}

function PortalRoute({ children, portal, requireAuth = false, guestOnly = false }) {
  const { activePortal, isAuthenticated, loading, logout } = useAuthStore()
  const location = useLocation()
  const hasExpectedToken = hasPortalSessionToken(portal)
  const isPortalAuthenticated = isAuthenticated && activePortal === portal && hasExpectedToken
  const isWrongPortal = isAuthenticated && activePortal && activePortal !== portal

  useEffect(() => {
    if (!loading && isAuthenticated && activePortal === portal && !hasExpectedToken) {
      void logout()
    }
  }, [activePortal, hasExpectedToken, isAuthenticated, loading, logout, portal])

  if (loading) {
    return <PageLoader />
  }

  if (isAuthenticated && location.pathname === '/') {
    return <Navigate to={HOME_ROUTE_BY_PORTAL[activePortal]} replace />
  }

  if (isWrongPortal) {
    return <NotFoundPage />
  }

  if (requireAuth && !isPortalAuthenticated) {
    return <Navigate to={LOGIN_ROUTE_BY_PORTAL[portal]} replace />
  }

  if (guestOnly && isPortalAuthenticated) {
    return <Navigate to={HOME_ROUTE_BY_PORTAL[portal]} replace />
  }

  return children
}

export function ProtectedRoute({ children }) {
  return (
    <PortalRoute portal="user" requireAuth>
      {children}
    </PortalRoute>
  )
}

export function AdminRoute({ children }) {
  return (
    <PortalRoute portal="admin" requireAuth>
      {children}
    </PortalRoute>
  )
}

export function PublicUserRoute({ children }) {
  return <PortalRoute portal="user">{children}</PortalRoute>
}

export function UserGuestRoute({ children }) {
  return (
    <PortalRoute portal="user" guestOnly>
      {children}
    </PortalRoute>
  )
}

export function AdminGuestRoute({ children }) {
  return (
    <PortalRoute portal="admin" guestOnly>
      {children}
    </PortalRoute>
  )
}
