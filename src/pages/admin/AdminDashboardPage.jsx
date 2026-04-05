import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { teamService } from '../../services/teamService'
import { matchService } from '../../services/matchService'
import { settingsService } from '../../services/settingsService'

export default function AdminDashboardPage() {
  const [regOpen, setRegOpen] = useState(true)
  const [teams, setTeams] = useState([])
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [t, m, status] = await Promise.all([
          teamService.getTeams('all'), // Need a way to get all including pending/rejected
          matchService.getMatches(),
          settingsService.getRegistrationStatus()
        ])
        setTeams(t || [])
        setMatches(m || [])
        setRegOpen(status)
      } catch (err) {
        console.error('Error fetching admin dashboard:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Refined getTeams to handle 'all'
  // I should probably update the service, but for now I'll assume getTeams('all') works if I updated the service correctly.
  // Wait, my teamService.getTeams('all') might not work yet. Let me quickly check the service I wrote.

  const pending = teams.filter(t => t.status === 'pending').length
  const approved = teams.filter(t => t.status === 'approved').length
  const paymentPending = teams.filter(t => t.status === 'approved' && !t.payment_done).length
  const todayMatches = matches.filter(m => {
      const today = new Date().toDateString()
      return new Date(m.scheduled_at).toDateString() === today
  }).length

  const recentTeams = [...teams].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5)

  const handleToggleReg = async () => {
    try {
      await settingsService.setRegistrationStatus(!regOpen)
      setRegOpen(!regOpen)
    } catch (err) {
      alert('Failed to update registration status')
    }
  }

  if (loading) {
      return <div className="p-12 text-center text-outline animate-pulse">Loading admin dashboard...</div>
  }

  return (
    <div className="p-8 md:p-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary opacity-60 mb-2 block">System Overview</span>
          <h2 className="text-4xl md:text-5xl font-black text-editorial-tight text-on-surface">Admin Hub</h2>
        </div>
        <div className="bg-surface-container-lowest p-4 px-6 rounded-2xl flex items-center gap-6 shadow-sm ring-1 ring-on-surface/5">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-outline">Status</span>
            <p className="text-sm font-bold text-on-surface">Registration is {regOpen ? 'OPEN' : 'CLOSED'}</p>
          </div>
          <button
            onClick={handleToggleReg}
            className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${regOpen ? 'bg-secondary-container' : 'bg-surface-container-high'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full transition-transform ${regOpen ? 'translate-x-7 bg-on-secondary-container' : 'translate-x-1 bg-outline'}`} />
          </button>
        </div>
      </header>

      {/* Metrics Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
        <div className="col-span-2 row-span-2 bg-surface-container-lowest rounded-3xl p-8 flex flex-col justify-between shadow-sm border border-on-surface/5 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
          <div className="z-10">
            <span className="material-symbols-outlined text-primary mb-4 p-3 bg-primary-container/30 rounded-2xl inline-block">person_add</span>
            <h3 className="text-lg font-bold text-on-surface-variant">Total Registrations</h3>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-6xl md:text-7xl font-black text-editorial-tight">{teams.length}</span>
            </div>
          </div>
          <div className="z-10 mt-6 flex gap-2 items-center">
            <div className="h-1 flex-1 bg-primary-container rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${(approved / teams.length) * 100 || 0}%` }} />
            </div>
            <span className="text-[10px] font-black uppercase text-outline">{approved} Approved</span>
          </div>
        </div>

        <div className="bg-surface-container-low rounded-3xl p-6 flex flex-col justify-between hover:bg-surface-container-lowest transition-colors">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-primary p-2 bg-white rounded-xl">hourglass_empty</span>
            <span className="text-[10px] font-bold px-2 py-1 bg-error-container/20 text-error rounded-full">ACTION REQ</span>
          </div>
          <div><h3 className="text-sm font-medium text-on-surface-variant">Pending Approval</h3><p className="text-3xl font-black mt-1">{pending}</p></div>
        </div>

        <div className="bg-surface-container-low rounded-3xl p-6 flex flex-col justify-between hover:bg-surface-container-lowest transition-colors">
          <span className="material-symbols-outlined text-primary p-2 bg-white rounded-xl w-fit">check_circle</span>
          <div><h3 className="text-sm font-medium text-on-surface-variant">Approved Teams</h3><p className="text-3xl font-black mt-1">{approved}</p></div>
        </div>

        <div className="bg-surface-container-low rounded-3xl p-6 flex flex-col justify-between hover:bg-surface-container-lowest transition-colors">
          <span className="material-symbols-outlined text-primary p-2 bg-white rounded-xl w-fit">payments</span>
          <div><h3 className="text-sm font-medium text-on-surface-variant">Payment Pending</h3><p className="text-3xl font-black mt-1">{paymentPending}</p></div>
        </div>

        <div className="bg-surface-container-low rounded-3xl p-6 flex flex-col justify-between hover:bg-surface-container-lowest transition-colors">
          <span className="material-symbols-outlined text-primary p-2 bg-white rounded-xl w-fit">event</span>
          <div><h3 className="text-sm font-medium text-on-surface-variant">Today's Matches</h3><p className="text-3xl font-black mt-1">{String(todayMatches).padStart(2, '0')}</p></div>
        </div>
      </section>

      {/* Bottom: Table + Sidebar */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-extrabold tracking-tight">Recent Registrations</h3>
            <Link to="/admin/teams" className="text-xs font-bold text-primary hover:underline">View All Teams</Link>
          </div>
          <div className="bg-surface-container-lowest rounded-[2rem] overflow-hidden shadow-sm border border-on-surface/5">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low/50">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-outline">Captain</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-outline">Team</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-outline hidden md:table-cell">Mobile</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-outline">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-on-surface/5">
                {recentTeams.map(team => (
                  <tr key={team.id} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary-container/40 flex items-center justify-center text-[10px] font-bold">
                          {team.captain_name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-bold text-sm">{team.captain_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">{team.team_name}</td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant font-mono hidden md:table-cell">{team.mobile}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        team.status === 'approved' ? 'bg-green-100 text-green-700' :
                        team.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {team.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-extrabold tracking-tight">Quick Actions</h3>
          <Link to="/admin/teams" className="block bg-primary text-on-primary rounded-[2rem] p-6 shadow-xl shadow-primary/10 relative overflow-hidden hover:scale-[1.02] transition-transform">
            <span className="material-symbols-outlined absolute top-4 right-4 opacity-20 text-4xl">groups</span>
            <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Pending</p>
            <p className="text-xl font-bold">{pending} teams need review</p>
          </Link>
          <Link to="/admin/scheduler" className="block bg-surface-container-low rounded-[2rem] p-6 hover:bg-surface-container-lowest transition-colors">
            <h4 className="text-sm font-black uppercase tracking-widest text-outline mb-3">Schedule</h4>
            <p className="text-sm font-medium">{matches.filter(m => m.status === 'scheduled').length} upcoming matches</p>
          </Link>
        </div>
      </section>
    </div>
  )
}
