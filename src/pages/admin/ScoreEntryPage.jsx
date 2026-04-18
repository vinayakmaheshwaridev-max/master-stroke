import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { matchService } from '../../services/matchService'
import { notificationService } from '../../services/notificationService'
import { useTranslation } from '../../i18n'
import { Button, Select, useToast } from '../../components/ui'
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

const DEFAULT_FORM_VALUES = {
  runs_a: '',
  wickets_a: '',
  overs_a: '',
  runs_b: '',
  wickets_b: '',
  overs_b: '',
  result: '',
  man_of_match: '',
  summary: '',
}

const FIELD_LABEL_CLASS = 'text-[10px] font-black uppercase tracking-[0.14em] text-[#625a4c]'
const NUMERIC_INPUT_CLASS =
  'w-full rounded-[0.9rem] border border-[#e9e1d4] bg-white px-3 py-2 text-base font-bold leading-none tracking-[-0.02em] text-on-surface outline-none transition placeholder:text-on-surface/40 focus:border-[#6d995c] focus:ring-4 focus:ring-[#2d7a43]/10'
const DETAIL_INPUT_CLASS =
  'w-full rounded-[0.9rem] border border-[#ece4d7] bg-[#f7f2e7] px-3 py-2 text-xs font-medium text-on-surface outline-none transition placeholder:text-on-surface/40 focus:border-[#6d995c] focus:ring-4 focus:ring-[#2d7a43]/10'
const FILTER_FIELD_CLASS =
  'w-full rounded-xl border border-[#e7ddcc] bg-white px-3 py-2 text-xs font-semibold text-on-surface outline-none transition focus:border-[#6d995c] focus:ring-4 focus:ring-[#2d7a43]/10'
const SCORE_RECORDS_PAGE_SIZE = 5
const SCORE_FILTER_DEFAULTS = {
  date: '',
  time: '',
  matchId: '',
  teamId: '',
  status: INCOMPLETE_STATUS_FILTER,
}

const pageBackgroundStyle = {
  backgroundImage: [
    'radial-gradient(circle at 18% 8%, rgba(240, 226, 190, 0.8), transparent 28%)',
    'radial-gradient(circle at 72% 14%, rgba(214, 234, 196, 0.42), transparent 26%)',
    'radial-gradient(circle at 78% 78%, rgba(240, 230, 202, 0.28), transparent 34%)',
    'linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(249, 245, 237, 0.98) 100%)',
  ].join(', '),
}

const entryPanelStyle = {
  backgroundImage: [
    'radial-gradient(circle at top left, rgba(240, 226, 190, 0.48), transparent 34%)',
    'radial-gradient(circle at 82% 12%, rgba(214, 234, 196, 0.22), transparent 24%)',
    'linear-gradient(180deg, rgba(248, 243, 233, 0.9) 0%, rgba(246, 240, 229, 0.88) 100%)',
  ].join(', '),
}

const detailPanelStyle = {
  backgroundImage: [
    'radial-gradient(circle at 20% 0%, rgba(246, 238, 220, 0.6), transparent 36%)',
    'linear-gradient(180deg, rgba(255, 255, 255, 0.94) 0%, rgba(252, 250, 245, 0.94) 100%)',
  ].join(', '),
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

  if (filters.date && getDateInputValue(match.scheduled_at) !== filters.date) return false
  if (filters.time && getTimeInputValue(match.scheduled_at) !== filters.time) return false
  if (filters.matchId && String(match.id) !== filters.matchId) return false
  if (filters.teamId && !matchHasTeam(match, filters.teamId)) return false
  if (filters.status === INCOMPLETE_STATUS_FILTER && !isIncompleteScoreStatus(displayStatus)) return false
  if (filters.status && filters.status !== INCOMPLETE_STATUS_FILTER && displayStatus !== filters.status) return false
  return true
}

function getPageItems(items, page, pageSize) {
  const startIndex = (page - 1) * pageSize
  return items.slice(startIndex, startIndex + pageSize)
}

const preprocessNumber = (schema) =>
  z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
    schema
  )

const overRefine = (val) => {
  if (val === undefined || val === null) return true
  const decimal = parseFloat((val % 1).toFixed(1))
  return decimal >= 0 && decimal <= 0.5
}

const overMessage = 'Balls must be between .0 and .5'

const scoreEntrySchema = z.object({
  runs_a: preprocessNumber(
    z.number({ required_error: 'Runs is required', invalid_type_error: 'Runs must be a number' }).int('Runs must be a whole number').min(0, 'Runs cannot be negative')
  ),
  wickets_a: preprocessNumber(
    z.number({ required_error: 'Wickets is required', invalid_type_error: 'Wickets must be a number' }).int('Wickets must be a whole number').min(0, 'Minimum 0 wickets').max(10, 'Maximum 10 wickets')
  ),
  overs_a: preprocessNumber(
    z.number({ required_error: 'Overs is required', invalid_type_error: 'Overs must be a number' }).min(0, 'Overs cannot be negative').max(50, 'Maximum 50 overs').refine(overRefine, overMessage)
  ),
  runs_b: preprocessNumber(
    z.number({ required_error: 'Runs is required', invalid_type_error: 'Runs must be a number' }).int('Runs must be a whole number').min(0, 'Runs cannot be negative')
  ),
  wickets_b: preprocessNumber(
    z.number({ required_error: 'Wickets is required', invalid_type_error: 'Wickets must be a number' }).int('Wickets must be a whole number').min(0, 'Minimum 0 wickets').max(10, 'Maximum 10 wickets')
  ),
  overs_b: preprocessNumber(
    z.number({ required_error: 'Overs is required', invalid_type_error: 'Overs must be a number' }).min(0, 'Overs cannot be negative').max(50, 'Maximum 50 overs').refine(overRefine, overMessage)
  ),
  result: z.enum(['team_a', 'team_b', 'tie', 'no_result'], { required_error: 'Please select a match verdict', invalid_type_error: 'Please select a match verdict' }),
  man_of_match: z.string().min(1, 'Man of the Match is required').max(100, 'Name must be 100 characters or less'),
  summary: z.string().min(1, 'Match summary is required').max(500, 'Summary must be 500 characters or less'),
}).superRefine((data, ctx) => {
  if (data.result !== 'no_result' && data.overs_a === 0 && data.overs_b === 0) {
    ctx.addIssue({
      path: ['result'],
      code: z.ZodIssueCode.custom,
      message: 'Matches with a valid result must have at least some overs played.',
    })
  }

  if (data.result === 'team_a' && data.runs_a <= data.runs_b) {
    ctx.addIssue({
      path: ['result'],
      code: z.ZodIssueCode.custom,
      message: 'Team A must score more runs than Team B to win.',
    })
  }

  if (data.result === 'team_b' && data.runs_b <= data.runs_a) {
    ctx.addIssue({
      path: ['result'],
      code: z.ZodIssueCode.custom,
      message: 'Team B must score more runs than Team A to win.',
    })
  }

  if (data.result === 'tie' && data.runs_a !== data.runs_b) {
    ctx.addIssue({
      path: ['result'],
      code: z.ZodIssueCode.custom,
      message: 'A tie requires both teams to have exactly equal runs.',
    })
  }
})

function getFieldClass(hasError) {
  return `${NUMERIC_INPUT_CLASS} ${hasError ? 'border-error ring-2 ring-error/60' : ''}`
}

function getDetailFieldClass(hasError) {
  return `${DETAIL_INPUT_CLASS} ${hasError ? 'border-error ring-2 ring-error/60' : ''}`
}

function formatOversValue(value) {
  if (value === null || value === undefined || value === '') return '-'

  const numericValue = Number(value)
  if (Number.isNaN(numericValue)) return String(value)

  return Number.isInteger(numericValue) ? String(numericValue) : numericValue.toFixed(1)
}

function formatInningsScore(runs, wickets, overs) {
  if (runs === null || runs === undefined) return '-'
  return `${runs}/${wickets ?? '-'} (${formatOversValue(overs)})`
}

function formatScoreSummary(match, teamAName, teamBName) {
  return `${teamAName} ${formatInningsScore(match.runs_a, match.wickets_a, match.overs_a)} | ${teamBName} ${formatInningsScore(match.runs_b, match.wickets_b, match.overs_b)}`
}

function formatMatchDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatMatchTime(value) {
  if (!value) return '-'
  return new Date(value).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getStatusLabel(status, t) {
  const labels = {
    [MATCH_STATUS.completed]: t('common.completed'),
    [MATCH_STATUS.scheduled]: t('common.scheduled'),
    [MATCH_STATUS.pending]: t('common.pendingScore'),
  }

  return labels[status] || status
}

function getFormValues(match) {
  if (!match) return DEFAULT_FORM_VALUES

  return {
    runs_a: match.runs_a ?? '',
    wickets_a: match.wickets_a ?? '',
    overs_a: match.overs_a ?? '',
    runs_b: match.runs_b ?? '',
    wickets_b: match.wickets_b ?? '',
    overs_b: match.overs_b ?? '',
    result: match.result ?? '',
    man_of_match: match.man_of_match ?? '',
    summary: match.summary ?? '',
  }
}

function TeamScoreBlock({
  icon,
  teamName,
  prefix,
  register,
  errors,
  t,
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ece4d4] bg-white shadow-[0_8px_16px_rgba(62,52,33,0.08)]">
          <span className="material-symbols-outlined text-[17px] text-[#66875f]">{icon}</span>
        </div>
        <h2 className="text-[1.1rem] font-black tracking-[-0.03em] text-[#171717] md:text-[1.2rem]">{teamName}</h2>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="space-y-1.5">
          <label className={FIELD_LABEL_CLASS}>{t('admin.scores.runs')} *</label>
          <input
            type="number"
            placeholder={t('admin.scores.placeholderRuns')}
            {...register(`runs_${prefix}`)}
            className={getFieldClass(Boolean(errors[`runs_${prefix}`]))}
          />
          {errors[`runs_${prefix}`] && <p className="text-[11px] font-medium text-error">{errors[`runs_${prefix}`].message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className={FIELD_LABEL_CLASS}>{t('admin.scores.wickets')} *</label>
          <input
            type="number"
            placeholder={t('admin.scores.placeholderWickets')}
            {...register(`wickets_${prefix}`)}
            className={getFieldClass(Boolean(errors[`wickets_${prefix}`]))}
          />
          {errors[`wickets_${prefix}`] && <p className="text-[11px] font-medium text-error">{errors[`wickets_${prefix}`].message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className={FIELD_LABEL_CLASS}>{t('admin.scores.overs')} *</label>
          <input
            type="number"
            step="0.1"
            placeholder={t('admin.scores.placeholderOvers')}
            {...register(`overs_${prefix}`)}
            className={getFieldClass(Boolean(errors[`overs_${prefix}`]))}
          />
          {errors[`overs_${prefix}`] && <p className="text-[11px] font-medium text-error">{errors[`overs_${prefix}`].message}</p>}
        </div>
      </div>
    </section>
  )
}

function RecentScoreCard({ match, onEdit, t }) {
  const teamAName = match.team_a?.team_name || t('admin.scores.teamA') || 'Team A'
  const teamBName = match.team_b?.team_name || t('admin.scores.teamB') || 'Team B'
  const displayStatus = getMatchScoreStatus(match)
  const canEdit = displayStatus === MATCH_STATUS.completed
  const statusClasses = {
    [MATCH_STATUS.completed]: 'bg-[#d7f5cc] text-[#347a40]',
    [MATCH_STATUS.pending]: 'bg-[#fff1c9] text-[#8a5a00]',
    [MATCH_STATUS.scheduled]: 'bg-[#ece7d8] text-[#6a624f]',
  }[displayStatus]

  return (
    <article className="rounded-[1.25rem] border border-white/80 bg-white/90 p-3 shadow-[0_14px_28px_rgba(62,52,33,0.07)] backdrop-blur-sm md:p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
          <div className="min-w-[56px] text-left sm:text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#5f5b4e]">{t('common.match')}</p>
            <p className="mt-0.5 text-[1.35rem] font-black leading-none tracking-[-0.04em] text-[#151515]">#{match.match_number}</p>
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-1.5 text-sm font-black leading-tight tracking-[-0.02em] text-[#171717] md:text-base">
              <span>{teamAName}</span>
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface/35">vs</span>
              <span>{teamBName}</span>
            </div>

            {canEdit ? (
              <p className="text-[12px] font-semibold text-on-surface/80">
                {formatScoreSummary(match, teamAName, teamBName)}
              </p>
            ) : (
              <p className="text-[12px] font-semibold text-on-surface/55">
                {t('admin.scores.awaitingResult') || 'Awaiting score entry'}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-semibold text-on-surface/70 md:text-[12px]">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                {formatMatchDate(match.scheduled_at)}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">schedule</span>
                {formatMatchTime(match.scheduled_at)}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">location_on</span>
                {match.venue || '-'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start">
          {canEdit && (
            <button
              type="button"
              onClick={() => onEdit(match)}
              className="inline-flex items-center gap-1 rounded-full border border-[#dfe8da] bg-[#f6faf4] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.11em] text-[#2f7a42] transition hover:border-[#c6d9bf] hover:bg-[#edf6e9]"
            >
              <span className="material-symbols-outlined text-[13px]">edit</span>
              {t('common.edit') || 'Edit'}
            </button>
          )}
          <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.13em] ${statusClasses}`}>
            {getStatusLabel(displayStatus, t)}
          </span>
        </div>
      </div>
    </article>
  )
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
    <div className="flex flex-col gap-2 border-t border-[#ddd3c4] px-2 pt-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-on-surface/55">
        {t('common.showing')} {startItem}-{endItem} {t('common.of')} {totalItems}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={onPrevious}
          className="rounded-full border border-[#ded7c8] bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-[#5f5b4e] transition hover:bg-[#f8f2e7] disabled:cursor-not-allowed disabled:opacity-45"
        >
          {t('common.previous')}
        </button>
        <span className="text-[11px] font-black text-on-surface/60">
          {page}/{totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={onNext}
          className="rounded-full border border-[#ded7c8] bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-[#5f5b4e] transition hover:bg-[#f8f2e7] disabled:cursor-not-allowed disabled:opacity-45"
        >
          {t('common.next')}
        </button>
      </div>
    </div>
  )
}

export default function ScoreEntryPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { toast } = useToast()
  const formRef = useRef(null)
  const [allMatches, setAllMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMatchId, setSelectedMatchId] = useState('')
  const [editingMatchId, setEditingMatchId] = useState('')
  const [showScoreFilters, setShowScoreFilters] = useState(false)
  const [scoreFilters, setScoreFilters] = useState(SCORE_FILTER_DEFAULTS)
  const [scoreRecordsPage, setScoreRecordsPage] = useState(1)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(scoreEntrySchema),
    defaultValues: DEFAULT_FORM_VALUES,
  })

  const loadMatches = useCallback(async () => {
    try {
      try {
        await matchService.markPastScheduledMatchesPending(getTodayStartDateTimeValue())
      } catch (statusErr) {
        console.warn('Unable to sync pending match statuses:', statusErr)
      }

      const data = await matchService.getMatches()
      setAllMatches(data)
      return data
    } catch (err) {
      console.error('Error fetching matches:', err)
      toast('Failed to load matches', 'error')
      return []
    } finally {
      setLoading(false)
    }
  }, [toast])

  const scoreableMatches = useMemo(
    () => allMatches.filter((match) => isIncompleteScoreStatus(getMatchScoreStatus(match))),
    [allMatches]
  )

  const allMatchRecords = useMemo(
    () =>
      [...allMatches].sort((a, b) => {
        const left = new Date(b.updated_at || b.scheduled_at || 0).getTime()
        const right = new Date(a.updated_at || a.scheduled_at || 0).getTime()
        return left - right
      }),
    [allMatches]
  )

  const selectedMatch = useMemo(
    () => scoreableMatches.find((match) => String(match.id) === selectedMatchId) || null,
    [scoreableMatches, selectedMatchId]
  )

  const editingMatch = useMemo(
    () => allMatches.find((match) => String(match.id) === editingMatchId) || null,
    [allMatches, editingMatchId]
  )

  const activeMatch = editingMatch || selectedMatch
  const activeSelectValue = editingMatch ? String(editingMatch.id) : selectedMatchId
  const selectableMatches = useMemo(() => {
    if (!editingMatch) return scoreableMatches

    return [
      editingMatch,
      ...scoreableMatches.filter((match) => String(match.id) !== String(editingMatch.id)),
    ]
  }, [editingMatch, scoreableMatches])

  const selectedResult = watch('result')

  const scoreTeamOptions = useMemo(
    () => getUniqueTeamsFromMatches(allMatches),
    [allMatches]
  )

  const filteredScoreRecords = useMemo(
    () => allMatchRecords.filter((match) => matchPassesFilters(match, scoreFilters)),
    [allMatchRecords, scoreFilters]
  )

  const scoreRecordsTotalPages = Math.max(1, Math.ceil(filteredScoreRecords.length / SCORE_RECORDS_PAGE_SIZE))
  const paginatedScoreRecords = useMemo(
    () => getPageItems(filteredScoreRecords, scoreRecordsPage, SCORE_RECORDS_PAGE_SIZE),
    [filteredScoreRecords, scoreRecordsPage]
  )

  useEffect(() => {
    loadMatches()
  }, [loadMatches])

  useEffect(() => {
    if (scoreableMatches.length === 0) {
      setSelectedMatchId('')
      return
    }

    const hasSelectedMatch = scoreableMatches.some((match) => String(match.id) === selectedMatchId)

    if (!hasSelectedMatch) {
      setSelectedMatchId(String(scoreableMatches[0].id))
    }
  }, [scoreableMatches, selectedMatchId])

  useEffect(() => {
    if (editingMatch) {
      reset(getFormValues(editingMatch))
      return
    }

    reset(DEFAULT_FORM_VALUES)
  }, [editingMatch, selectedMatchId, reset])

  useEffect(() => {
    setScoreRecordsPage(1)
  }, [scoreFilters])

  useEffect(() => {
    if (scoreRecordsPage > scoreRecordsTotalPages) {
      setScoreRecordsPage(scoreRecordsTotalPages)
    }
  }, [scoreRecordsPage, scoreRecordsTotalPages])

  const handleEditRecentScore = (match) => {
    setEditingMatchId(String(match.id))
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const cancelEditing = () => {
    setEditingMatchId('')
    reset(DEFAULT_FORM_VALUES)
  }

  const updateScoreFilter = (key, value) => {
    setScoreFilters((currentFilters) => ({
      ...currentFilters,
      [key]: value,
    }))
  }

  const onSubmit = async (data) => {
    if (!activeMatch) {
      toast(t('admin.scores.noScoreEntry') || 'No scheduled matches left for score entry.', 'warning')
      return
    }

    try {
      const scoreData = {
        runs_a: data.runs_a,
        wickets_a: data.wickets_a,
        overs_a: data.overs_a,
        runs_b: data.runs_b,
        wickets_b: data.wickets_b,
        overs_b: data.overs_b,
        result: data.result,
        man_of_match: data.man_of_match,
        summary: data.summary,
      }

      await matchService.updateScore(activeMatch.id, scoreData)

      try {
        await notificationService.sendNotification(
          `Final Result: ${activeMatch.team_a?.team_name} vs ${activeMatch.team_b?.team_name} - ${data.summary}`,
          'result'
        )
      } catch (notifErr) {
        console.warn('Notification failed (non-critical):', notifErr)
      }

      if (editingMatch) {
        toast(t('admin.scores.resultUpdated') || 'Result updated successfully!', 'success')
        await loadMatches()
        setEditingMatchId('')
        return
      }

      toast(t('admin.scores.resultPublished'), 'success')
      navigate('/admin/tournament')
    } catch (err) {
      toast(t('admin.scores.failedPublish') + err.message, 'error')
    }
  }

  const onInvalid = () => {
    toast(t('admin.scores.fixValidationErrors') || 'Please fix the highlighted errors before publishing', 'error')
  }

  if (loading) {
    return <SectionLoader message={t('admin.scores.loadingMatches')} />
  }

  const noMatches = scoreableMatches.length === 0 && !editingMatch
  const teamAName = activeMatch?.team_a?.team_name || t('admin.scores.teamA') || 'Team A'
  const teamBName = activeMatch?.team_b?.team_name || t('admin.scores.teamB') || 'Team B'
  const verdictOptions = [
    { value: 'team_a', label: t('admin.scores.teamWon', { team: teamAName }) },
    { value: 'team_b', label: t('admin.scores.teamWon', { team: teamBName }) },
    { value: 'tie', label: t('admin.scores.tieMatch') },
    { value: 'no_result', label: t('admin.scores.noResult') },
  ]
  const publishLabel = editingMatch
    ? t('admin.scores.updateResult') || 'Update Result'
    : t('admin.scores.publishResult')

  return (
    <div className="relative overflow-hidden px-4 py-6 md:px-8 xl:px-10" style={pageBackgroundStyle}>
      <div className="relative flex h-[calc(100dvh-5rem)] min-h-[660px] flex-col gap-4 overflow-hidden">
        <header className="space-y-2 px-1">
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#5f5b4e]">
            {t('admin.scores.tournamentAdminLabel')}
          </span>
          <h1 className="text-[1.55rem] font-black tracking-[-0.04em] text-[#101010] md:text-[1.75rem]">
            {t('admin.scores.scoreResultEntry')}
          </h1>
        </header>

        <div className="relative min-h-0 flex-1 overflow-hidden">
          {noMatches && (
            <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[2rem]">
              <div className="absolute inset-0 rounded-[2rem] bg-white/50 backdrop-blur-sm" />
              <div className="relative z-10 flex max-w-sm flex-col items-center gap-4 rounded-[2rem] border border-white/80 bg-white/92 px-8 py-10 text-center shadow-[0_22px_40px_rgba(62,52,33,0.12)]">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f1eadb] text-[#56724f]">
                  <span className="material-symbols-outlined text-[2rem]">sports_cricket</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black tracking-tight text-on-surface">
                    {t('admin.scores.noMatchAvailable') || 'No Match Available'}
                  </h3>
                  <p className="text-sm font-medium text-on-surface/70">
                    {t('admin.scores.noMatchDescription') || 'Schedule matches first to start entering scores and results.'}
                  </p>
                </div>
                <Button variant="ghost" onClick={() => navigate('/admin/scheduler')}>
                  <span className="material-symbols-outlined text-sm">calendar_month</span>
                  {t('admin.scores.goToScheduler') || 'Go to Scheduler'}
                </Button>
              </div>
            </div>
          )}

          <div className={`grid h-full min-h-0 gap-4 xl:grid-cols-[minmax(0,1.12fr)_minmax(340px,0.88fr)] ${noMatches ? 'pointer-events-none select-none opacity-40' : ''}`}>
            <form
              ref={formRef}
              onSubmit={handleSubmit(onSubmit, onInvalid)}
              noValidate
              className="h-full min-h-0 space-y-4 overflow-hidden"
            >
              <section
                className="rounded-[1.5rem] border border-white/70 px-4 py-4 shadow-[0_18px_36px_rgba(62,52,33,0.09)] backdrop-blur-[2px] md:px-5 md:py-5"
                style={entryPanelStyle}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                      <h2 className="text-[1.15rem] font-black tracking-[-0.03em] text-[#131313] md:text-[1.25rem]">
                        {editingMatch ? t('admin.scores.editScore') || 'Edit Score' : t('admin.scores.enterScore') || 'Enter Score'}
                      </h2>
                      {editingMatch && (
                        <p className="text-[11px] font-semibold text-on-surface/65">
                          {t('admin.scores.editingMatch') || 'Editing recent result'} #{editingMatch.match_number}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {editingMatch ? (
                        <Button
                          type="button"
                          variant="ghost"
                          className="rounded-full px-2 py-1.5 text-xs font-semibold text-[#2d2d2d] hover:bg-transparent hover:text-[#171717]"
                          onClick={cancelEditing}
                        >
                          {t('admin.scores.cancelEdit') || 'Cancel Edit'}
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          disabled={!isDirty}
                          className="rounded-full px-2 py-1.5 text-xs font-semibold text-[#2d2d2d] hover:bg-transparent hover:text-[#171717]"
                          onClick={() => reset(DEFAULT_FORM_VALUES)}
                        >
                          {t('common.discard')}
                        </Button>
                      )}
                      <Button
                        type="button"
                        disabled={noMatches}
                        className="rounded-[0.8rem] !border-transparent !bg-[#2f7a42] px-4 py-2 !text-xs !text-white shadow-[0_10px_20px_rgba(43,123,67,0.2)] hover:!bg-[#28693a]"
                        onClick={() => {
                          if (formRef.current) {
                            formRef.current.requestSubmit()
                          } else {
                            toast(t('admin.scores.selectVerdict'), 'warning')
                          }
                        }}
                      >
                        {publishLabel}
                      </Button>
                    </div>
                  </div>

                  <div className="max-w-xl">
                    <Select
                      label={t('admin.scores.selectMatch')}
                      value={activeSelectValue}
                      onChange={(event) => {
                        setEditingMatchId('')
                        setSelectedMatchId(event.target.value)
                      }}
                      disabled={noMatches}
                      className="rounded-full border border-[#6f945e] bg-[#d7efc9] py-2 pl-3 pr-8 text-xs font-bold text-[#23331f] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] focus:ring-[#2d7a43]/20"
                    >
                      {selectableMatches.length > 0 ? (
                        selectableMatches.map((match) => (
                          <option key={match.id} value={String(match.id)}>
                            {t('common.match')} #{match.match_number}: {match.team_a?.team_name} vs {match.team_b?.team_name}{' '}
                            {editingMatch && String(match.id) === String(editingMatch.id) ? `(${t('common.edit') || 'Edit'})` : ''}
                          </option>
                        ))
                      ) : (
                        <option value="">{t('admin.scores.noScheduledMatches')}</option>
                      )}
                    </Select>
                  </div>

                  <div className="h-px w-full bg-[#ddd3c4]" />

                  <div className="space-y-4">
                    <TeamScoreBlock
                      icon="radio_button_unchecked"
                      teamName={teamAName}
                      prefix="a"
                      register={register}
                      errors={errors}
                      t={t}
                    />

                    <TeamScoreBlock
                      icon="sports_cricket"
                      teamName={teamBName}
                      prefix="b"
                      register={register}
                      errors={errors}
                      t={t}
                    />
                  </div>

                  <div className="h-px w-full bg-[#ddd3c4]" />

                  <div className="space-y-2.5">
                    <p className={FIELD_LABEL_CLASS}>{t('admin.scores.matchVerdict')} *</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {verdictOptions.map((option) => {
                        const isSelected = selectedResult === option.value

                        return (
                          <label
                            key={option.value}
                            className={`flex cursor-pointer items-center gap-2 text-sm font-bold tracking-tight text-[#1a1a1a] transition ${
                              isSelected
                                ? 'text-[#215631]'
                                : 'text-[#232323] hover:text-[#1a1a1a]'
                            }`}
                          >
                            <input
                              type="radio"
                              value={option.value}
                              {...register('result')}
                              className="h-4 w-4 accent-[#2f7a42]"
                            />
                            <span>{option.label}</span>
                          </label>
                        )
                      })}
                    </div>
                    {errors.result && <p className="text-[11px] font-medium text-error">{errors.result.message}</p>}
                  </div>
                </div>
              </section>

              <section
                className="rounded-[1.5rem] border border-white/80 px-4 py-4 shadow-[0_16px_32px_rgba(62,52,33,0.07)] backdrop-blur-sm md:px-5 md:py-5"
                style={detailPanelStyle}
              >
                <div className="space-y-3">
                  <h2 className="text-[1.15rem] font-black tracking-[-0.03em] text-[#151515] md:text-[1.25rem]">
                    {t('admin.scores.finalAssessment')}
                  </h2>

                  <div className="space-y-1.5">
                    <label className={FIELD_LABEL_CLASS}>{t('admin.scores.manOfMatch')} *</label>
                    <input
                      type="text"
                      placeholder={t('admin.scores.placeholderPlayer')}
                      {...register('man_of_match')}
                      className={getDetailFieldClass(Boolean(errors.man_of_match))}
                    />
                    {errors.man_of_match && <p className="text-[11px] font-medium text-error">{errors.man_of_match.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className={FIELD_LABEL_CLASS}>{t('admin.scores.matchSummary')} *</label>
                    <textarea
                      rows="3"
                      placeholder={t('admin.scores.placeholderSummary')}
                      {...register('summary')}
                      className={`${getDetailFieldClass(Boolean(errors.summary))} min-h-20 resize-y leading-relaxed`}
                    />
                    {errors.summary && <p className="text-[11px] font-medium text-error">{errors.summary.message}</p>}
                  </div>
                </div>
              </section>
            </form>

            <aside className="flex h-full min-h-0 flex-col overflow-hidden rounded-[1.5rem] border border-white/70 bg-[rgba(255,255,255,0.58)] p-3 shadow-[0_18px_36px_rgba(62,52,33,0.07)] backdrop-blur-[2px]">
              <div className="px-2 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h2 className="text-[1.1rem] font-black tracking-[-0.03em] text-[#151515] md:text-[1.2rem]">
                      {t('admin.scores.matchRecords')} ({filteredScoreRecords.length}/{allMatchRecords.length})
                    </h2>
                    <p className="text-[11px] font-semibold text-on-surface/60">
                      {t('admin.scores.recordsHint')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowScoreFilters((isVisible) => !isVisible)}
                    className="inline-flex items-center gap-1 rounded-full border border-[#ded7c8] bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-[#5f5b4e] transition hover:bg-[#f8f2e7]"
                  >
                    <span className="material-symbols-outlined text-[14px]">filter_alt</span>
                    {t('common.filter')}
                  </button>
                </div>

                {showScoreFilters && (
                  <div className="mt-3 grid gap-2 rounded-[1.1rem] border border-[#e5dccd] bg-white/75 p-3 sm:grid-cols-2">
                    <input
                      type="date"
                      aria-label={t('common.date')}
                      value={scoreFilters.date}
                      onChange={(event) => updateScoreFilter('date', event.target.value)}
                      className={FILTER_FIELD_CLASS}
                    />
                    <input
                      type="time"
                      aria-label={t('common.time')}
                      value={scoreFilters.time}
                      onChange={(event) => updateScoreFilter('time', event.target.value)}
                      className={FILTER_FIELD_CLASS}
                    />
                    <select
                      aria-label={t('common.match')}
                      value={scoreFilters.matchId}
                      onChange={(event) => updateScoreFilter('matchId', event.target.value)}
                      className={FILTER_FIELD_CLASS}
                    >
                      <option value="">{t('admin.filters.allMatches')}</option>
                      {allMatchRecords.map((match) => (
                        <option key={match.id} value={String(match.id)}>
                          {t('common.match')} #{match.match_number}
                        </option>
                      ))}
                    </select>
                    <select
                      aria-label={t('common.team')}
                      value={scoreFilters.teamId}
                      onChange={(event) => updateScoreFilter('teamId', event.target.value)}
                      className={FILTER_FIELD_CLASS}
                    >
                      <option value="">{t('admin.filters.allTeams')}</option>
                      {scoreTeamOptions.map((team) => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                      ))}
                    </select>
                    <select
                      aria-label={t('common.status')}
                      value={scoreFilters.status}
                      onChange={(event) => updateScoreFilter('status', event.target.value)}
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
                      onClick={() => setScoreFilters(SCORE_FILTER_DEFAULTS)}
                      className="rounded-xl border border-[#ded7c8] bg-white px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-[#5f5b4e] transition hover:bg-[#f8f2e7]"
                    >
                      {t('common.resetFilters')}
                    </button>
                  </div>
                )}
              </div>

              <div className="h-px w-full bg-[#ddd3c4]" />

              <div className="mt-3 min-h-0 flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                {paginatedScoreRecords.length > 0 ? (
                  paginatedScoreRecords.map((match) => (
                    <RecentScoreCard key={match.id} match={match} onEdit={handleEditRecentScore} t={t} />
                  ))
                ) : (
                  <div className="rounded-[2rem] border border-white/80 bg-white/90 px-6 py-10 text-center shadow-[0_18px_36px_rgba(62,52,33,0.08)]">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f3efe4] text-[#66875f]">
                      <span className="material-symbols-outlined text-[1.8rem]">scoreboard</span>
                    </div>
                    <h3 className="mt-4 text-lg font-black tracking-tight text-on-surface">
                      {t('admin.scores.noRecentScores')}
                    </h3>
                    <p className="mt-2 text-sm font-medium text-on-surface/70">
                      {t('admin.filters.noFilteredMatches')}
                    </p>
                  </div>
                )}
              </div>
              <PaginationControls
                page={scoreRecordsPage}
                totalPages={scoreRecordsTotalPages}
                totalItems={filteredScoreRecords.length}
                pageSize={SCORE_RECORDS_PAGE_SIZE}
                onPrevious={() => setScoreRecordsPage((page) => Math.max(1, page - 1))}
                onNext={() => setScoreRecordsPage((page) => Math.min(scoreRecordsTotalPages, page + 1))}
                t={t}
              />
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}
