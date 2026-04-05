import { useState } from 'react'
import { mockNotifications } from '../../data/mockData'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications)
  const [form, setForm] = useState({ recipient: 'all', type: 'info', message: '' })

  const handleSend = (e) => {
    e.preventDefault()
    const newNotif = {
      id: String(Date.now()),
      team_id: form.recipient === 'all' ? null : form.recipient,
      message: form.message,
      type: form.type,
      is_read: false,
      created_at: new Date().toISOString(),
    }
    setNotifications(prev => [newNotif, ...prev])
    setForm(p => ({ ...p, message: '' }))
  }

  const handleDelete = (id) => setNotifications(prev => prev.filter(n => n.id !== id))

  const typeIcons = { info: 'info', reminder: 'notifications', result: 'emoji_events', important: 'warning' }
  const typeColors = { info: 'bg-tertiary-container text-on-tertiary-container', reminder: 'bg-secondary-container text-on-secondary-container', result: 'bg-primary-container text-on-primary-container', important: 'bg-error-container text-on-error-container' }

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
              <select value={form.recipient} onChange={e => setForm(p=>({...p,recipient:e.target.value}))} className="w-full bg-surface-container-lowest border-outline-variant/20 rounded-xl py-3 px-4 focus:ring-4 focus:ring-primary-fixed-dim/30">
                <option value="all">All Registered Teams</option>
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
                    <span className="text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container">{n.team_id ? 'Team' : 'All Teams'}</span>
                    <span className="text-[10px] text-outline">{new Date(n.created_at).toLocaleDateString('en-IN',{month:'short',day:'numeric'})}</span>
                  </div>
                </div>
                <button onClick={()=>handleDelete(n.id)} className="opacity-0 group-hover:opacity-100 p-2 text-error hover:bg-error-container/20 rounded-full transition-all">
                  <span className="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Stats */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Reach', value: notifications.length * 8, sub: 'Recipients reached' },
          { label: 'Read Rate', value: '84%', sub: 'Mobile alerts' },
          { label: 'Total Sent', value: notifications.length, sub: 'All time' },
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
