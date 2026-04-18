import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useTranslation } from '../../i18n'
import { toast } from '../../components/ui'

export default function UserNavbar() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, team, logout } = useAuthStore()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = [
    { to: '/dashboard', label: t('navigation.dashboard'), protected: true },
    { to: '/matches', label: t('navigation.schedule'), protected: true },
    { to: '/standings', label: t('navigation.standings'), protected: true },
    { to: '/info', label: t('navigation.info') },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav className="fixed top-0 w-full z-50 glass-nav shadow-sm h-20 flex justify-between items-center px-6 md:px-8 max-w-full mx-auto">
      <div className="flex items-center gap-8">
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="text-xl md:text-2xl font-bold tracking-tighter text-zinc-800">
          {t('common.appName')}
        </Link>
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(link => (
            (!link.protected || isAuthenticated) && (
              <Link
                key={link.to}
                to={link.to}
                className={`font-medium tracking-tight transition-colors ${
                  isActive(link.to)
                    ? 'text-zinc-900 font-semibold border-b-2 border-zinc-800 pb-1'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                {link.label}
              </Link>
            )
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isAuthenticated && (
          <Link
            to="/notifications"
            className="material-symbols-outlined text-zinc-600 p-2 rounded-full hover:bg-stone-100/50 transition-colors relative block"
          >
            notifications
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse ring-2 ring-white" />
          </Link>
        )}

        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              <div className="h-9 w-9 rounded-full bg-surface-container-high flex items-center justify-center text-xs font-bold text-primary">
                {team?.team_name?.slice(0, 2).toUpperCase() || 'U'}
              </div>
              <span className="text-sm font-medium text-zinc-700 hidden lg:block">{team?.team_name}</span>
            </div>
            <button
              onClick={() => { toast.info(t('auth.signedOut') || 'Signed out successfully'); logout(); navigate('/') }}
              className="text-xs font-medium text-zinc-400 hover:text-zinc-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-stone-100"
            >
              {t('common.logout')}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-800 transition-colors px-4 py-2"
            >
              {t('common.login')}
            </Link>
            <Link
              to="/register"
              className="primary-gradient text-on-primary px-5 py-2.5 rounded-xl font-medium shadow-sm hover:scale-[0.98] active:scale-95 transition-all text-sm"
            >
              {t('common.register')}
            </Link>
          </div>
        )}

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden material-symbols-outlined text-zinc-600 p-2"
        >
          {mobileOpen ? 'close' : 'menu'}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="absolute top-20 left-0 w-full bg-white shadow-xl border-t border-stone-100 p-6 md:hidden animate-fade-in z-50">
          <div className="flex flex-col gap-4">
            {navLinks.map(link => (
              (!link.protected || isAuthenticated) && (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`text-lg font-medium py-2 ${
                    isActive(link.to) ? 'text-zinc-900 font-bold' : 'text-zinc-500'
                  }`}
                >
                  {link.label}
                </Link>
              )
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
