import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { teamService } from '../../services/teamService'
import { matchService } from '../../services/matchService'
import { notificationService } from '../../services/notificationService'

export default function DashboardPage() {
  const { team } = useAuthStore()
  const teamId = team?.id
  const teamName = team?.team_name

  const [isLoading, setIsLoading] = useState(true)
  const [standings, setStandings] = useState([])
  const [matches, setMatches] = useState([])
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [fetchedTeams, fetchedMatches, fetchedNotifications] = await Promise.all([
          teamService.getTeams('approved'),
          matchService.getMatches(),
          notificationService.getNotifications(teamId)
        ])

        const teamStats = {}
        fetchedTeams.forEach(t => {
          teamStats[t.id] = {
            id: t.id,
            team_name: t.team_name,
            played: 0, won: 0, lost: 0, tied: 0,
            points: 0, nrr: 0,
            runs_scored: 0, overs_faced: 0,
            runs_conceded: 0, overs_bowled: 0,
          }
        })

        fetchedMatches.filter(m => m.status === 'completed').forEach(match => {
          const a = teamStats[match.team_a_id]
          const b = teamStats[match.team_b_id]
          if (!a || !b) return

          a.played++; b.played++
          a.runs_scored += match.runs_a || 0; a.overs_faced += match.overs_a || 0
          a.runs_conceded += match.runs_b || 0; a.overs_bowled += match.overs_b || 0
          b.runs_scored += match.runs_b || 0; b.overs_faced += match.overs_b || 0
          b.runs_conceded += match.runs_a || 0; b.overs_bowled += match.overs_a || 0

          if (match.result === 'team_a') {
            a.won++; a.points += 2; b.lost++
          } else if (match.result === 'team_b') {
            b.won++; b.points += 2; a.lost++
          } else if (match.result === 'tie') {
            a.tied++; a.points += 1; b.tied++; b.points += 1
          }
        })

        Object.values(teamStats).forEach(t => {
          if (t.overs_faced > 0 && t.overs_bowled > 0) {
            t.nrr = (t.runs_scored / t.overs_faced) - (t.runs_conceded / t.overs_bowled)
          }
        })

        const computedStandings = Object.values(teamStats)
          .sort((a, b) => b.points - a.points || b.nrr - a.nrr)
          .map((t, i) => ({ ...t, rank: i + 1 }))

        setStandings(computedStandings)
        setMatches(fetchedMatches)
        setNotifications(fetchedNotifications.slice(0, 4))
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (teamId) {
      fetchData()
    } else {
      setIsLoading(false)
    }
  }, [teamId])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
      </div>
    )
  }

  const myStats = standings.find(s => s.id === teamId) || { played: 0, won: 0, lost: 0, tied: 0, points: 0, nrr: 0, rank: '-' }

  const upcomingMatch = matches.find(m => m.status === 'scheduled' && (m.team_a_id === teamId || m.team_b_id === teamId))
  const recentMatch = [...matches].reverse().find(m => m.status === 'completed' && (m.team_a_id === teamId || m.team_b_id === teamId))

  const opponentName = upcomingMatch ? (upcomingMatch.team_a_id === teamId ? upcomingMatch.team_b?.team_name : upcomingMatch.team_a?.team_name) : null

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
              <p className="text-xl font-bold mb-4">vs {opponentName || 'TBD'}</p>
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
                <span className="font-bold">{recentMatch.team_a?.team_name || 'Team A'}</span>
                <span className="text-2xl font-black">{recentMatch.runs_a}/{recentMatch.wickets_a}</span>
              </div>
              <div className="flex items-center justify-between mb-4 opacity-60">
                <span>{recentMatch.team_b?.team_name || 'Team B'}</span>
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
            <Link to="/notifications" className="text-xs font-bold text-primary hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {notifications.map(notif => (
              <div key={notif.id} className="flex gap-3 p-3 rounded-xl hover:bg-surface-container transition-colors">
                <span className={`material-symbols-outlined text-sm mt-1 ${notif.type === 'important' ? 'text-error' : notif.type === 'result' ? 'text-tertiary' : 'text-primary'
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
