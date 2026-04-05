import { mockMatches, getTeamName, computePointsTable } from '../../data/mockData'

export default function TournamentOverviewPage() {
  const standings = computePointsTable()
  const completed = mockMatches.filter(m => m.status === 'completed').length
  const scheduled = mockMatches.filter(m => m.status === 'scheduled').length
  const total = mockMatches.length
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

  const stats = [
    { icon: 'analytics', value: completed, label: 'Played' },
    { icon: 'pending_actions', value: scheduled, label: 'Remaining' },
    { icon: 'warning', value: 0, label: 'No Matches' },
  ]

  return (
    <div className="p-8 md:p-10 max-w-[1400px] mx-auto space-y-10">
      <header>
        <h2 className="text-2xl font-bold tracking-tighter">Tournament Overview</h2>
        <p className="text-xs font-bold uppercase tracking-[0.05em] text-outline">Season 2024</p>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map(s => (
          <div key={s.label} className="bg-surface-container-low p-6 rounded-[2rem] flex flex-col justify-between h-40 hover:bg-surface-container-lowest transition-all">
            <span className="material-symbols-outlined text-primary text-3xl">{s.icon}</span>
            <div>
              <h4 className="text-3xl font-extrabold">{String(s.value).padStart(2,'0')}</h4>
              <p className="text-sm text-outline">{s.label}</p>
            </div>
          </div>
        ))}
        <div className="bg-primary p-6 rounded-[2rem] flex flex-col justify-between h-40 text-on-primary relative overflow-hidden">
          <span className="material-symbols-outlined text-3xl">stars</span>
          <div>
            <h4 className="text-3xl font-extrabold">{completionRate}%</h4>
            <p className="text-sm opacity-80">Complete</p>
          </div>
          <span className="material-symbols-outlined absolute -right-4 -bottom-4 opacity-10 text-[100px]">trophy</span>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <h3 className="text-xl font-bold mb-4">Points Table</h3>
          <div className="bg-surface-container-lowest rounded-[2rem] whisper-shadow overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-surface-container-low/50 text-xs font-bold uppercase tracking-widest text-outline">
                  <th className="px-6 py-4">Rank</th><th className="px-4 py-4">Team</th>
                  <th className="px-3 py-4 text-center">P</th><th className="px-3 py-4 text-center">W</th>
                  <th className="px-3 py-4 text-center">L</th><th className="px-3 py-4 text-center">NRR</th>
                  <th className="px-6 py-4 text-center">Pts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {standings.map(t => (
                  <tr key={t.id} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="px-6 py-4 font-bold">{String(t.rank).padStart(2,'0')}</td>
                    <td className="px-4 py-4 font-semibold">{t.team_name}</td>
                    <td className="px-3 py-4 text-center">{t.played}</td>
                    <td className="px-3 py-4 text-center">{t.won}</td>
                    <td className="px-3 py-4 text-center">{t.lost}</td>
                    <td className="px-3 py-4 text-center text-outline">{t.nrr>=0?'+':''}{t.nrr.toFixed(3)}</td>
                    <td className="px-6 py-4 text-center"><span className="bg-secondary-container px-3 py-1 rounded-full font-bold text-sm">{t.points}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold">Match Center</h3>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-3">Upcoming</p>
            {mockMatches.filter(m=>m.status==='scheduled').slice(0,3).map(m=>(
              <div key={m.id} className="bg-surface-container-low p-4 rounded-2xl mb-2 hover:bg-surface-container-lowest transition-all">
                <p className="text-[10px] text-outline mb-1">{new Date(m.scheduled_at).toLocaleDateString('en-IN',{month:'short',day:'numeric'})}</p>
                <p className="text-sm font-bold">{getTeamName(m.team_a_id)} vs {getTeamName(m.team_b_id)}</p>
              </div>
            ))}
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-3">Completed</p>
            {mockMatches.filter(m=>m.status==='completed').slice(0,2).map(m=>(
              <div key={m.id} className="bg-surface-container-low/50 p-4 rounded-2xl mb-2">
                <div className="flex justify-between">
                  <span className="text-sm font-bold">{getTeamName(m.team_a_id)}</span>
                  <span className="text-sm font-black">{m.runs_a}/{m.wickets_a} vs {m.runs_b}/{m.wickets_b}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
