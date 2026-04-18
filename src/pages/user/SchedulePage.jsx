import { useEffect, useState, useMemo, useRef } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { matchService } from '../../services/matchService'
import { useTranslation } from '../../i18n'
import { Badge, FilterPills, PageHeader, toast } from '../../components/ui'
import { SectionLoader } from '../../components/ui/Spinner'

export default function SchedulePage() {
  const { t } = useTranslation()
  const { team } = useAuthStore()
  const teamId = team?.id

  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Tab & Filters
  const [activeTab, setActiveTab] = useState('all') // 'all' or 'my'
  const [subFilter, setSubFilter] = useState('all') // 'all', 'upcoming', 'completed', 'scheduled'
  
  // Pagination
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 })
  
  const bottomSentinelRef = useRef(null)

  useEffect(() => {
    async function fetchMatches() {
      try {
        const data = await matchService.getMatches()
        setMatches(data)
      } catch (err) {
        console.error('Error fetching matches:', err)
        toast.error(t('schedule.failedLoadSchedule') || 'Failed to load match schedule')
      } finally {
        setLoading(false)
      }
    }
    fetchMatches()
  }, [t])

  const myTeamFilters = [
    { key: 'all', label: 'All' },
    { key: 'completed', label: t('common.completed') || 'Completed' },
    { key: 'scheduled', label: t('common.scheduled') || 'Scheduled' }
  ]

  // Filter out matches based on active tab and sub-filter
  const filteredMatches = useMemo(() => {
    return matches.filter(m => {
      const isMyTeam = String(m.team_a_id) === String(teamId) || String(m.team_b_id) === String(teamId)
      
      if (activeTab === 'my') {
        if (!isMyTeam) return false
        
        switch (subFilter) {
          case 'scheduled':
            return m.status === 'scheduled' || m.status === 'pending'
          case 'completed':
            return m.status === 'completed'
          default:
            return true
        }
      }
      return true
    })
  }, [matches, activeTab, subFilter, teamId])

  // Group Chronologically
  const groupedDates = useMemo(() => {
    const rawGroups = filteredMatches.reduce((acc, match) => {
      // YYYY-MM-DD
      const dateStr = new Date(match.scheduled_at).toLocaleDateString('en-CA')
      if (!acc[dateStr]) {
        acc[dateStr] = {
          dateStr,
          displayDate: new Date(match.scheduled_at).toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' }),
          matches: []
        }
      }
      acc[dateStr].matches.push(match)
      return acc
    }, {})

    // Sort chronologically (Descending)
    const sortedGroups = Object.values(rawGroups).sort((a, b) => b.dateStr.localeCompare(a.dateStr))
    
    // Sort matches within each date group descending by time
    sortedGroups.forEach(group => {
      group.matches.sort((a, b) => new Date(b.scheduled_at) - new Date(a.scheduled_at))
    })
    
    return sortedGroups
  }, [filteredMatches])

  // Initialize visible range
  useEffect(() => {
    if (groupedDates.length === 0) return

    setVisibleRange({
      start: 0,
      end: Math.min(4, groupedDates.length - 1)
    })
  }, [groupedDates, activeTab, subFilter])

  // Bottom Sentinel Observer for Infinite Scroll
  useEffect(() => {
    if (!bottomSentinelRef.current || groupedDates.length === 0) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisibleRange(prev => {
          if (prev.end < groupedDates.length - 1) {
            return { ...prev, end: Math.min(prev.end + 3, groupedDates.length - 1) }
          }
          return prev
        })
      }
    }, { rootMargin: '200px' })
    observer.observe(bottomSentinelRef.current)
    return () => observer.disconnect()
  }, [groupedDates.length])

  if (loading) {
    return <SectionLoader message={t('schedule.loadingSchedule')} />
  }

  // Derive visible group portion
  const visibleGroups = groupedDates.slice(visibleRange.start, visibleRange.end + 1)

  return (
    <div className="py-8 md:py-12 px-4 md:px-8 max-w-7xl mx-auto">
      <PageHeader
        badge={<Badge status="info">{t('common.season')}</Badge>}
        title={t('schedule.matchSchedule')}
        description={t('schedule.scheduleDescription')}
      />

      {/* Primary Tabs */}
      <div className="flex gap-4 border-b border-outline-variant/20 mb-8 pb-4">
        <button
          onClick={() => { setActiveTab('all'); setSubFilter('all'); }}
          className={`px-6 py-2.5 rounded-full text-sm font-bold tracking-wide transition-colors ${
            activeTab === 'all' 
              ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' 
              : 'bg-surface-container-low text-on-surface hover:bg-surface-container-highest'
          }`}
        >
          {t('schedule.allMatches') || 'All Matches'}
        </button>
        <button
          onClick={() => setActiveTab('my')}
          className={`px-6 py-2.5 rounded-full text-sm font-bold tracking-wide transition-colors ${
            activeTab === 'my' 
              ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' 
              : 'bg-surface-container-low text-on-surface hover:bg-surface-container-highest'
          }`}
        >
           {t('schedule.myTeam') || 'My Team'}
        </button>
      </div>

      {/* Sub Filter automatically visible for My Teams */}
      {activeTab === 'my' && (
        <FilterPills
          filters={myTeamFilters}
          active={subFilter}
          onChange={setSubFilter}
          className="mb-10"
        />
      )}

      {/* Infinite Scroll Schedule Container */}
      <div className="space-y-16">
        {visibleGroups.map((group) => (
          <section key={group.dateStr}>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-[1px] flex-grow bg-outline-variant/20" />
              <h2 className="text-sm font-bold tracking-[0.15em] text-outline uppercase whitespace-nowrap">{group.displayDate}</h2>
              <div className="h-[1px] flex-grow bg-outline-variant/20" />
            </div>
            <div className="space-y-4">
              {group.matches.map(match => {
                const isCompleted = match.status === 'completed'
                const isMyMatch = String(match.team_a_id) === String(teamId) || String(match.team_b_id) === String(teamId)
                
                return (
                  <div
                    key={match.id}
                    className={`group rounded-[2rem] p-6 md:p-8 flex flex-col lg:flex-row items-center gap-6 transition-all whisper-shadow ${
                      isMyMatch ? 'bg-primary/5 border-2 border-primary/20 shadow-md' : 'bg-surface-container-low hover:bg-surface-container-lowest'
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

        {groupedDates.length > 0 && visibleRange.end < groupedDates.length - 1 && (
          <div ref={bottomSentinelRef} className="h-10 flex justify-center items-center opacity-50">
            <span className="material-symbols-outlined animate-spin">refresh</span>
          </div>
        )}
      </div>

      {groupedDates.length === 0 && (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-5xl text-outline-variant/30 mb-4">calendar_month</span>
          <h3 className="text-xl font-bold text-on-surface-variant">{t('schedule.noMatchesFound')}</h3>
          <p className="text-sm text-outline mt-2">{t('schedule.tryDifferentFilter')}</p>
        </div>
      )}
    </div>
  )
}
