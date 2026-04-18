import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { matchService } from '../../services/matchService'
import { notificationService } from '../../services/notificationService'
import { useTranslation } from '../../i18n'
import { Button, Select, Card, useToast } from '../../components/ui'
import { SectionLoader } from '../../components/ui/Spinner'

// Helper: reject empty strings before coercing to number
const preprocessNumber = (schema) =>
  z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
    schema
  )

const overRefine = (val) => {
  if (val === undefined || val === null) return true;
  const decimal = parseFloat((val % 1).toFixed(1));
  return decimal >= 0 && decimal <= 0.5;
};

const overMessage = 'Balls must be between .0 and .5';

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
  // Prevent 0 overs total unless the result is no_result
  if (data.result !== 'no_result' && data.overs_a === 0 && data.overs_b === 0) {
    ctx.addIssue({ path: ['result'], code: z.ZodIssueCode.custom, message: 'Matches with a valid result must have at least some overs played.' });
  }

  // A team can only win if they scored MORE runs than the opponent
  if (data.result === 'team_a' && data.runs_a <= data.runs_b) {
    ctx.addIssue({ path: ['result'], code: z.ZodIssueCode.custom, message: 'Team A must score more runs than Team B to win.' });
  }
  if (data.result === 'team_b' && data.runs_b <= data.runs_a) {
    ctx.addIssue({ path: ['result'], code: z.ZodIssueCode.custom, message: 'Team B must score more runs than Team A to win.' });
  }
  
  // A tie must have exactly equal runs
  if (data.result === 'tie' && data.runs_a !== data.runs_b) {
    ctx.addIssue({ path: ['result'], code: z.ZodIssueCode.custom, message: 'A tie requires both teams to have exactly equal runs.' });
  }
})

export default function ScoreEntryPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { toast } = useToast()
  const formRef = useRef(null)
  const [scheduledMatches, setScheduledMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMatchId, setSelectedMatchId] = useState('')
  const [match, setMatch] = useState(null)

  const { register, handleSubmit, formState: { errors, isDirty }, reset } = useForm({
    resolver: zodResolver(scoreEntrySchema),
    defaultValues: {
      runs_a: '', wickets_a: '', overs_a: '',
      runs_b: '', wickets_b: '', overs_b: '',
      result: '', man_of_match: '', summary: '',
    },
  })

  useEffect(() => {
    async function fetchScheduled() {
      try {
        const data = await matchService.getMatches()
        // Show only matches that don't have scores entered yet (status = 'scheduled')
        const filtered = data.filter(m => m.status === 'scheduled')
        setScheduledMatches(filtered)
        if (filtered.length > 0) setSelectedMatchId(filtered[0].id)
      } catch (err) {
        console.error('Error fetching matches:', err)
        toast('Failed to load matches', 'error')
      } finally {
        setLoading(false)
      }
    }
    fetchScheduled()
  }, [])

  useEffect(() => {
    if (selectedMatchId) {
      const found = scheduledMatches.find(m => m.id === selectedMatchId)
      setMatch(found)
      reset({
        runs_a: '', wickets_a: '', overs_a: '',
        runs_b: '', wickets_b: '', overs_b: '',
        result: '', man_of_match: '', summary: '',
      })
    }
  }, [selectedMatchId, scheduledMatches, reset])

  const onSubmit = async (data) => {
    if (!match) return toast(t('admin.scores.selectVerdict'), 'warning')

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

      await matchService.updateScore(selectedMatchId, scoreData)

      // Send notification separately so a failure here doesn't block the publish
      try {
        await notificationService.sendNotification(
          `Final Result: ${match.team_a?.team_name} vs ${match.team_b?.team_name} - ${data.summary}`,
          'result'
        )
      } catch (notifErr) {
        console.warn('Notification failed (non-critical):', notifErr)
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

  const fieldClass = (fieldName) =>
    `w-full bg-surface-container-lowest border-outline-variant/20 focus:ring-4 focus:ring-primary/10 rounded-2xl p-4 text-2xl font-bold tracking-tight ${errors[fieldName] ? 'ring-2 ring-error' : ''}`

  const noMatches = scheduledMatches.length === 0
  const teamAName = match?.team_a?.team_name || t('admin.scores.teamA') || 'Team A'
  const teamBName = match?.team_b?.team_name || t('admin.scores.teamB') || 'Team B'

  return (
    <div className="p-8 md:p-12">
      <header className="mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.05em] text-on-surface-variant mb-2 block">{t('admin.scores.tournamentAdminLabel')}</span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-[-0.02em] text-on-surface">{t('admin.scores.scoreResultEntry')}</h1>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" disabled={!isDirty} onClick={() => reset()}>{t('common.discard') || 'Clear Form'}</Button>
            <Button
              type="button"
              disabled={noMatches}
              onClick={() => {
                if (formRef.current) {
                  formRef.current.requestSubmit()
                } else {
                  toast(t('admin.scores.selectVerdict'), 'warning')
                }
              }}
            >
              {t('admin.scores.publishResult')}
            </Button>
          </div>
        </div>
      </header>

      {/* Match Selector */}
      <div className="mb-8">
        <Select
          label={t('admin.scores.selectMatch')}
          value={selectedMatchId}
          onChange={e => setSelectedMatchId(e.target.value)}
          className="max-w-md"
          disabled={noMatches}
        >
          {scheduledMatches.length > 0
            ? scheduledMatches.map(m => (
                <option key={m.id} value={m.id}>{t('common.match')} #{m.match_number}: {m.team_a?.team_name} vs {m.team_b?.team_name}</option>
              ))
            : <option value="">{t('admin.scores.noScheduledMatches')}</option>
          }
        </Select>
      </div>

      {/* Form — always rendered, blurred overlay when no matches */}
      <div className="relative">
        {noMatches && (
          <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[2rem]">
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-[2rem]" />
            <div className="relative z-10 flex flex-col items-center gap-4 p-10 bg-white/90 rounded-3xl shadow-xl border border-outline-variant/10">
              <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-outline">sports_cricket</span>
              </div>
              <h3 className="text-xl font-bold text-on-surface">{t('admin.scores.noMatchAvailable') || 'No Match Available'}</h3>
              <p className="text-sm text-on-surface-variant text-center max-w-xs">{t('admin.scores.noMatchDescription') || 'Schedule matches first to start entering scores and results.'}</p>
              <Button variant="ghost" onClick={() => navigate('/admin/scheduler')}>
                <span className="material-symbols-outlined text-sm mr-1">calendar_month</span>
                {t('admin.scores.goToScheduler') || 'Go to Scheduler'}
              </Button>
            </div>
          </div>
        )}

        <form
          ref={formRef}
          onSubmit={handleSubmit(onSubmit, onInvalid)}
          noValidate
          className={`grid grid-cols-1 lg:grid-cols-12 gap-8 transition-all duration-300 ${noMatches ? 'opacity-40 pointer-events-none select-none' : ''}`}
        >
          <div className="lg:col-span-8 space-y-6">
            {/* Team A */}
            <section className="bg-surface-container-low rounded-[2rem] p-8 transition-all hover:bg-surface-container">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-surface-container-lowest flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-primary">shield</span>
                </div>
                <h2 className="text-xl font-bold">{teamAName}</h2>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-1">{t('admin.scores.runs')} *</label>
                  <input type="number" {...register('runs_a')} placeholder={t('admin.scores.placeholderRuns')} className={fieldClass('runs_a')} />
                  {errors.runs_a && <p className="text-xs text-error pl-1">{errors.runs_a.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-1">{t('admin.scores.wickets')} *</label>
                  <input type="number" {...register('wickets_a')} placeholder={t('admin.scores.placeholderWickets')} className={fieldClass('wickets_a')} />
                  {errors.wickets_a && <p className="text-xs text-error pl-1">{errors.wickets_a.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-1">{t('admin.scores.overs')} *</label>
                  <input type="number" step="0.1" {...register('overs_a')} placeholder={t('admin.scores.placeholderOvers')} className={fieldClass('overs_a')} />
                  {errors.overs_a && <p className="text-xs text-error pl-1">{errors.overs_a.message}</p>}
                </div>
              </div>
            </section>

            {/* Team B */}
            <section className="bg-surface-container-low rounded-[2rem] p-8 transition-all hover:bg-surface-container">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-surface-container-lowest flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-primary">sports_cricket</span>
                </div>
                <h2 className="text-xl font-bold">{teamBName}</h2>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-1">{t('admin.scores.runs')} *</label>
                  <input type="number" {...register('runs_b')} placeholder={t('admin.scores.placeholderRuns')} className={fieldClass('runs_b')} />
                  {errors.runs_b && <p className="text-xs text-error pl-1">{errors.runs_b.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-1">{t('admin.scores.wickets')} *</label>
                  <input type="number" {...register('wickets_b')} placeholder={t('admin.scores.placeholderWickets')} className={fieldClass('wickets_b')} />
                  {errors.wickets_b && <p className="text-xs text-error pl-1">{errors.wickets_b.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-1">{t('admin.scores.overs')} *</label>
                  <input type="number" step="0.1" {...register('overs_b')} placeholder={t('admin.scores.placeholderOvers')} className={fieldClass('overs_b')} />
                  {errors.overs_b && <p className="text-xs text-error pl-1">{errors.overs_b.message}</p>}
                </div>
              </div>
            </section>

            {/* Match Details */}
            <Card variant="default" className="space-y-6">
              <h3 className="text-xl font-bold mb-4">{t('admin.scores.finalAssessment')}</h3>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-1">{t('admin.scores.manOfMatch')} *</label>
                <input type="text" {...register('man_of_match')} placeholder={t('admin.scores.placeholderPlayer')} className={`w-full bg-surface-container-low border-none focus:ring-4 focus:ring-primary/10 rounded-2xl p-4 ${errors.man_of_match ? 'ring-2 ring-error' : ''}`} />
                {errors.man_of_match && <p className="text-xs text-error pl-1">{errors.man_of_match.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-1">{t('admin.scores.matchSummary')} *</label>
                <textarea {...register('summary')} rows="3" placeholder={t('admin.scores.placeholderSummary')} className={`w-full bg-surface-container-low border-none focus:ring-4 focus:ring-primary/10 rounded-2xl p-4 leading-relaxed ${errors.summary ? 'ring-2 ring-error' : ''}`} />
                {errors.summary && <p className="text-xs text-error pl-1">{errors.summary.message}</p>}
              </div>
            </Card>
          </div>

          {/* Right: Verdict */}
          <aside className="lg:col-span-4 space-y-6">
            <Card variant="default">
              <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-6">{t('admin.scores.matchVerdict')} *</h3>
              <div className="space-y-3">
                {[
                  { value: 'team_a', label: t('admin.scores.teamWon', { team: teamAName }) },
                  { value: 'team_b', label: t('admin.scores.teamWon', { team: teamBName }) },
                  { value: 'tie', label: t('admin.scores.tieMatch') },
                  { value: 'no_result', label: t('admin.scores.noResult') },
                ].map(opt => (
                  <label key={opt.value} className={`group flex items-center justify-between p-4 rounded-2xl bg-surface-container-low hover:bg-secondary-container transition-colors cursor-pointer ${errors.result ? 'ring-1 ring-error/50' : ''}`}>
                    <span className="font-semibold text-on-surface">{opt.label}</span>
                    <input type="radio" value={opt.value} {...register('result')} className="text-primary focus:ring-primary rounded-full w-5 h-5" />
                  </label>
                ))}
              </div>
              {errors.result && <p className="text-xs text-error pl-1 mt-3">{errors.result.message}</p>}
            </Card>

            <div className="bg-primary rounded-[2rem] p-8 text-on-primary">
              <div className="flex items-center gap-2 mb-3 opacity-70">
                <span className="material-symbols-outlined text-sm">info</span>
                <span className="text-xs font-bold uppercase tracking-widest">{t('admin.scores.noteTitle')}</span>
              </div>
              <p className="text-sm font-medium leading-relaxed">
                {t('admin.scores.noteMessage')}
              </p>
            </div>
          </aside>
        </form>
      </div>
    </div>
  )
}

