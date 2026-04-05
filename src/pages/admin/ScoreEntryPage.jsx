import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { matchService } from '../../services/matchService'
import { notificationService } from '../../services/notificationService'

export default function ScoreEntryPage() {
  const navigate = useNavigate()
  const [scheduledMatches, setScheduledMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMatchId, setSelectedMatchId] = useState('')
  const [match, setMatch] = useState(null)

  const [scoreA, setScoreA] = useState({ runs: '', wickets: '', overs: '' })
  const [scoreB, setScoreB] = useState({ runs: '', wickets: '', overs: '' })
  const [result, setResult] = useState('')
  const [manOfMatch, setManOfMatch] = useState('')
  const [summary, setSummary] = useState('')

  useEffect(() => {
    async function fetchScheduled() {
      try {
        const data = await matchService.getMatches()
        const filtered = data.filter(m => m.status === 'scheduled')
        setScheduledMatches(filtered)
        if (filtered.length > 0) setSelectedMatchId(filtered[0].id)
      } catch (err) {
        console.error('Error fetching matches:', err)
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
    }
  }, [selectedMatchId, scheduledMatches])

  const handlePublish = async (e) => {
    e.preventDefault()
    if (!result) return alert('Please select a match verdict')

    try {
      const scoreData = {
        runs_a: parseInt(scoreA.runs),
        wickets_a: parseInt(scoreA.wickets),
        overs_a: parseFloat(scoreA.overs),
        runs_b: parseInt(scoreB.runs),
        wickets_b: parseInt(scoreB.wickets),
        overs_b: parseFloat(scoreB.overs),
        result,
        man_of_match: manOfMatch,
        summary
      }

      await matchService.updateScore(selectedMatchId, scoreData)
      
      // Send notification
      await notificationService.sendNotification(
        `Final Result: ${match.team_a.team_name} vs ${match.team_b.team_name} - ${summary}`,
        'result'
      )

      alert('Result published successfully!')
      navigate('/admin/tournament')
    } catch (err) {
      alert('Failed to publish result: ' + err.message)
    }
  }

  if (loading) {
    return <div className="p-12 text-center text-outline animate-pulse">Loading matches...</div>
  }

  return (
    <div className="p-8 md:p-12">
      <header className="mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.05em] text-on-surface-variant mb-2 block">Tournament Admin</span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-[-0.02em] text-on-surface">Score & Result Entry</h1>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate(-1)} className="px-5 py-3 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container-low transition-colors">Discard</button>
            <button onClick={handlePublish} className="px-6 py-3 rounded-xl text-sm font-semibold primary-gradient text-on-primary shadow-lg hover:scale-[1.02] active:scale-95 transition-all">Publish Result</button>
          </div>
        </div>
      </header>

      {/* Match Selector */}
      <div className="mb-8">
        <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 block">Select Match</label>
        <select value={selectedMatchId} onChange={e => setSelectedMatchId(e.target.value)} className="bg-surface-container-lowest border-none rounded-xl py-3 px-4 text-sm font-medium focus:ring-4 focus:ring-primary-fixed-dim/30 max-w-md w-full">
          {scheduledMatches.map(m => (
            <option key={m.id} value={m.id}>Match #{m.match_number}: {m.team_a?.team_name} vs {m.team_b?.team_name}</option>
          ))}
          {scheduledMatches.length === 0 && <option>No scheduled matches</option>}
        </select>
      </div>

      {match && (
        <form onSubmit={handlePublish} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            {/* Team A */}
            <section className="bg-surface-container-low rounded-[2rem] p-8 transition-all hover:bg-surface-container">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-surface-container-lowest flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-primary">shield</span>
                </div>
                <h2 className="text-xl font-bold">{match.team_a?.team_name}</h2>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-1">Runs</label>
                  <input type="number" value={scoreA.runs} onChange={e => setScoreA(p => ({ ...p, runs: e.target.value }))} placeholder="000" required className="w-full bg-surface-container-lowest border-outline-variant/20 focus:ring-4 focus:ring-primary/10 rounded-2xl p-4 text-2xl font-bold tracking-tight" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-1">Wickets</label>
                  <input type="number" value={scoreA.wickets} onChange={e => setScoreA(p => ({ ...p, wickets: e.target.value }))} placeholder="0" min="0" max="10" required className="w-full bg-surface-container-lowest border-outline-variant/20 focus:ring-4 focus:ring-primary/10 rounded-2xl p-4 text-2xl font-bold tracking-tight" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-1">Overs</label>
                  <input type="number" step="0.1" value={scoreA.overs} onChange={e => setScoreA(p => ({ ...p, overs: e.target.value }))} placeholder="6.0" required className="w-full bg-surface-container-lowest border-outline-variant/20 focus:ring-4 focus:ring-primary/10 rounded-2xl p-4 text-2xl font-bold tracking-tight" />
                </div>
              </div>
            </section>

            {/* Team B */}
            <section className="bg-surface-container-low rounded-[2rem] p-8 transition-all hover:bg-surface-container">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-surface-container-lowest flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-primary">sports_cricket</span>
                </div>
                <h2 className="text-xl font-bold">{match.team_b?.team_name}</h2>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-1">Runs</label>
                  <input type="number" value={scoreB.runs} onChange={e => setScoreB(p => ({ ...p, runs: e.target.value }))} placeholder="000" required className="w-full bg-surface-container-lowest border-outline-variant/20 focus:ring-4 focus:ring-primary/10 rounded-2xl p-4 text-2xl font-bold tracking-tight" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-1">Wickets</label>
                  <input type="number" value={scoreB.wickets} onChange={e => setScoreB(p => ({ ...p, wickets: e.target.value }))} placeholder="0" min="0" max="10" required className="w-full bg-surface-container-lowest border-outline-variant/20 focus:ring-4 focus:ring-primary/10 rounded-2xl p-4 text-2xl font-bold tracking-tight" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-1">Overs</label>
                  <input type="number" step="0.1" value={scoreB.overs} onChange={e => setScoreB(p => ({ ...p, overs: e.target.value }))} placeholder="6.0" required className="w-full bg-surface-container-lowest border-outline-variant/20 focus:ring-4 focus:ring-primary/10 rounded-2xl p-4 text-2xl font-bold tracking-tight" />
                </div>
              </div>
            </section>

            {/* Match Details */}
            <section className="bg-surface-container-lowest rounded-[2rem] p-8 whisper-shadow space-y-6">
              <h3 className="text-xl font-bold mb-4">Final Assessment</h3>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-1">Man of the Match</label>
                <input type="text" value={manOfMatch} onChange={e => setManOfMatch(e.target.value)} placeholder="Player name..." className="w-full bg-surface-container-low border-none focus:ring-4 focus:ring-primary/10 rounded-2xl p-4" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-1">Match Summary</label>
                <textarea value={summary} onChange={e => setSummary(e.target.value)} rows="3" placeholder="Brief summary of the match..." className="w-full bg-surface-container-low border-none focus:ring-4 focus:ring-primary/10 rounded-2xl p-4 leading-relaxed" />
              </div>
            </section>
          </div>

          {/* Right: Verdict */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-surface-container-lowest rounded-[2rem] p-8 whisper-shadow">
              <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-6">Match Verdict</h3>
              <div className="space-y-3">
                {[
                  { value: 'team_a', label: `${match.team_a?.team_name} Won` },
                  { value: 'team_b', label: `${match.team_b?.team_name} Won` },
                  { value: 'tie', label: 'Tie Match' },
                  { value: 'no_result', label: 'No Result' },
                ].map(opt => (
                  <label key={opt.value} className="group flex items-center justify-between p-4 rounded-2xl bg-surface-container-low hover:bg-secondary-container transition-colors cursor-pointer">
                    <span className="font-semibold text-on-surface">{opt.label}</span>
                    <input type="radio" name="result" value={opt.value} checked={result === opt.value} onChange={e => setResult(e.target.value)} className="text-primary focus:ring-primary rounded-full w-5 h-5" />
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-primary rounded-[2rem] p-8 text-on-primary">
              <div className="flex items-center gap-2 mb-3 opacity-70">
                <span className="material-symbols-outlined text-sm">info</span>
                <span className="text-xs font-bold uppercase tracking-widest">Note</span>
              </div>
              <p className="text-sm font-medium leading-relaxed">
                Publishing the result will automatically update the points table and send notifications to all teams.
              </p>
            </div>
          </aside>
        </form>
      )}
      {scheduledMatches.length === 0 && <div className="text-center py-20 text-on-surface-variant">No scheduled matches left for score entry.</div>}
    </div>
  )
}
