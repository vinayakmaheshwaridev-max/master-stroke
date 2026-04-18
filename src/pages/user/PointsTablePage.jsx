import { useEffect, useState } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { teamService } from '../../services/teamService'
import { matchService } from '../../services/matchService'
import { computePointsTable } from '../../services/pointsService'
import { useTranslation } from '../../i18n'
import { Badge, PageHeader, toast } from '../../components/ui'
import { SectionLoader } from '../../components/ui/Spinner'

export default function PointsTablePage() {
  const { t } = useTranslation()
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
        toast.error(t('standings.failedLoadStandings') || 'Failed to load standings')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return <SectionLoader message={t('standings.loadingStandings')} />
  }

  return (
    <div className="py-8 md:py-12 px-4 md:px-8 max-w-7xl mx-auto">
      <PageHeader
        subtitle={t('standings.groupStage')}
        title={t('standings.pointsTable')}
        actions={<Badge status="info">{t('common.boxCricket')}</Badge>}
      />

      {/* Table */}
      <div className="bg-surface-container-low rounded-3xl p-1 overflow-hidden whisper-shadow">
        <div className="bg-surface-container-lowest rounded-[1.4rem] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="text-[10px] md:text-xs font-bold text-on-surface-variant uppercase tracking-widest bg-surface-container-low/50">
                  <th className="py-6 px-6 w-16 text-center">{t('standings.rank')}</th>
                  <th className="py-6 px-6">{t('standings.teamName')}</th>
                  <th className="py-6 px-4 text-center">{t('standings.played')}</th>
                  <th className="py-6 px-4 text-center">{t('standings.won')}</th>
                  <th className="py-6 px-4 text-center">{t('standings.lost')}</th>
                  <th className="py-6 px-4 text-center">{t('standings.tied')}</th>
                  <th className="py-6 px-6 text-center text-primary">{t('standings.points')}</th>
                  <th className="py-6 px-8 text-right">{t('standings.nrr')}</th>
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
                              <span className="text-[10px] font-bold text-secondary-dim uppercase tracking-tighter">{t('standings.yourTeam')}</span>
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
          <h4 className="text-xl font-bold tracking-tight mb-2">{t('standings.tournamentFormat')}</h4>
          <p className="text-on-surface-variant leading-relaxed">
            {t('standings.formatDescription')}
          </p>
        </div>
        <div className="bg-primary text-on-primary rounded-3xl p-8 relative overflow-hidden">
          <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-white/10 text-[80px]">trending_up</span>
          <h4 className="text-lg font-bold mb-3">{t('standings.yourStanding')}</h4>
          <p className="text-white/80 text-sm leading-relaxed">
            {teamId ? (
              <>
                {t('standings.rankWith')} <span className="font-bold text-white text-xl">#{standings.find(s => s.id === teamId)?.rank || '-'}</span> {t('standings.withPoints')}{' '}
                <span className="font-bold text-white">{standings.find(s => s.id === teamId)?.points || 0}</span> {t('standings.pointsSuffix')}
              </>
            ) : (
                t('standings.loginToSee')
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
