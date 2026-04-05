import { useEffect, useState } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { matchService } from '../../services/matchService'

export default function SchedulePage() {
  const [filter, setFilter] = useState('all')
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const { team } = useAuthStore()
  const teamId = team?.id

  const filters = [
    { key: 'all', label: 'All Matches' },
    { key: 'my', label: 'My Team' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'completed', label: 'Completed' },
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

  // Group by date
  const grouped = filteredMatches.reduce((acc, match) => {
    const date = new Date(match.scheduled_at).toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })
    if (!acc[date]) acc[date] = []
    acc[date].push(match)
    return acc
  }, {})

  if (loading) {
    return <div className="p-12 text-center text-outline animate-pulse">Loading schedule...</div>
  }

  return (
    <div className="py-8 md:py-12 px-4 md:px-8 max-w-7xl mx-auto">
      <header className="mb-10">
        <span className="inline-block px-3 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-bold tracking-[0.1em] rounded-full uppercase mb-4">Season 2024</span>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-[-0.04em] text-on-surface mb-3">Match Schedule</h1>
        <p className="text-lg text-on-surface-variant leading-relaxed">Complete guide to every match across the tournament.</p>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-10">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
              filter === f.key
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

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
                    {/* Match Info */}
                    <div className="flex flex-col items-center lg:items-start min-w-[120px]">
                      <span className="text-[11px] font-bold tracking-widest text-outline uppercase mb-1">Match #{match.match_number}</span>
                      <span className="text-lg font-bold">
                        {new Date(match.scheduled_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-sm text-on-surface-variant mt-1">{match.venue}</span>
                    </div>

                    {/* Teams */}
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
                            <div className="text-[10px] font-black uppercase text-outline mb-1">Result</div>
                            <div className="flex items-center gap-3">
                              <span className={`text-2xl font-black ${match.result === 'team_a' ? 'text-on-surface' : 'text-on-surface opacity-40'}`}>
                                {match.runs_a}/{match.wickets_a}
                              </span>
                              <span className="text-xs font-bold text-outline">VS</span>
                              <span className={`text-2xl font-black ${match.result === 'team_b' ? 'text-on-surface' : 'text-on-surface opacity-40'}`}>
                                {match.runs_b}/{match.wickets_b}
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="px-4 py-1 bg-surface-container-high rounded-full text-[10px] font-black uppercase text-outline tracking-widest">Upcoming</div>
                            <div className="text-2xl font-light text-outline mt-1">VS</div>
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

                    {/* Result */}
                    <div className="lg:w-44 text-center lg:text-right">
                      {isCompleted ? (
                        <span className="text-sm font-bold text-tertiary">{match.summary}</span>
                      ) : isMyMatch ? (
                        <span className="text-xs font-bold text-secondary uppercase tracking-wider">Your Match</span>
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
          <h3 className="text-xl font-bold text-on-surface-variant">No matches found</h3>
          <p className="text-sm text-outline mt-2">Try a different filter to view matches.</p>
        </div>
      )}
    </div>
  )
}
