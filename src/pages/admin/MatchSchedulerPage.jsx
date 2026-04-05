import { useEffect, useState } from 'react'
import { teamService } from '../../services/teamService'
import { matchService } from '../../services/matchService'
import { useTranslation } from '../../i18n'
import { Button, Badge, Select, Input } from '../../components/ui'
import { SectionLoader } from '../../components/ui/Spinner'

export default function MatchSchedulerPage() {
  const { t } = useTranslation()
  const [matches, setMatches] = useState([])
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ team_a_id: '', team_b_id: '', date: '', time: '', venue: t('admin.scheduler.venueOptions.mainPitch'), notes: '' })

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
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const matchData = {
        team_a_id: form.team_a_id,
        team_b_id: form.team_b_id,
        scheduled_at: `${form.date}T${form.time}:00`,
        venue: form.venue,
        notes: form.notes,
        status: 'scheduled',
      }
      await matchService.createMatch(matchData)
      fetchData()
      setForm({ team_a_id: '', team_b_id: '', date: '', time: '', venue: t('admin.scheduler.venueOptions.mainPitch'), notes: '' })
    } catch (err) {
      alert(t('admin.scheduler.failedSchedule') + err.message)
    }
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
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Select label={t('admin.scheduler.teamA')} value={form.team_a_id} onChange={e => setForm(p => ({ ...p, team_a_id: e.target.value }))} required>
                <option value="">{t('admin.scheduler.selectTeam')}</option>
                {teams.filter(t => t.id !== form.team_b_id).map(t => <option key={t.id} value={t.id}>{t.team_name}</option>)}
              </Select>
              <Select label={t('admin.scheduler.teamB')} value={form.team_b_id} onChange={e => setForm(p => ({ ...p, team_b_id: e.target.value }))} required>
                <option value="">{t('admin.scheduler.selectTeam')}</option>
                {teams.filter(t => t.id !== form.team_a_id).map(t => <option key={t.id} value={t.id}>{t.team_name}</option>)}
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-wide uppercase text-on-surface-variant ml-1">{t('admin.scheduler.date')}</label>
                <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required className="w-full bg-surface-container-lowest border-none rounded-xl py-3 px-4 text-sm focus:ring-4 focus:ring-primary-fixed-dim/30" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-wide uppercase text-on-surface-variant ml-1">{t('admin.scheduler.time')}</label>
                <input type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} required className="w-full bg-surface-container-lowest border-none rounded-xl py-3 px-4 text-sm focus:ring-4 focus:ring-primary-fixed-dim/30" />
              </div>
            </div>
            <Select label={t('admin.scheduler.venue')} value={form.venue} onChange={e => setForm(p => ({ ...p, venue: e.target.value }))}>
              <option>{t('admin.scheduler.venueOptions.mainPitch')}</option>
              <option>{t('admin.scheduler.venueOptions.turf2')}</option>
              <option>{t('admin.scheduler.venueOptions.groundB')}</option>
            </Select>
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-wide uppercase text-on-surface-variant ml-1">{t('admin.scheduler.notes')}</label>
              <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder={t('admin.scheduler.specialRequirements')} rows="2" className="w-full bg-surface-container-lowest border-none rounded-xl py-3 px-4 text-sm focus:ring-4 focus:ring-primary-fixed-dim/30" />
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
