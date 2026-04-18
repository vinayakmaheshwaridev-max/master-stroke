import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useTranslation } from '../../i18n'
import { toast } from '../../components/ui'

const navItems = [
  { to: '/admin/dashboard', icon: 'dashboard', labelKey: 'navigation.dashboard' },
  { to: '/admin/teams', icon: 'groups', labelKey: 'common.teams' },
  { to: '/admin/scheduler', icon: 'calendar_month', labelKey: 'navigation.scheduler' },
  { to: '/admin/scores', icon: 'sports_score', labelKey: 'navigation.scores' },
  { to: '/admin/tournament', icon: 'info', labelKey: 'navigation.tournament' },
]

export default function AdminSidebar() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuthStore()

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-stone-100 flex flex-col p-4 gap-2 z-40 overflow-y-auto no-scrollbar">
      {/* Brand */}
      <div className="mb-6 px-2 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>stadium</span>
        </div>
        <div>
          <h1 className="text-sm font-black text-zinc-900 tracking-tighter leading-none">{t('common.appName')}</h1>
          <p className="text-[10px] uppercase tracking-[0.1em] text-outline opacity-70">{t('admin.sidebar.boxCricketAdmin')}</p>
        </div>
      </div>

      {/* Admin Info */}
      <div className="flex items-center gap-3 p-3 mb-4 bg-stone-200/50 rounded-2xl">
        <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-sm font-bold text-primary">
          A
        </div>
        <div className="overflow-hidden">
          <p className="text-sm font-bold text-zinc-900 truncate">{t('admin.sidebar.tournamentAdmin')}</p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{t('admin.sidebar.superUser')}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(item => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 tap-highlight-none text-sm font-medium tracking-wide ${
              isActive(item.to)
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-500 hover:bg-stone-200/50 hover:translate-x-1'
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={isActive(item.to) ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {item.icon}
            </span>
            {t(item.labelKey)}
          </Link>
        ))}
      </nav>

      {/* New Match CTA */}
      <Link
        to="/admin/scheduler"
        className="mb-2 bg-gradient-to-br from-primary to-primary-dim text-on-primary py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
      >
        <span className="material-symbols-outlined text-sm">add</span>
        {t('admin.sidebar.newMatch')}
      </Link>

      {/* Logout */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => { toast.info(t('auth.signedOut') || 'Signed out successfully'); logout(); navigate('/admin/login') }}
          className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-xl transition-all text-sm font-medium"
        >
          <span className="material-symbols-outlined text-sm">logout</span>
          {t('common.signOut')}
        </button>
      </div>
    </aside>
  )
}
