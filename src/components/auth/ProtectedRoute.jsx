import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { PageLoader } from '../ui/Spinner'

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuthStore()

  if (loading) {
    return <PageLoader />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

export function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuthStore()

  if (loading) {
    return <PageLoader />
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}
