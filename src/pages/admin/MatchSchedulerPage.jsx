import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { teamService } from '../../services/teamService'
import { matchService } from '../../services/matchService'
import { useTranslation } from '../../i18n'
import { Button, Badge, Select, toast } from '../../components/ui'
import { SectionLoader } from '../../components/ui/Spinner'

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

export default function MatchSchedulerPage() {
  const { t } = useTranslation()
  const [matches, setMatches] = useState([])
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    resolver: zodResolver(matchSchema),
    defaultValues: { team_a_id: '', team_b_id: '', date: '', time: '', venue: '', notes: '' },
  })

  const teamAId = watch('team_a_id')
  const teamBId = watch('team_b_id')

  const fetchData = async () => {
    try {
      const [t, m] = await Promise.all([
        teamService.getTeams('approved'),
        matchService.getMatches()
      ])
      setTeams(t || [])
      setMatches(m || [])
    } catch (err) {
      console.error('Error fetching scheduler data:', err)
      toast.error(t('admin.scheduler.failedLoadScheduler') || 'Failed to load scheduler data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const onSubmit = async (data) => {
    try {
      const matchData = {
        team_a_id: data.team_a_id,
        team_b_id: data.team_b_id,
        scheduled_at: `${data.date}T${data.time}:00`,
        venue: data.venue,
        notes: data.notes,
        status: 'scheduled',
      }
      await matchService.createMatch(matchData)
      toast.success(t('admin.scheduler.matchScheduled') || 'Match scheduled successfully')
      fetchData()
      reset({ team_a_id: '', team_b_id: '', date: '', time: '', venue: '', notes: '' })
    } catch (err) {
      toast.error(t('admin.scheduler.failedSchedule') + err.message)
    }
  }

  const onInvalid = () => {
    toast.error(t('admin.scheduler.fixValidationErrors') || 'Please fix the errors before scheduling')
  }

  if (loading) {
      return <SectionLoader message={t('admin.scheduler.loadingScheduler')} />
  }

  return (
    <div className="p-8 md:p-12">
      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tighter text-on-background mb-2">{t('admin.scheduler.matchScheduler')}</h1>
        <p className="text-on-surface-variant leading-relaxed max-w-2xl">{t('admin.scheduler.schedulerDescription')}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Create Form */}
        <section className="lg:col-span-5 bg-surface-container-low rounded-[2rem] p-8 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold tracking-tight">{t('admin.scheduler.createFixture')}</h3>
            <Badge status="scheduled">{t('admin.scheduler.new')}</Badge>
          </div>
          <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-wide uppercase text-on-surface-variant ml-1">{t('admin.scheduler.teamA')} *</label>
                <select
                  {...register('team_a_id')}
                  className={`w-full bg-surface-container-lowest border-none rounded-xl py-3 px-4 text-sm font-medium focus:ring-4 focus:ring-primary-fixed-dim/30 transition-all ${errors.team_a_id ? 'ring-2 ring-error' : ''}`}
                >
                  <option value="">{t('admin.scheduler.selectTeam')}</option>
                  {teams.filter(t => t.id !== teamBId).map(t => <option key={t.id} value={t.id}>{t.team_name}</option>)}
                </select>
                {errors.team_a_id && <p className="text-xs text-error pl-1">{errors.team_a_id.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-wide uppercase text-on-surface-variant ml-1">{t('admin.scheduler.teamB')} *</label>
                <select
                  {...register('team_b_id')}
                  className={`w-full bg-surface-container-lowest border-none rounded-xl py-3 px-4 text-sm font-medium focus:ring-4 focus:ring-primary-fixed-dim/30 transition-all ${errors.team_b_id ? 'ring-2 ring-error' : ''}`}
                >
                  <option value="">{t('admin.scheduler.selectTeam')}</option>
                  {teams.filter(t => t.id !== teamAId).map(t => <option key={t.id} value={t.id}>{t.team_name}</option>)}
                </select>
                {errors.team_b_id && <p className="text-xs text-error pl-1">{errors.team_b_id.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-wide uppercase text-on-surface-variant ml-1">{t('admin.scheduler.date')} *</label>
                <input type="date" {...register('date')} className={`w-full bg-surface-container-lowest border-none rounded-xl py-3 px-4 text-sm focus:ring-4 focus:ring-primary-fixed-dim/30 ${errors.date ? 'ring-2 ring-error' : ''}`} />
                {errors.date && <p className="text-xs text-error pl-1">{errors.date.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-wide uppercase text-on-surface-variant ml-1">{t('admin.scheduler.time')} *</label>
                <input type="time" {...register('time')} className={`w-full bg-surface-container-lowest border-none rounded-xl py-3 px-4 text-sm focus:ring-4 focus:ring-primary-fixed-dim/30 ${errors.time ? 'ring-2 ring-error' : ''}`} />
                {errors.time && <p className="text-xs text-error pl-1">{errors.time.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-wide uppercase text-on-surface-variant ml-1">{t('admin.scheduler.venue')} *</label>
              <select
                {...register('venue')}
                className={`w-full bg-surface-container-lowest border-none rounded-xl py-3 px-4 text-sm font-medium focus:ring-4 focus:ring-primary-fixed-dim/30 transition-all ${errors.venue ? 'ring-2 ring-error' : ''}`}
              >
                <option value="">{t('admin.scheduler.selectVenue') || 'Select venue'}</option>
                <option value={t('admin.scheduler.venueOptions.mainPitch')}>{t('admin.scheduler.venueOptions.mainPitch')}</option>
                <option value={t('admin.scheduler.venueOptions.turf2')}>{t('admin.scheduler.venueOptions.turf2')}</option>
                <option value={t('admin.scheduler.venueOptions.groundB')}>{t('admin.scheduler.venueOptions.groundB')}</option>
              </select>
              {errors.venue && <p className="text-xs text-error pl-1">{errors.venue.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-wide uppercase text-on-surface-variant ml-1">{t('admin.scheduler.notes')}</label>
              <textarea {...register('notes')} rows="2" className="w-full bg-surface-container-lowest border-none rounded-xl py-3 px-4 text-sm focus:ring-4 focus:ring-primary-fixed-dim/30" />
            </div>
            <Button type="submit" fullWidth size="lg">
              {t('admin.scheduler.scheduleMatch')}
            </Button>
          </form>
        </section>

        {/* Matches List */}
        <section className="lg:col-span-7 space-y-6">
          <h3 className="text-xl font-bold tracking-tight">{t('admin.scheduler.scheduledMatches')} ({matches.length})</h3>
          <div className="space-y-4">
            {matches.map(match => (
              <div key={match.id} className="group bg-surface-container-lowest p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-surface-container-low transition-all">
                <div className="flex items-center gap-5">
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
                <Badge status={match.status}>{match.status}</Badge>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
