import { useEffect, useState } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { teamService } from '../../services/teamService'
import { matchService } from '../../services/matchService'
import { computePointsTable } from '../../services/pointsService'

export default function PointsTablePage() {
  const { team } = useAuthStore()
  const [standings, setStandings] = useState([])
  const [loading, setLoading] = useState(true)
  const teamId = team?.id

  useEffect(() => {
    async function fetchData() {
      try {
        const [teams, matches] = await Promise.all([
          teamService.getTeams('approved'),
          matchService.getMatches()
        ])
        const table = computePointsTable(teams, matches)
        setStandings(table)
      } catch (err) {
        console.error('Error fetching points table:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return <div className="p-12 text-center text-outline animate-pulse">Loading standings...</div>
  }

  return (
    <div className="py-8 md:py-12 px-4 md:px-8 max-w-7xl mx-auto">
      <header className="mb-10">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-primary mb-2 block">Group Stage 2024</span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-on-surface">Points Table</h1>
          </div>
          <div className="flex gap-3">
            <div className="flex gap-2">
              <span className="px-4 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold tracking-wider">BOX CRICKET</span>
            </div>
          </div>
        </div>
      </header>

      {/* Table */}
      <div className="bg-surface-container-low rounded-3xl p-1 overflow-hidden whisper-shadow">
        <div className="bg-surface-container-lowest rounded-[1.4rem] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="text-[10px] md:text-xs font-bold text-on-surface-variant uppercase tracking-widest bg-surface-container-low/50">
                  <th className="py-6 px-6 w-16 text-center">Rank</th>
                  <th className="py-6 px-6">Team Name</th>
                  <th className="py-6 px-4 text-center">P</th>
                  <th className="py-6 px-4 text-center">W</th>
                  <th className="py-6 px-4 text-center">L</th>
                  <th className="py-6 px-4 text-center">T</th>
                  <th className="py-6 px-6 text-center text-primary">Points</th>
                  <th className="py-6 px-8 text-right">NRR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {standings.map(team_row => {
                  const isMyTeam = team_row.id === teamId
                  return (
                    <tr
                      key={team_row.id}
                      className={`transition-colors ${
                        isMyTeam
                          ? 'bg-secondary-container/20 border-l-4 border-secondary'
                          : 'hover:bg-stone-50/50'
                      }`}
                    >
                      <td className={`py-5 px-6 text-center font-bold ${isMyTeam ? 'text-secondary' : 'text-zinc-400'}`}>
                        {String(team_row.rank).padStart(2, '0')}
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${
                            isMyTeam ? 'bg-secondary-container text-secondary' : 'bg-stone-100 text-primary'
                          }`}>
                            {team_row.team_name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className={`tracking-tight ${isMyTeam ? 'font-black' : 'font-bold'} text-on-surface`}>
                              {team_row.team_name}
                            </span>
                            {isMyTeam && (
                              <span className="text-[10px] font-bold text-secondary-dim uppercase tracking-tighter">Your Team</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-4 text-center font-medium">{team_row.played}</td>
                      <td className="py-5 px-4 text-center font-medium">{team_row.won}</td>
                      <td className="py-5 px-4 text-center font-medium text-zinc-400">{team_row.lost}</td>
                      <td className="py-5 px-4 text-center font-medium text-zinc-400">{team_row.tied}</td>
                      <td className={`py-5 px-6 text-center font-black text-lg ${isMyTeam ? 'text-secondary' : 'text-primary'}`}>
                        {team_row.points}
                      </td>
                      <td className={`py-5 px-8 text-right font-mono font-bold ${
                        isMyTeam ? 'text-secondary' : team_row.nrr >= 0 ? 'text-zinc-600' : 'text-error'
                      }`}>
                        {team_row.nrr >= 0 ? '+' : ''}{team_row.nrr.toFixed(3)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-surface-container-low rounded-3xl p-8">
          <h4 className="text-xl font-bold tracking-tight mb-2">Tournament Format</h4>
          <p className="text-on-surface-variant leading-relaxed">
            Round-robin group stage where each team plays against all others. Top 4 teams advance to the knockout phase.
            Points: Win = 2, Tie = 1, Loss = 0. Tie-breaker is Net Run Rate (NRR).
          </p>
        </div>
        <div className="bg-primary text-on-primary rounded-3xl p-8 relative overflow-hidden">
          <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-white/10 text-[80px]">trending_up</span>
          <h4 className="text-lg font-bold mb-3">Your Standing</h4>
          <p className="text-white/80 text-sm leading-relaxed">
            {teamId ? (
              <>
                Rank <span className="font-bold text-white text-xl">#{standings.find(s => s.id === teamId)?.rank || '-'}</span> with{' '}
                <span className="font-bold text-white">{standings.find(s => s.id === teamId)?.points || 0}</span> points.
              </>
            ) : (
                "Log in to see your team's standing."
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
