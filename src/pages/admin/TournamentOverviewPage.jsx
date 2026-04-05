import { useEffect, useState } from 'react'
import { teamService } from '../../services/teamService'
import { matchService } from '../../services/matchService'
import { computePointsTable } from '../../services/pointsService'
import { useTranslation } from '../../i18n'
import { Badge } from '../../components/ui'
import { SectionLoader } from '../../components/ui/Spinner'

export default function TournamentOverviewPage() {
  const { t } = useTranslation()
  const [standings, setStandings] = useState([])
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [teams, m] = await Promise.all([
          teamService.getTeams('approved'),
          matchService.getMatches()
        ])
        setMatches(m)
        setStandings(computePointsTable(teams, m))
      } catch (err) {
        console.error('Error fetching overview data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const completed = matches.filter(m => m.status === 'completed').length
  const scheduled = matches.filter(m => m.status === 'scheduled').length
  const total = matches.length
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

  if (loading) return <SectionLoader message={t('admin.tournament.loadingOverview')} />

  return (
    <div className="p-8 md:p-10 max-w-[1400px] mx-auto space-y-10">
      <header>
        <h2 className="text-2xl font-bold tracking-tighter text-on-surface">{t('admin.tournament.tournamentOverview')}</h2>
        <p className="text-xs font-bold uppercase tracking-[0.05em] text-outline">{t('common.season')}</p>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { icon: 'analytics', value: completed, label: t('admin.tournament.played') },
          { icon: 'pending_actions', value: scheduled, label: t('admin.tournament.remaining') },
          { icon: 'trending_up', value: standings.length, label: t('common.teams') },
        ].map(s => (
          <div key={s.label} className="bg-surface-container-low p-6 rounded-[2rem] flex flex-col justify-between h-40 hover:bg-surface-container-lowest transition-all">
            <span className="material-symbols-outlined text-primary text-3xl">{s.icon}</span>
            <div>
              <h4 className="text-3xl font-extrabold">{String(s.value).padStart(2,'0')}</h4>
              <p className="text-sm text-outline">{s.label}</p>
            </div>
          </div>
        ))}
        <div className="bg-primary p-6 rounded-[2rem] flex flex-col justify-between h-40 text-on-primary relative overflow-hidden">
          <span className="material-symbols-outlined text-3xl">stars</span>
          <div>
            <h4 className="text-3xl font-extrabold">{completionRate}%</h4>
            <p className="text-sm opacity-80">{t('admin.tournament.complete')}</p>
          </div>
          <span className="material-symbols-outlined absolute -right-4 -bottom-4 opacity-10 text-[100px]">trophy</span>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <h3 className="text-xl font-bold mb-4">{t('admin.tournament.livePointsTable')}</h3>
          <div className="bg-surface-container-lowest rounded-[2rem] whisper-shadow overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-surface-container-low/50 text-xs font-bold uppercase tracking-widest text-outline">
                  <th className="px-6 py-4">{t('standings.rank')}</th>
                  <th className="px-4 py-4">{t('admin.dashboard.team')}</th>
                  <th className="px-3 py-4 text-center">{t('standings.played')}</th>
                  <th className="px-3 py-4 text-center">{t('standings.won')}</th>
                  <th className="px-3 py-4 text-center">{t('standings.lost')}</th>
                  <th className="px-3 py-4 text-center">{t('standings.nrr')}</th>
                  <th className="px-6 py-4 text-center">{t('standings.points')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {standings.map(team => (
                  <tr key={team.id} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="px-6 py-4 font-bold">{String(team.rank).padStart(2,'0')}</td>
                    <td className="px-4 py-4 font-semibold">{team.team_name}</td>
                    <td className="px-3 py-4 text-center">{team.played}</td>
                    <td className="px-3 py-4 text-center">{team.won}</td>
                    <td className="px-3 py-4 text-center">{team.lost}</td>
                    <td className="px-3 py-4 text-center text-outline">{team.nrr>=0?'+':''}{team.nrr.toFixed(3)}</td>
                    <td className="px-6 py-4 text-center"><Badge status="info">{team.points}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold">{t('admin.tournament.matchCenter')}</h3>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-3">{t('common.upcoming')}</p>
            {matches.filter(m=>m.status==='scheduled').slice(0,3).map(m=>(
              <div key={m.id} className="bg-surface-container-low p-4 rounded-2xl mb-2 hover:bg-surface-container-lowest transition-all">
                <p className="text-[10px] text-outline mb-1">{new Date(m.scheduled_at).toLocaleDateString('en-IN',{month:'short',day:'numeric'})}</p>
                <p className="text-sm font-bold">{m.team_a?.team_name} vs {m.team_b?.team_name}</p>
              </div>
            ))}
            {matches.filter(m=>m.status==='scheduled').length === 0 && <p className="text-xs text-outline py-4">{t('admin.tournament.noUpcomingMatches')}</p>}
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-3">{t('admin.tournament.recentlyCompleted')}</p>
            {matches.filter(m=>m.status==='completed').reverse().slice(0,3).map(m=>(
              <div key={m.id} className="bg-surface-container-low/50 p-4 rounded-2xl mb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold">{m.team_a?.team_name}</p>
                    <p className="text-xs text-outline">vs {m.team_b?.team_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-on-surface">{m.runs_a}/{m.wickets_a}</p>
                    <p className="text-xs text-primary font-bold">{m.runs_b}/{m.wickets_b}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
