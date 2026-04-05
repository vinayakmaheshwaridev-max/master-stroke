import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

const navItems = [
  { to: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/admin/teams', icon: 'groups', label: 'Teams' },
  { to: '/admin/scheduler', icon: 'calendar_month', label: 'Scheduler' },
  { to: '/admin/scores', icon: 'sports_score', label: 'Scores' },
  { to: '/admin/tournament', icon: 'info', label: 'Tournament' },
  { to: '/admin/notifications', icon: 'notifications', label: 'Messages' },
]

export default function AdminSidebar() {
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
          <h1 className="text-sm font-black text-zinc-900 tracking-tighter leading-none">Master Stroke</h1>
          <p className="text-[10px] uppercase tracking-[0.1em] text-outline opacity-70">Box Cricket Admin</p>
        </div>
      </div>

      {/* Admin Info */}
      <div className="flex items-center gap-3 p-3 mb-4 bg-stone-200/50 rounded-2xl">
        <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-sm font-bold text-primary">
          A
        </div>
        <div className="overflow-hidden">
          <p className="text-sm font-bold text-zinc-900 truncate">Tournament Admin</p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Super User</p>
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
            {item.label}
          </Link>
        ))}
      </nav>

      {/* New Match CTA */}
      <Link
        to="/admin/scheduler"
        className="mb-2 bg-gradient-to-br from-primary to-primary-dim text-on-primary py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
      >
        <span className="material-symbols-outlined text-sm">add</span>
        New Match
      </Link>

      {/* Logout */}
      <button
        onClick={() => { logout(); navigate('/admin/login') }}
        className="flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-zinc-700 hover:bg-stone-200/50 rounded-xl transition-all text-sm font-medium"
      >
        <span className="material-symbols-outlined text-sm">logout</span>
        Sign Out
      </button>
    </aside>
  )
}
