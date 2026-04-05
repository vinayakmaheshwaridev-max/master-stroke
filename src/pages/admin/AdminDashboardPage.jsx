import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { teamService } from '../../services/teamService'
import { matchService } from '../../services/matchService'
import { settingsService } from '../../services/settingsService'
import { useTranslation } from '../../i18n'
import { Card, Badge, PageHeader } from '../../components/ui'
import { SectionLoader } from '../../components/ui/Spinner'

export default function AdminDashboardPage() {
  const { t } = useTranslation()
  const [regOpen, setRegOpen] = useState(true)
  const [teams, setTeams] = useState([])
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [t, m, status] = await Promise.all([
          teamService.getTeams('all'),
          matchService.getMatches(),
          settingsService.getRegistrationStatus()
        ])
        setTeams(t || [])
        setMatches(m || [])
        setRegOpen(status)
      } catch (err) {
        console.error('Error fetching admin dashboard:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const pending = teams.filter(t => t.status === 'pending').length
  const approved = teams.filter(t => t.status === 'approved').length
  const paymentPending = teams.filter(t => t.status === 'approved' && !t.payment_done).length
  const todayMatches = matches.filter(m => {
      const today = new Date().toDateString()
      return new Date(m.scheduled_at).toDateString() === today
  }).length

  const recentTeams = [...teams].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5)

  const handleToggleReg = async () => {
    try {
      await settingsService.setRegistrationStatus(!regOpen)
      setRegOpen(!regOpen)
    } catch (err) {
      alert(t('admin.dashboard.failedToggleReg'))
    }
  }

  if (loading) {
      return <SectionLoader message={t('admin.dashboard.loadingAdmin')} />
  }

  return (
    <div className="p-8 md:p-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary opacity-60 mb-2 block">{t('admin.dashboard.systemOverview')}</span>
          <h2 className="text-4xl md:text-5xl font-black text-editorial-tight text-on-surface">{t('admin.dashboard.adminHub')}</h2>
        </div>
        <div className="bg-surface-container-lowest p-4 px-6 rounded-2xl flex items-center gap-6 shadow-sm ring-1 ring-on-surface/5">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-outline">{t('admin.dashboard.statusLabel')}</span>
            <p className="text-sm font-bold text-on-surface">{regOpen ? t('admin.dashboard.registrationOpen') : t('admin.dashboard.registrationClosed')}</p>
          </div>
          <button
            onClick={handleToggleReg}
            className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${regOpen ? 'bg-secondary-container' : 'bg-surface-container-high'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full transition-transform ${regOpen ? 'translate-x-7 bg-on-secondary-container' : 'translate-x-1 bg-outline'}`} />
          </button>
        </div>
      </header>

      {/* Metrics Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
        <Card variant="elevated" className="col-span-2 row-span-2 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
          <div className="z-10">
            <span className="material-symbols-outlined text-primary mb-4 p-3 bg-primary-container/30 rounded-2xl inline-block">person_add</span>
            <h3 className="text-lg font-bold text-on-surface-variant">{t('admin.dashboard.totalRegistrations')}</h3>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-6xl md:text-7xl font-black text-editorial-tight">{teams.length}</span>
            </div>
          </div>
          <div className="z-10 mt-6 flex gap-2 items-center">
            <div className="h-1 flex-1 bg-primary-container rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${(approved / teams.length) * 100 || 0}%` }} />
            </div>
            <span className="text-[10px] font-black uppercase text-outline">{approved} {t('admin.dashboard.approved')}</span>
          </div>
        </Card>

        <div className="bg-surface-container-low rounded-3xl p-6 flex flex-col justify-between hover:bg-surface-container-lowest transition-colors">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-primary p-2 bg-white rounded-xl">hourglass_empty</span>
            <Badge status="error">{t('admin.dashboard.actionRequired')}</Badge>
          </div>
          <div><h3 className="text-sm font-medium text-on-surface-variant">{t('admin.dashboard.pendingApproval')}</h3><p className="text-3xl font-black mt-1">{pending}</p></div>
        </div>

        <div className="bg-surface-container-low rounded-3xl p-6 flex flex-col justify-between hover:bg-surface-container-lowest transition-colors">
          <span className="material-symbols-outlined text-primary p-2 bg-white rounded-xl w-fit">check_circle</span>
          <div><h3 className="text-sm font-medium text-on-surface-variant">{t('admin.dashboard.approvedTeams')}</h3><p className="text-3xl font-black mt-1">{approved}</p></div>
        </div>

        <div className="bg-surface-container-low rounded-3xl p-6 flex flex-col justify-between hover:bg-surface-container-lowest transition-colors">
          <span className="material-symbols-outlined text-primary p-2 bg-white rounded-xl w-fit">payments</span>
          <div><h3 className="text-sm font-medium text-on-surface-variant">{t('admin.dashboard.paymentPending')}</h3><p className="text-3xl font-black mt-1">{paymentPending}</p></div>
        </div>

        <div className="bg-surface-container-low rounded-3xl p-6 flex flex-col justify-between hover:bg-surface-container-lowest transition-colors">
          <span className="material-symbols-outlined text-primary p-2 bg-white rounded-xl w-fit">event</span>
          <div><h3 className="text-sm font-medium text-on-surface-variant">{t('admin.dashboard.todaysMatches')}</h3><p className="text-3xl font-black mt-1">{String(todayMatches).padStart(2, '0')}</p></div>
        </div>
      </section>

      {/* Bottom: Table + Sidebar */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-extrabold tracking-tight">{t('admin.dashboard.recentRegistrations')}</h3>
            <Link to="/admin/teams" className="text-xs font-bold text-primary hover:underline">{t('admin.dashboard.viewAllTeams')}</Link>
          </div>
          <Card variant="elevated" className="overflow-hidden !p-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low/50">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-outline">{t('admin.dashboard.captain')}</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-outline">{t('admin.dashboard.team')}</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-outline hidden md:table-cell">{t('admin.dashboard.mobileCol')}</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-outline">{t('admin.dashboard.statusCol')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-on-surface/5">
                {recentTeams.map(team => (
                  <tr key={team.id} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary-container/40 flex items-center justify-center text-[10px] font-bold">
                          {team.captain_name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-bold text-sm">{team.captain_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">{team.team_name}</td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant font-mono hidden md:table-cell">{team.mobile}</td>
                    <td className="px-6 py-4">
                      <Badge status={team.status}>{team.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-extrabold tracking-tight">{t('admin.dashboard.quickActions')}</h3>
          <Link to="/admin/teams" className="block bg-primary text-on-primary rounded-[2rem] p-6 shadow-xl shadow-primary/10 relative overflow-hidden hover:scale-[1.02] transition-transform">
            <span className="material-symbols-outlined absolute top-4 right-4 opacity-20 text-4xl">groups</span>
            <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">{t('common.pending')}</p>
            <p className="text-xl font-bold">{t('admin.dashboard.teamsNeedReview', { count: pending })}</p>
          </Link>
          <Link to="/admin/scheduler" className="block bg-surface-container-low rounded-[2rem] p-6 hover:bg-surface-container-lowest transition-colors">
            <h4 className="text-sm font-black uppercase tracking-widest text-outline mb-3">{t('navigation.schedule')}</h4>
            <p className="text-sm font-medium">{t('admin.dashboard.upcomingMatches', { count: matches.filter(m => m.status === 'scheduled').length })}</p>
          </Link>
        </div>
      </section>
    </div>
  )
}
