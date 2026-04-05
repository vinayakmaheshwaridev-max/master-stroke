import { useEffect, useState } from 'react'
import { notificationService } from '../../services/notificationService'
import { teamService } from '../../services/teamService'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ recipient: 'all', type: 'info', message: '' })

  const fetchData = async () => {
    try {
      const [n, t] = await Promise.all([
        notificationService.getNotifications(),
        teamService.getTeams('approved')
      ])
      setNotifications(n || [])
      setTeams(t || [])
    } catch (err) {
      console.error('Error fetching notifications data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSend = async (e) => {
    e.preventDefault()
    try {
      const recipientId = form.recipient === 'all' ? null : form.recipient
      await notificationService.sendNotification(form.message, form.type, recipientId)
      fetchData() // Refresh list
      setForm(p => ({ ...p, message: '' }))
      alert('Notification sent!')
    } catch (err) {
      alert('Failed to send notification: ' + err.message)
    }
  }

  const typeIcons = { info: 'info', reminder: 'notifications', result: 'emoji_events', important: 'warning' }
  const typeColors = { info: 'bg-tertiary-container text-on-tertiary-container', reminder: 'bg-secondary-container text-on-secondary-container', result: 'bg-primary-container text-on-primary-container', important: 'bg-error-container text-on-error-container' }

  if (loading) {
    return <div className="p-12 text-center text-outline animate-pulse">Loading communication hub...</div>
  }

  return (
    <div className="p-8 md:p-12 max-w-6xl mx-auto">
      <header className="mb-10">
        <span className="text-sm font-bold uppercase tracking-[0.1em] text-outline">Communication Hub</span>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-on-background">Notifications & Messaging</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Compose */}
        <section className="lg:col-span-5 bg-surface-container-low rounded-[2rem] p-8 shadow-sm">
          <h2 className="text-xl font-bold mb-6">Compose Broadcast</h2>
          <form onSubmit={handleSend} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-1">Recipient</label>
              <select value={form.recipient} onChange={e => setForm(p=>({...p,recipient:e.target.value}))} className="w-full bg-surface-container-lowest border-outline-variant/20 rounded-xl py-3 px-4 focus:ring-4 focus:ring-primary-fixed-dim/30 font-medium">
                <option value="all">All Registered Teams</option>
                {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.team_name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-1">Type</label>
              <div className="grid grid-cols-2 gap-3">
                {['info','reminder','result','important'].map(t=>(
                  <label key={t} className="cursor-pointer">
                    <input type="radio" name="type" value={t} checked={form.type===t} onChange={e=>setForm(p=>({...p,type:e.target.value}))} className="hidden peer" />
                    <div className={`p-3 text-center rounded-xl bg-surface-container-lowest border border-outline-variant/10 peer-checked:bg-primary peer-checked:text-on-primary transition-all text-sm font-medium capitalize ${t==='important'?'peer-checked:bg-error':''}`}>{t}</div>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-1">Message</label>
              <textarea value={form.message} onChange={e=>setForm(p=>({...p,message:e.target.value}))} required placeholder="Draft your announcement..." rows="4" className="w-full bg-surface-container-lowest border-outline-variant/20 rounded-xl py-3 px-4 focus:ring-4 focus:ring-primary-fixed-dim/30 resize-none leading-relaxed" />
            </div>
            <button type="submit" className="w-full primary-gradient text-on-primary py-4 rounded-xl font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform">Send Notification</button>
          </form>
        </section>

        {/* History */}
        <section className="lg:col-span-7 bg-surface-container-lowest rounded-[2rem] p-8 border border-outline-variant/5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Recent History</h2>
          </div>
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
                        {n.team_id ? teams.find(t => t.id === n.team_id)?.team_name || 'Team' : 'All Teams'}
                    </span>
                    <span className="text-[10px] text-outline">{new Date(n.created_at).toLocaleDateString('en-IN',{month:'short',day:'numeric'})}</span>
                  </div>
                </div>
              </div>
            ))}
            {notifications.length === 0 && <p className="text-center py-10 text-outline-variant">No notification history.</p>}
          </div>
        </section>
      </div>

      {/* Stats */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Reach', value: teams.length, sub: 'Active Teams' },
          { label: 'Total Sent', value: notifications.length, sub: 'All time' },
          { label: 'Status', value: 'Live', sub: 'Broadcast System' },
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
