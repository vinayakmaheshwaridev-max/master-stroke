import { useEffect, useState } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { matchService } from '../../services/matchService'
import { useTranslation } from '../../i18n'
import { Badge, FilterPills, PageHeader } from '../../components/ui'
import { SectionLoader } from '../../components/ui/Spinner'

export default function SchedulePage() {
  const { t } = useTranslation()
  const [filter, setFilter] = useState('all')
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const { team } = useAuthStore()
  const teamId = team?.id

  const filters = [
    { key: 'all', label: t('schedule.allMatches') },
    { key: 'my', label: t('schedule.myTeam') },
    { key: 'upcoming', label: t('common.upcoming') },
    { key: 'completed', label: t('common.completed') },
  ]

  useEffect(() => {
    async function fetchMatches() {
      try {
        const data = await matchService.getMatches()
        setMatches(data)
      } catch (err) {
        console.error('Error fetching matches:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchMatches()
  }, [])

  const filteredMatches = matches.filter(m => {
    if (filter === 'my') return m.team_a_id === teamId || m.team_b_id === teamId
    if (filter === 'upcoming') return m.status === 'scheduled'
    if (filter === 'completed') return m.status === 'completed'
    return true
  })

  const grouped = filteredMatches.reduce((acc, match) => {
    const date = new Date(match.scheduled_at).toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })
    if (!acc[date]) acc[date] = []
    acc[date].push(match)
    return acc
  }, {})

  if (loading) {
    return <SectionLoader message={t('schedule.loadingSchedule')} />
  }

  return (
    <div className="py-8 md:py-12 px-4 md:px-8 max-w-7xl mx-auto">
      <PageHeader
        badge={<Badge status="info">{t('common.season')}</Badge>}
        title={t('schedule.matchSchedule')}
        description={t('schedule.scheduleDescription')}
      />

      <FilterPills
        filters={filters}
        active={filter}
        onChange={setFilter}
        className="mb-10"
      />

      {/* Schedule */}
      <div className="space-y-16">
        {Object.entries(grouped).map(([date, matches]) => (
          <section key={date}>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-[1px] flex-grow bg-outline-variant/20" />
              <h2 className="text-sm font-bold tracking-[0.15em] text-outline uppercase whitespace-nowrap">{date}</h2>
              <div className="h-[1px] flex-grow bg-outline-variant/20" />
            </div>
            <div className="space-y-4">
              {matches.map(match => {
                const isCompleted = match.status === 'completed'
                const isMyMatch = match.team_a_id === teamId || match.team_b_id === teamId
                
                return (
                  <div
                    key={match.id}
                    className={`group rounded-[2rem] p-6 md:p-8 flex flex-col lg:flex-row items-center gap-6 transition-all whisper-shadow ${
                      isMyMatch ? 'bg-surface-container-lowest border border-secondary-container/50' : 'bg-surface-container-low hover:bg-surface-container-lowest'
                    }`}
                  >
                    <div className="flex flex-col items-center lg:items-start min-w-[120px]">
                      <span className="text-[11px] font-bold tracking-widest text-outline uppercase mb-1">{t('common.match')} #{match.match_number}</span>
                      <span className="text-lg font-bold">
                        {new Date(match.scheduled_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-sm text-on-surface-variant mt-1">{match.venue}</span>
                    </div>

                    <div className="flex-grow flex items-center justify-center lg:justify-between w-full gap-4 md:gap-8">
                      <div className="flex flex-col md:flex-row items-center gap-3 text-center md:text-left flex-1 justify-end">
                        <span className={`text-xl font-extrabold tracking-tight ${match.result === 'team_a' ? '' : match.result ? 'opacity-50' : ''}`}>
                          {match.team_a?.team_name}
                        </span>
                        <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-sm font-bold border-2 border-white">
                          {match.team_a?.team_name?.slice(0, 2).toUpperCase()}
                        </div>
                      </div>

                      <div className="flex flex-col items-center">
                        {isCompleted ? (
                          <>
                            <div className="text-[10px] font-black uppercase text-outline mb-1">{t('common.result')}</div>
                            <div className="flex items-center gap-3">
                              <span className={`text-2xl font-black ${match.result === 'team_a' ? 'text-on-surface' : 'text-on-surface opacity-40'}`}>
                                {match.runs_a}/{match.wickets_a}
                              </span>
                              <span className="text-xs font-bold text-outline">{t('common.vs')}</span>
                              <span className={`text-2xl font-black ${match.result === 'team_b' ? 'text-on-surface' : 'text-on-surface opacity-40'}`}>
                                {match.runs_b}/{match.wickets_b}
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="px-4 py-1 bg-surface-container-high rounded-full text-[10px] font-black uppercase text-outline tracking-widest">{t('common.upcoming')}</div>
                            <div className="text-2xl font-light text-outline mt-1">{t('common.vs')}</div>
                          </>
                        )}
                      </div>

                      <div className="flex flex-col md:flex-row-reverse items-center gap-3 text-center md:text-right flex-1 justify-end">
                        <span className={`text-xl font-extrabold tracking-tight ${match.result === 'team_b' ? '' : match.result ? 'opacity-50' : ''}`}>
                          {match.team_b?.team_name}
                        </span>
                        <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-sm font-bold border-2 border-white">
                          {match.team_b?.team_name?.slice(0, 2).toUpperCase()}
                        </div>
                      </div>
                    </div>

                    <div className="lg:w-44 text-center lg:text-right">
                      {isCompleted ? (
                        <span className="text-sm font-bold text-tertiary">{match.summary}</span>
                      ) : isMyMatch ? (
                        <span className="text-xs font-bold text-secondary uppercase tracking-wider">{t('schedule.yourMatch')}</span>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        ))}
      </div>

      {filteredMatches.length === 0 && (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-5xl text-outline-variant/30 mb-4">calendar_month</span>
          <h3 className="text-xl font-bold text-on-surface-variant">{t('schedule.noMatchesFound')}</h3>
          <p className="text-sm text-outline mt-2">{t('schedule.tryDifferentFilter')}</p>
        </div>
      )}
    </div>
  )
}
