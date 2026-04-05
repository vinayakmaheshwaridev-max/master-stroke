import { useAuthStore } from '../../stores/authStore'
import { mockMatches, mockNotifications, getTeamName, computePointsTable } from '../../data/mockData'

export default function DashboardPage() {
  const { team } = useAuthStore()
  const teamId = team?.id || '1'
  const teamName = team?.team_name || 'Royal Challengers'

  const standings = computePointsTable()
  const myStats = standings.find(s => s.id === teamId) || { played: 0, won: 0, lost: 0, tied: 0, points: 0, nrr: 0, rank: '-' }

  const upcomingMatch = mockMatches.find(m => m.status === 'scheduled' && (m.team_a_id === teamId || m.team_b_id === teamId))
  const recentMatch = [...mockMatches].reverse().find(m => m.status === 'completed' && (m.team_a_id === teamId || m.team_b_id === teamId))

  const notifications = mockNotifications.filter(n => n.team_id === null || n.team_id === teamId).slice(0, 4)

  const opponentId = upcomingMatch ? (upcomingMatch.team_a_id === teamId ? upcomingMatch.team_b_id : upcomingMatch.team_a_id) : null

  return (
    <div className="py-8 md:py-12 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Welcome */}
      <header className="mb-10">
        <span className="text-xs font-bold uppercase tracking-[0.15em] text-primary mb-2 block">Team Dashboard</span>
        <h1 className="text-4xl md:text-5xl font-black tracking-[-0.03em] text-on-surface mb-2">Welcome, {teamName}</h1>
        <p className="text-on-surface-variant">Your tournament hub — stats, schedule, and updates in one place.</p>
      </header>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Team Stats Card (Large) */}
        <div className="md:col-span-8 bg-surface-container-lowest rounded-[2rem] p-8 whisper-shadow relative overflow-hidden group">
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-primary p-3 bg-primary-container/30 rounded-2xl">leaderboard</span>
              <div>
                <h3 className="text-lg font-bold">Season Performance</h3>
                <span className="text-xs text-on-surface-variant">Rank #{myStats.rank}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {[
                { label: 'Played', value: myStats.played, color: 'text-on-surface' },
                { label: 'Won', value: myStats.won, color: 'text-tertiary' },
                { label: 'Lost', value: myStats.lost, color: 'text-error' },
                { label: 'Points', value: myStats.points, color: 'text-primary' },
                { label: 'NRR', value: myStats.nrr.toFixed(3), color: myStats.nrr >= 0 ? 'text-tertiary' : 'text-error' },
              ].map(stat => (
                <div key={stat.label} className="text-center">
                  <p className={`text-3xl md:text-4xl font-black ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-outline mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Match */}
        <div className="md:col-span-4 primary-gradient text-on-primary rounded-[2rem] p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <span className="material-symbols-outlined text-6xl">stadium</span>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Next Match</p>
          {upcomingMatch ? (
            <>
              <p className="text-xl font-bold mb-4">vs {getTeamName(opponentId)}</p>
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
            <p className="text-lg font-medium opacity-80 mt-4">No upcoming matches scheduled</p>
          )}
        </div>

        {/* Recent Result */}
        <div className="md:col-span-6 bg-surface-container-low rounded-[2rem] p-8 hover:bg-surface-container-lowest transition-colors whisper-shadow">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-primary p-2 bg-white rounded-xl">scoreboard</span>
            <h3 className="text-lg font-bold">Last Match Result</h3>
          </div>
          {recentMatch ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold">{getTeamName(recentMatch.team_a_id)}</span>
                <span className="text-2xl font-black">{recentMatch.runs_a}/{recentMatch.wickets_a}</span>
              </div>
              <div className="flex items-center justify-between mb-4 opacity-60">
                <span>{getTeamName(recentMatch.team_b_id)}</span>
                <span className="text-2xl font-black">{recentMatch.runs_b}/{recentMatch.wickets_b}</span>
              </div>
              <div className="pt-3 border-t border-outline-variant/20">
                <p className="text-sm font-bold text-tertiary">{recentMatch.summary}</p>
              </div>
            </div>
          ) : (
            <p className="text-on-surface-variant">No completed matches yet</p>
          )}
        </div>

        {/* Notifications */}
        <div className="md:col-span-6 bg-surface-container-low rounded-[2rem] p-8 hover:bg-surface-container-lowest transition-colors whisper-shadow">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary p-2 bg-white rounded-xl">notifications</span>
              <h3 className="text-lg font-bold">Updates</h3>
            </div>
            <span className="text-xs font-bold text-primary">View All</span>
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
          </div>
        </div>
      </div>
    </div>
  )
}
