import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { teamService } from '../../services/teamService'
import { matchService } from '../../services/matchService'
import { useTranslation } from '../../i18n'
import { Button, Badge, toast } from '../../components/ui'
import { SectionLoader } from '../../components/ui/Spinner'
import {
  INCOMPLETE_STATUS_FILTER,
  MATCH_STATUS,
  getDateInputValue,
  getMatchScoreStatus,
  getTimeInputValue,
  getTodayStartDateTimeValue,
  isIncompleteScoreStatus,
} from '../../utils/matchStatus'

const DEFAULT_MATCH_VALUES = {
  team_a_id: '',
  team_b_id: '',
  date: '',
  time: '',
  venue: '',
  notes: '',
}

const FIELD_CLASS =
  'w-full bg-surface-container-lowest border-none rounded-xl py-2.5 px-3 text-sm focus:ring-4 focus:ring-primary-fixed-dim/30 transition-all'
const SELECT_FIELD_CLASS = `${FIELD_CLASS} font-medium`
const FIELD_LABEL_CLASS = 'text-[11px] font-bold tracking-wide uppercase text-on-surface-variant ml-1'
const FILTER_FIELD_CLASS =
  'w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-3 py-2 text-xs font-semibold text-on-surface outline-none transition focus:ring-4 focus:ring-primary-fixed-dim/30'
const SCHEDULER_PAGE_SIZE = 10
const SCHEDULER_FILTER_DEFAULTS = {
  date: '',
  time: '',
  matchId: '',
  teamId: '',
  status: '',
}

const matchSchema = z.object({
  team_a_id: z.string().min(1, 'Please select Team A'),
  team_b_id: z.string().min(1, 'Please select Team B'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  venue: z.string().min(1, 'Venue is required'),
  notes: z.string().optional(),
}).refine(data => data.team_a_id !== data.team_b_id, {
  message: 'Team A and Team B cannot be the same',
  path: ['team_b_id'],
})

function formatDateInput(value) {
  return getDateInputValue(value)
}

function formatTimeInput(value) {
  return getTimeInputValue(value)
}

function getMatchFormValues(match) {
  if (!match) return DEFAULT_MATCH_VALUES

  return {
    team_a_id: match.team_a_id ? String(match.team_a_id) : '',
    team_b_id: match.team_b_id ? String(match.team_b_id) : '',
    date: formatDateInput(match.scheduled_at),
    time: formatTimeInput(match.scheduled_at),
    venue: match.venue || '',
    notes: match.notes || '',
  }
}

function getUniqueTeamsFromMatches(matches) {
  const teamMap = new Map()

  matches.forEach((match) => {
    if (match.team_a?.id) teamMap.set(String(match.team_a.id), match.team_a.team_name)
    if (match.team_b?.id) teamMap.set(String(match.team_b.id), match.team_b.team_name)
  })

  return Array.from(teamMap, ([id, name]) => ({ id, name })).sort((left, right) =>
    left.name.localeCompare(right.name)
  )
}

function matchHasTeam(match, teamId) {
  if (!teamId) return true
  return String(match.team_a?.id) === teamId || String(match.team_b?.id) === teamId
}

function matchPassesFilters(match, filters) {
  const displayStatus = getMatchScoreStatus(match)

  if (filters.date && formatDateInput(match.scheduled_at) !== filters.date) return false
  if (filters.time && formatTimeInput(match.scheduled_at) !== filters.time) return false
  if (filters.matchId && String(match.id) !== filters.matchId) return false
  if (filters.teamId && !matchHasTeam(match, filters.teamId)) return false
  if (filters.status === INCOMPLETE_STATUS_FILTER && !isIncompleteScoreStatus(displayStatus)) return false
  if (filters.status && filters.status !== INCOMPLETE_STATUS_FILTER && displayStatus !== filters.status) return false
  return true
}

function getStatusLabel(match, t) {
  const displayStatus = getMatchScoreStatus(match)
  const labels = {
    [MATCH_STATUS.completed]: t('common.completed'),
    [MATCH_STATUS.scheduled]: t('common.scheduled'),
    [MATCH_STATUS.pending]: t('common.pendingScore'),
  }

  return labels[displayStatus] || displayStatus
}

function getPageItems(items, page, pageSize) {
  const startIndex = (page - 1) * pageSize
  return items.slice(startIndex, startIndex + pageSize)
}

function PaginationControls({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPrevious,
  onNext,
  t,
}) {
  if (totalItems === 0) return null

  const startItem = (page - 1) * pageSize + 1
  const endItem = Math.min(page * pageSize, totalItems)

  return (
    <div className="mt-3 flex flex-col gap-2 border-t border-outline-variant/20 pt-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-on-surface-variant">
        {t('common.showing')} {startItem}-{endItem} {t('common.of')} {totalItems}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={onPrevious}
          className="rounded-full border border-outline-variant/20 bg-surface-container-lowest px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-on-surface-variant transition hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-45"
        >
          {t('common.previous')}
        </button>
        <span className="text-[11px] font-black text-on-surface-variant">
          {page}/{totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={onNext}
          className="rounded-full border border-outline-variant/20 bg-surface-container-lowest px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-on-surface-variant transition hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-45"
        >
          {t('common.next')}
        </button>
      </div>
    </div>
  )
}

export default function MatchSchedulerPage() {
  const { t } = useTranslation()
  const formRef = useRef(null)
  const [matches, setMatches] = useState([])
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingMatchId, setEditingMatchId] = useState('')
  const [showSchedulerFilters, setShowSchedulerFilters] = useState(false)
  const [schedulerFilters, setSchedulerFilters] = useState(SCHEDULER_FILTER_DEFAULTS)
  const [schedulerPage, setSchedulerPage] = useState(1)

  const { register, handleSubmit, formState: { errors, isDirty }, reset, watch } = useForm({
    resolver: zodResolver(matchSchema),
    defaultValues: DEFAULT_MATCH_VALUES,
  })

  const teamAId = watch('team_a_id')
  const teamBId = watch('team_b_id')

  const editingMatch = useMemo(
    () => matches.find((match) => String(match.id) === editingMatchId) || null,
    [matches, editingMatchId]
  )

  const schedulerTeamOptions = useMemo(
    () => getUniqueTeamsFromMatches(matches),
    [matches]
  )

  const filteredMatches = useMemo(
    () => matches.filter((match) => matchPassesFilters(match, schedulerFilters)),
    [matches, schedulerFilters]
  )

  const schedulerTotalPages = Math.max(1, Math.ceil(filteredMatches.length / SCHEDULER_PAGE_SIZE))
  const paginatedMatches = useMemo(
    () => getPageItems(filteredMatches, schedulerPage, SCHEDULER_PAGE_SIZE),
    [filteredMatches, schedulerPage]
  )

  const fetchData = useCallback(async () => {
    try {
      try {
        await matchService.markPastScheduledMatchesPending(getTodayStartDateTimeValue())
      } catch (statusErr) {
        console.warn('Unable to sync pending match statuses:', statusErr)
      }

      const [approvedTeams, scheduledMatches] = await Promise.all([
        teamService.getTeams('approved'),
        matchService.getMatches()
      ])
      setTeams(approvedTeams || [])
      setMatches(scheduledMatches || [])
    } catch (err) {
      console.error('Error fetching scheduler data:', err)
      toast.error(t('admin.scheduler.failedLoadScheduler') || 'Failed to load scheduler data')
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (editingMatch) {
      reset(getMatchFormValues(editingMatch))
    }
  }, [editingMatch, reset])

  useEffect(() => {
    setSchedulerPage(1)
  }, [schedulerFilters])

  useEffect(() => {
    if (schedulerPage > schedulerTotalPages) {
      setSchedulerPage(schedulerTotalPages)
    }
  }, [schedulerPage, schedulerTotalPages])

  const resetForm = () => {
    reset(DEFAULT_MATCH_VALUES)
  }

  const cancelEditing = () => {
    setEditingMatchId('')
    resetForm()
  }

  const handleEditMatch = (match) => {
    setEditingMatchId(String(match.id))
    reset(getMatchFormValues(match))
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const updateSchedulerFilter = (key, value) => {
    setSchedulerFilters((currentFilters) => ({
      ...currentFilters,
      [key]: value,
    }))
  }

  const onSubmit = async (data) => {
    try {
      const matchData = {
        team_a_id: data.team_a_id,
        team_b_id: data.team_b_id,
        scheduled_at: `${data.date}T${data.time}:00`,
        venue: data.venue,
        notes: data.notes,
      }

      if (editingMatch) {
        const updatedMatchData = editingMatch.status === MATCH_STATUS.completed
          ? matchData
          : { ...matchData, status: MATCH_STATUS.scheduled }

        await matchService.updateMatch(editingMatch.id, updatedMatchData)
        toast.success(t('admin.scheduler.matchUpdated') || 'Match updated successfully')
        setEditingMatchId('')
      } else {
        await matchService.createMatch({
          ...matchData,
          status: MATCH_STATUS.scheduled,
        })
        toast.success(t('admin.scheduler.matchScheduled') || 'Match scheduled successfully')
      }

      await fetchData()
      resetForm()
    } catch (err) {
      toast.error((t('admin.scheduler.failedSchedule') || 'Failed to save match: ') + err.message)
    }
  }

  const onInvalid = () => {
    toast.error(t('admin.scheduler.fixValidationErrors') || 'Please fix the errors before scheduling')
  }

  if (loading) {
      return <SectionLoader message={t('admin.scheduler.loadingScheduler')} />
  }

  return (
    <div className="flex min-h-screen flex-col p-6 md:p-8 lg:h-[calc(100dvh-5rem)] lg:min-h-[660px] lg:overflow-hidden xl:p-10">
      <header className="mb-6 shrink-0">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tighter text-on-background mb-2">{t('admin.scheduler.matchScheduler')}</h1>
        <p className="text-on-surface-variant leading-relaxed max-w-2xl">{t('admin.scheduler.schedulerDescription')}</p>
      </header>

      <div className="grid flex-1 grid-cols-1 gap-6 lg:min-h-0 lg:overflow-hidden lg:grid-cols-12">
        {/* Create Form */}
        <section ref={formRef} className="lg:col-span-5 bg-surface-container-low rounded-[1.5rem] p-5 space-y-5 self-start">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold tracking-tight">
                {editingMatch ? t('admin.scheduler.editFixture') || 'Edit Fixture' : t('admin.scheduler.createFixture')}
              </h3>
              {editingMatch && (
                <p className="mt-1 text-xs font-semibold text-on-surface-variant">
                  {t('admin.scheduler.editingMatch') || 'Editing match'} #{editingMatch.match_number}
                </p>
              )}
            </div>
            <Badge status={editingMatch ? getMatchScoreStatus(editingMatch) : MATCH_STATUS.scheduled}>
              {editingMatch ? t('common.edit') || 'Edit' : t('admin.scheduler.new')}
            </Badge>
          </div>
          <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className={FIELD_LABEL_CLASS}>{t('admin.scheduler.teamA')} *</label>
                <select
                  {...register('team_a_id')}
                  className={`${SELECT_FIELD_CLASS} ${errors.team_a_id ? 'ring-2 ring-error' : ''}`}
                >
                  <option value="">{t('admin.scheduler.selectTeam')}</option>
                  {teams.filter((team) => String(team.id) !== String(teamBId)).map((team) => <option key={team.id} value={team.id}>{team.team_name}</option>)}
                </select>
                {errors.team_a_id && <p className="text-xs text-error pl-1">{errors.team_a_id.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className={FIELD_LABEL_CLASS}>{t('admin.scheduler.teamB')} *</label>
                <select
                  {...register('team_b_id')}
                  className={`${SELECT_FIELD_CLASS} ${errors.team_b_id ? 'ring-2 ring-error' : ''}`}
                >
                  <option value="">{t('admin.scheduler.selectTeam')}</option>
                  {teams.filter((team) => String(team.id) !== String(teamAId)).map((team) => <option key={team.id} value={team.id}>{team.team_name}</option>)}
                </select>
                {errors.team_b_id && <p className="text-xs text-error pl-1">{errors.team_b_id.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className={FIELD_LABEL_CLASS}>{t('admin.scheduler.date')} *</label>
                <input type="date" {...register('date')} className={`${FIELD_CLASS} ${errors.date ? 'ring-2 ring-error' : ''}`} />
                {errors.date && <p className="text-xs text-error pl-1">{errors.date.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className={FIELD_LABEL_CLASS}>{t('admin.scheduler.time')} *</label>
                <input type="time" {...register('time')} className={`${FIELD_CLASS} ${errors.time ? 'ring-2 ring-error' : ''}`} />
                {errors.time && <p className="text-xs text-error pl-1">{errors.time.message}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className={FIELD_LABEL_CLASS}>{t('admin.scheduler.venue')} *</label>
              <select
                {...register('venue')}
                className={`${SELECT_FIELD_CLASS} ${errors.venue ? 'ring-2 ring-error' : ''}`}
              >
                <option value="">{t('admin.scheduler.selectVenue') || 'Select venue'}</option>
                <option value={t('admin.scheduler.venueOptions.mainPitch')}>{t('admin.scheduler.venueOptions.mainPitch')}</option>
                <option value={t('admin.scheduler.venueOptions.turf2')}>{t('admin.scheduler.venueOptions.turf2')}</option>
                <option value={t('admin.scheduler.venueOptions.groundB')}>{t('admin.scheduler.venueOptions.groundB')}</option>
              </select>
              {errors.venue && <p className="text-xs text-error pl-1">{errors.venue.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className={FIELD_LABEL_CLASS}>{t('admin.scheduler.notes')}</label>
              <textarea {...register('notes')} rows="2" className={`${FIELD_CLASS} resize-y`} />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              {editingMatch ? (
                <Button type="button" variant="ghost" className="sm:flex-1" onClick={cancelEditing}>
                  {t('admin.scores.cancelEdit') || 'Cancel Edit'}
                </Button>
              ) : (
                <Button type="button" variant="ghost" disabled={!isDirty} className="sm:flex-1" onClick={resetForm}>
                  {t('common.discard')}
                </Button>
              )}
              <Button type="submit" className="sm:flex-1">
                {editingMatch ? t('admin.scheduler.updateMatch') || 'Update Match' : t('admin.scheduler.scheduleMatch')}
              </Button>
            </div>
          </form>
        </section>

        {/* Matches List */}
        <section className="lg:col-span-7 flex min-h-0 flex-col rounded-[1.5rem] bg-surface-container-low/60 p-4">
          <div className="mb-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold tracking-tight">
                  {t('admin.scheduler.scheduledMatches')} ({filteredMatches.length}/{matches.length})
                </h3>
                <p className="mt-1 text-xs font-semibold text-on-surface-variant">{t('admin.scheduler.inlineScrollHint')}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowSchedulerFilters((isVisible) => !isVisible)}
                className="inline-flex items-center gap-1 rounded-full border border-outline-variant/20 bg-surface-container-lowest px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-on-surface-variant transition hover:bg-surface-container-low"
              >
                <span className="material-symbols-outlined text-[14px]">filter_alt</span>
                {t('common.filter')}
              </button>
            </div>

            {showSchedulerFilters && (
              <div className="grid gap-2 rounded-[1.1rem] border border-outline-variant/20 bg-surface-container-lowest/70 p-3 sm:grid-cols-2 xl:grid-cols-3">
                <input
                  type="date"
                  aria-label={t('common.date')}
                  value={schedulerFilters.date}
                  onChange={(event) => updateSchedulerFilter('date', event.target.value)}
                  className={FILTER_FIELD_CLASS}
                />
                <input
                  type="time"
                  aria-label={t('common.time')}
                  value={schedulerFilters.time}
                  onChange={(event) => updateSchedulerFilter('time', event.target.value)}
                  className={FILTER_FIELD_CLASS}
                />
                <select
                  aria-label={t('common.match')}
                  value={schedulerFilters.matchId}
                  onChange={(event) => updateSchedulerFilter('matchId', event.target.value)}
                  className={FILTER_FIELD_CLASS}
                >
                  <option value="">{t('admin.filters.allMatches')}</option>
                  {matches.map((match) => (
                    <option key={match.id} value={String(match.id)}>
                      {t('common.match')} #{match.match_number}
                    </option>
                  ))}
                </select>
                <select
                  aria-label={t('common.team')}
                  value={schedulerFilters.teamId}
                  onChange={(event) => updateSchedulerFilter('teamId', event.target.value)}
                  className={FILTER_FIELD_CLASS}
                >
                  <option value="">{t('admin.filters.allTeams')}</option>
                  {schedulerTeamOptions.map((team) => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
                <select
                  aria-label={t('common.status')}
                  value={schedulerFilters.status}
                  onChange={(event) => updateSchedulerFilter('status', event.target.value)}
                  className={FILTER_FIELD_CLASS}
                >
                  <option value="">{t('admin.filters.allStatuses')}</option>
                  <option value={INCOMPLETE_STATUS_FILTER}>{t('admin.filters.incompleteScores')}</option>
                  <option value="scheduled">{t('common.scheduled')}</option>
                  <option value="completed">{t('common.completed')}</option>
                  <option value="pending">{t('common.pendingScore')}</option>
                </select>
                <button
                  type="button"
                  onClick={() => setSchedulerFilters(SCHEDULER_FILTER_DEFAULTS)}
                  className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-on-surface-variant transition hover:bg-surface-container-low"
                >
                  {t('common.resetFilters')}
                </button>
              </div>
            )}
          </div>
          <div className="max-h-[460px] min-h-0 flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar lg:max-h-none">
            {paginatedMatches.length > 0 ? (
              paginatedMatches.map(match => (
                <div key={match.id} className="group bg-surface-container-lowest p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-surface-container-low transition-all">
                  <div className="flex items-center gap-4">
                    <div className="text-center w-12">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t('common.match')}</p>
                      <p className="text-lg font-black">#{match.match_number}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-on-surface">{match.team_a?.team_name}</span>
                        <span className="text-xs font-medium text-outline-variant">vs</span>
                        <span className="font-bold text-on-surface">{match.team_b?.team_name}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-on-surface-variant">
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">calendar_today</span>{new Date(match.scheduled_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">schedule</span>{new Date(match.scheduled_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">location_on</span>{match.venue}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditMatch(match)}
                      className="inline-flex items-center gap-1 rounded-full border border-primary/15 bg-primary/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-primary transition hover:bg-primary/15"
                    >
                      <span className="material-symbols-outlined text-[14px]">edit</span>
                      {t('common.edit')}
                    </button>
                    <Badge status={getMatchScoreStatus(match)}>{getStatusLabel(match, t)}</Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl bg-surface-container-lowest p-8 text-center">
                <span className="material-symbols-outlined text-3xl text-outline">filter_alt_off</span>
                <h3 className="mt-2 text-base font-bold text-on-surface">{t('common.noResults')}</h3>
                <p className="mt-1 text-sm text-on-surface-variant">{t('admin.filters.noFilteredMatches')}</p>
              </div>
            )}
          </div>
          <PaginationControls
            page={schedulerPage}
            totalPages={schedulerTotalPages}
            totalItems={filteredMatches.length}
            pageSize={SCHEDULER_PAGE_SIZE}
            onPrevious={() => setSchedulerPage((page) => Math.max(1, page - 1))}
            onNext={() => setSchedulerPage((page) => Math.min(schedulerTotalPages, page + 1))}
            t={t}
          />
        </section>
      </div>
    </div>
  )
}
