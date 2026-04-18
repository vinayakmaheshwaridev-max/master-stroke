import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { notificationService } from '../../services/notificationService'
import { teamService } from '../../services/teamService'
import { useTranslation } from '../../i18n'
import { Button, Select, toast } from '../../components/ui'
import { SectionLoader } from '../../components/ui/Spinner'

const notificationSchema = z.object({
  recipient: z.string().min(1, 'Please select a recipient'),
  type: z.enum(['info', 'reminder', 'result', 'important'], { required_error: 'Please select a type' }),
  message: z.string().min(1, 'Message cannot be empty').max(500, 'Message must be 500 characters or less'),
})

export default function NotificationsPage() {
  const { t } = useTranslation()
  const [notifications, setNotifications] = useState([])
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    resolver: zodResolver(notificationSchema),
    defaultValues: { recipient: 'all', type: 'info', message: '' },
  })

  const selectedType = watch('type')

  const fetchData = async () => {
    try {
      const [n, te] = await Promise.all([
        notificationService.getNotifications(),
        teamService.getTeams('approved')
      ])
      setNotifications(n || [])
      setTeams(te || [])
    } catch (err) {
      console.error('Error fetching notifications data:', err)
      toast.error(t('admin.notifications.failedLoadNotifications') || 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const onSubmit = async (data) => {
    try {
      const recipientId = data.recipient === 'all' ? null : data.recipient
      await notificationService.sendNotification(data.message, data.type, recipientId)
      fetchData()
      reset({ recipient: 'all', type: 'info', message: '' })
      toast.success(t('admin.notifications.notificationSent'))
    } catch (err) {
      toast.error(t('admin.notifications.failedSend') + err.message)
    }
  }

  const onInvalid = () => {
    toast.error(t('admin.notifications.fixValidationErrors') || 'Please fix the errors before sending')
  }

  const typeIcons = { info: 'info', reminder: 'notifications', result: 'emoji_events', important: 'warning' }
  const typeColors = { info: 'bg-tertiary-container text-on-tertiary-container', reminder: 'bg-secondary-container text-on-secondary-container', result: 'bg-primary-container text-on-primary-container', important: 'bg-error-container text-on-error-container' }

  if (loading) return <SectionLoader message={t('admin.notifications.loadingComms')} />

  return (
    <div className="p-8 md:p-12 max-w-6xl mx-auto">
      <header className="mb-10">
        <span className="text-sm font-bold uppercase tracking-[0.1em] text-outline">{t('admin.notifications.communicationHub')}</span>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-on-background">{t('admin.notifications.notificationsMessaging')}</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Compose */}
        <section className="lg:col-span-5 bg-surface-container-low rounded-[2rem] p-8 shadow-sm">
          <h2 className="text-xl font-bold mb-6">{t('admin.notifications.composeBroadcast')}</h2>
          <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-wide uppercase text-on-surface-variant ml-1">{t('admin.notifications.recipient')}</label>
              <select
                {...register('recipient')}
                className={`w-full bg-surface-container-lowest border-none rounded-xl py-3 px-4 text-sm font-medium focus:ring-4 focus:ring-primary-fixed-dim/30 transition-all ${errors.recipient ? 'ring-2 ring-error' : ''}`}
              >
                <option value="all">{t('admin.notifications.allRegisteredTeams')}</option>
                {teams.map(te => <option key={te.id} value={te.id}>{te.team_name}</option>)}
              </select>
              {errors.recipient && <p className="text-xs text-error pl-1">{errors.recipient.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-1">{t('admin.notifications.type')} *</label>
              <div className="grid grid-cols-2 gap-3">
                {['info','reminder','result','important'].map(tp=>(
                  <label key={tp} className="cursor-pointer">
                    <input type="radio" value={tp} {...register('type')} className="hidden peer" />
                    <div className={`p-3 text-center rounded-xl bg-surface-container-lowest border transition-all text-sm font-medium capitalize ${errors.type ? 'border-error/50' : 'border-outline-variant/10'} peer-checked:bg-primary peer-checked:text-on-primary ${tp==='important'?'peer-checked:bg-error':''}`}>{tp}</div>
                  </label>
                ))}
              </div>
              {errors.type && <p className="text-xs text-error pl-1">{errors.type.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-1">{t('admin.notifications.message')} *</label>
              <textarea {...register('message')} rows="4" className={`w-full bg-surface-container-lowest border-outline-variant/20 rounded-xl py-3 px-4 focus:ring-4 focus:ring-primary-fixed-dim/30 resize-none leading-relaxed ${errors.message ? 'ring-2 ring-error' : ''}`} />
              {errors.message && <p className="text-xs text-error pl-1">{errors.message.message}</p>}
            </div>
            <Button type="submit" fullWidth size="lg">{t('admin.notifications.sendNotification')}</Button>
          </form>
        </section>

        {/* History */}
        <section className="lg:col-span-7 bg-surface-container-lowest rounded-[2rem] p-8 border border-outline-variant/5">
          <h2 className="text-xl font-bold mb-6">{t('admin.notifications.recentHistory')}</h2>
          <div className="space-y-2">
            {notifications.map(n=>(
              <div key={n.id} className="group flex items-start gap-4 py-4 hover:bg-surface-container-low/30 rounded-xl px-3 transition-all">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${typeColors[n.type]}`}>
                  <span className="material-symbols-outlined text-lg">{typeIcons[n.type]}</span>
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-sm text-on-surface leading-relaxed">{n.message}</p>
                  <div className="mt-1 flex items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container">
                      {n.team_id ? teams.find(te => te.id === n.team_id)?.team_name || 'Team' : t('admin.notifications.allTeams')}
                    </span>
                    <span className="text-[10px] text-outline">{new Date(n.created_at).toLocaleDateString('en-IN',{month:'short',day:'numeric'})}</span>
                  </div>
                </div>
              </div>
            ))}
            {notifications.length === 0 && <p className="text-center py-10 text-outline-variant">{t('admin.notifications.noHistory')}</p>}
          </div>
        </section>
      </div>

      {/* Stats */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: t('admin.notifications.reach'), value: teams.length, sub: t('admin.notifications.activeTeams') },
          { label: t('admin.notifications.totalSent'), value: notifications.length, sub: t('admin.notifications.allTime') },
          { label: t('admin.notifications.statusLabel'), value: t('admin.notifications.live'), sub: t('admin.notifications.broadcastSystem') },
        ].map(s=>(
          <div key={s.label} className="bg-surface-container p-6 rounded-2xl">
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2 block">{s.label}</span>
            <div className="text-3xl font-black">{s.value}</div>
            <p className="text-xs text-on-surface-variant mt-1">{s.sub}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
