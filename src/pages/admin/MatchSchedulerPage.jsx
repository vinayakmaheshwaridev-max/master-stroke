import { useEffect, useState } from 'react'
import { teamService } from '../../services/teamService'
import { matchService } from '../../services/matchService'

export default function MatchSchedulerPage() {
  const [matches, setMatches] = useState([])
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ team_a_id: '', team_b_id: '', date: '', time: '', venue: 'Ground A - Main Pitch', notes: '' })

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
      fetchData() // Refresh list
      setForm({ team_a_id: '', team_b_id: '', date: '', time: '', venue: 'Ground A - Main Pitch', notes: '' })
    } catch (err) {
      alert('Failed to schedule match: ' + err.message)
    }
  }

  if (loading) {
      return <div className="p-12 text-center text-outline animate-pulse">Loading scheduler...</div>
  }

  return (
    <div className="p-8 md:p-12">
      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tighter text-on-background mb-2">Match Scheduler</h1>
        <p className="text-on-surface-variant leading-relaxed max-w-2xl">Organize fixtures, manage team pairings, and allocate venues.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Create Form */}
        <section className="lg:col-span-5 bg-surface-container-low rounded-[2rem] p-8 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold tracking-tight">Create Fixture</h3>
            <span className="text-[10px] font-bold tracking-widest text-secondary-dim bg-secondary-container px-3 py-1 rounded-full uppercase">NEW</span>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-wide uppercase text-on-surface-variant ml-1">Team A</label>
                <select value={form.team_a_id} onChange={e => setForm(p => ({ ...p, team_a_id: e.target.value }))} required className="w-full bg-surface-container-lowest border-none rounded-xl py-3 px-4 text-sm focus:ring-4 focus:ring-primary-fixed-dim/30">
                  <option value="">Select Team</option>
                  {teams.filter(t => t.id !== form.team_b_id).map(t => <option key={t.id} value={t.id}>{t.team_name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-wide uppercase text-on-surface-variant ml-1">Team B</label>
                <select value={form.team_b_id} onChange={e => setForm(p => ({ ...p, team_b_id: e.target.value }))} required className="w-full bg-surface-container-lowest border-none rounded-xl py-3 px-4 text-sm focus:ring-4 focus:ring-primary-fixed-dim/30">
                  <option value="">Select Team</option>
                  {teams.filter(t => t.id !== form.team_a_id).map(t => <option key={t.id} value={t.id}>{t.team_name}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-wide uppercase text-on-surface-variant ml-1">Date</label>
                <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required className="w-full bg-surface-container-lowest border-none rounded-xl py-3 px-4 text-sm focus:ring-4 focus:ring-primary-fixed-dim/30" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-wide uppercase text-on-surface-variant ml-1">Time</label>
                <input type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} required className="w-full bg-surface-container-lowest border-none rounded-xl py-3 px-4 text-sm focus:ring-4 focus:ring-primary-fixed-dim/30" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-wide uppercase text-on-surface-variant ml-1">Venue</label>
              <select value={form.venue} onChange={e => setForm(p => ({ ...p, venue: e.target.value }))} className="w-full bg-surface-container-lowest border-none rounded-xl py-3 px-4 text-sm focus:ring-4 focus:ring-primary-fixed-dim/30">
                <option>Ground A - Main Pitch</option>
                <option>Ground A - Turf 2</option>
                <option>Ground B</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-wide uppercase text-on-surface-variant ml-1">Notes</label>
              <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Special requirements..." rows="2" className="w-full bg-surface-container-lowest border-none rounded-xl py-3 px-4 text-sm focus:ring-4 focus:ring-primary-fixed-dim/30" />
            </div>
            <button type="submit" className="w-full bg-gradient-to-br from-primary to-primary-dim text-on-primary py-4 rounded-xl font-bold text-sm shadow-lg hover:opacity-90 transition-all active:scale-[0.98]">
              Schedule Match
            </button>
          </form>
        </section>

        {/* Matches List */}
        <section className="lg:col-span-7 space-y-6">
          <h3 className="text-xl font-bold tracking-tight">Scheduled Matches ({matches.length})</h3>
          <div className="space-y-4">
            {matches.map(match => (
              <div key={match.id} className="group bg-surface-container-lowest p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-surface-container-low transition-all">
                <div className="flex items-center gap-5">
                  <div className="text-center w-12">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Match</p>
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
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  match.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-secondary-container text-on-secondary-container'
                }`}>{match.status}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
