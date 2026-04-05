import { useEffect, useState } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { matchService } from '../../services/matchService'
import { notificationService } from '../../services/notificationService'
import { useTranslation } from '../../i18n'
import { Card, PageHeader } from '../../components/ui'
import { SectionLoader } from '../../components/ui/Spinner'

export default function DashboardPage() {
  const { t } = useTranslation()
  const { team } = useAuthStore()
  const [matches, setMatches] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const teamId = team?.id
  const teamName = team?.team_name || 'Team'

  useEffect(() => {
    async function fetchData() {
      try {
        const [m, n] = await Promise.all([
          matchService.getMatches(),
          notificationService.getNotifications(teamId)
        ])
        setMatches(m)
        setNotifications(n.slice(0, 4))
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [teamId])

  const upcomingMatch = matches.find(m => m.status === 'scheduled' && (m.team_a_id === teamId || m.team_b_id === teamId))
  const recentMatch = [...matches].reverse().find(m => m.status === 'completed' && (m.team_a_id === teamId || m.team_b_id === teamId))
  const opponent = upcomingMatch ? (upcomingMatch.team_a_id === teamId ? upcomingMatch.team_b : upcomingMatch.team_a) : null

  if (loading) {
    return <SectionLoader message={t('dashboard.loadingDashboard')} />
  }

  return (
    <div className="py-8 md:py-12 px-4 md:px-8 max-w-7xl mx-auto">
      <PageHeader
        subtitle={t('dashboard.teamDashboard')}
        title={t('dashboard.welcomeTeam', { teamName })}
        description={t('dashboard.hubDescription')}
      />

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Team Stats Card */}
        <Card variant="default" className="md:col-span-8 relative overflow-hidden group">
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-primary p-3 bg-primary-container/30 rounded-2xl">leaderboard</span>
              <div>
                <h3 className="text-lg font-bold">{t('dashboard.seasonStats')}</h3>
                <span className="text-xs text-on-surface-variant">{t('dashboard.liveFromTournament')}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: t('dashboard.matches'), value: matches.filter(m => (m.team_a_id === teamId || m.team_b_id === teamId) && m.status === 'completed').length },
                { label: t('dashboard.status'), value: team?.status || 'approved', color: 'text-tertiary' },
                { label: t('dashboard.upcomingLabel'), value: matches.filter(m => (m.team_a_id === teamId || m.team_b_id === teamId) && m.status === 'scheduled').length },
                { label: t('dashboard.payment'), value: team?.payment_done ? t('dashboard.paid') : t('dashboard.pending'), color: team?.payment_done ? 'text-tertiary' : 'text-error' },
              ].map(stat => (
                <div key={stat.label} className="text-center">
                  <p className={`text-2xl md:text-3xl font-black ${stat.color || 'text-on-surface'}`}>{stat.value}</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-outline mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Upcoming Match */}
        <Card variant="gradient" className="md:col-span-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <span className="material-symbols-outlined text-6xl">stadium</span>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">{t('dashboard.nextMatch')}</p>
          {upcomingMatch ? (
            <>
              <p className="text-xl font-bold mb-4">vs {opponent?.team_name}</p>
              <div className="flex flex-col gap-2 text-sm font-medium opacity-90 border-t border-white/10 pt-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">schedule</span>
                  {new Date(upcomingMatch.scheduled_at).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                  {' '}
                  {new Date(upcomingMatch.scheduled_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">location_on</span>
                  {upcomingMatch.venue}
                </div>
              </div>
            </>
          ) : (
            <p className="text-lg font-medium opacity-80 mt-4">{t('dashboard.noUpcomingMatches')}</p>
          )}
        </Card>

        {/* Recent Result */}
        <Card variant="flat" className="md:col-span-6 hover:bg-surface-container-lowest transition-colors">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-primary p-2 bg-white rounded-xl">scoreboard</span>
            <h3 className="text-lg font-bold">{t('dashboard.lastMatchResult')}</h3>
          </div>
          {recentMatch ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold">{recentMatch.team_a?.team_name}</span>
                <span className="text-2xl font-black">{recentMatch.runs_a}/{recentMatch.wickets_a}</span>
              </div>
              <div className="flex items-center justify-between mb-4 opacity-60">
                <span>{recentMatch.team_b?.team_name}</span>
                <span className="text-2xl font-black">{recentMatch.runs_b}/{recentMatch.wickets_b}</span>
              </div>
              <div className="pt-3 border-t border-outline-variant/20">
                <p className="text-sm font-bold text-tertiary">{recentMatch.summary}</p>
              </div>
            </div>
          ) : (
            <p className="text-on-surface-variant">{t('dashboard.noCompletedMatches')}</p>
          )}
        </Card>

        {/* Notifications */}
        <Card variant="flat" className="md:col-span-6 hover:bg-surface-container-lowest transition-colors">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary p-2 bg-white rounded-xl">notifications</span>
              <h3 className="text-lg font-bold">{t('dashboard.updates')}</h3>
            </div>
          </div>
          <div className="space-y-3">
            {notifications.map(notif => (
              <div key={notif.id} className="flex gap-3 p-3 rounded-xl hover:bg-surface-container transition-colors">
                <span className={`material-symbols-outlined text-sm mt-1 ${
                  notif.type === 'important' ? 'text-error' : notif.type === 'result' ? 'text-tertiary' : 'text-primary'
                }`}>
                  {notif.type === 'important' ? 'warning' : notif.type === 'result' ? 'emoji_events' : 'info'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-relaxed ${notif.is_read ? 'text-on-surface-variant' : 'text-on-surface font-medium'}`}>
                    {notif.message}
                  </p>
                  <p className="text-xs text-outline mt-1">
                    {new Date(notif.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                {!notif.is_read && <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />}
              </div>
            ))}
            {notifications.length === 0 && <p className="text-sm text-outline">{t('dashboard.noUpdates')}</p>}
          </div>
        </Card>
      </div>
    </div>
  )
}
