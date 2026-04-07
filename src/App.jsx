import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './stores/authStore'
import { ToastProvider } from './components/ui'
// App.css removed — contained only unused Vite scaffold styles

// Layouts
import UserLayout from './components/layout/UserLayout'
import AdminLayout from './components/layout/AdminLayout'
import { AdminGuestRoute, AdminRoute, ProtectedRoute, PublicUserRoute, UserGuestRoute } from './components/auth/ProtectedRoute'

// User Pages
import LandingPage from './pages/user/LandingPage'
import RegistrationPage from './pages/user/RegistrationPage'
import LoginPage from './pages/user/LoginPage'
import DashboardPage from './pages/user/DashboardPage'
import SchedulePage from './pages/user/SchedulePage'
import PointsTablePage from './pages/user/PointsTablePage'
import InfoPage from './pages/user/InfoPage'

// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import TeamManagementPage from './pages/admin/TeamManagementPage'
import MatchSchedulerPage from './pages/admin/MatchSchedulerPage'
import ScoreEntryPage from './pages/admin/ScoreEntryPage'
import TournamentOverviewPage from './pages/admin/TournamentOverviewPage'
import NotificationsPage from './pages/admin/NotificationsPage'

// Utility Pages
import NotFoundPage from './pages/NotFoundPage'

function App() {
  const initialize = useAuthStore(s => s.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <ToastProvider>
    <BrowserRouter>
      <Routes>
        {/* User Panel */}
        <Route element={<PublicUserRoute><UserLayout /></PublicUserRoute>}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/info" element={<InfoPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/matches" element={<ProtectedRoute><SchedulePage /></ProtectedRoute>} />
          <Route path="/standings" element={<ProtectedRoute><PointsTablePage /></ProtectedRoute>} />
        </Route>

        {/* Standalone Login Pages (no navbar) */}
        <Route path="/login" element={<UserGuestRoute><LoginPage /></UserGuestRoute>} />
        <Route path="/admin/login" element={<AdminGuestRoute><AdminLoginPage /></AdminGuestRoute>} />

        {/* Admin Panel */}
        <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/teams" element={<TeamManagementPage />} />
          <Route path="/admin/scheduler" element={<MatchSchedulerPage />} />
          <Route path="/admin/scores" element={<ScoreEntryPage />} />
          <Route path="/admin/tournament" element={<TournamentOverviewPage />} />
          <Route path="/admin/notifications" element={<NotificationsPage />} />
        </Route>

        {/* Catch All Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
    </ToastProvider>
  )
}

export default App
