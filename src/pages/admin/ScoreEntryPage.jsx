import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { matchService } from '../../services/matchService'
import { notificationService } from '../../services/notificationService'
import { useTranslation } from '../../i18n'
import { Button, Select, Card } from '../../components/ui'
import { SectionLoader } from '../../components/ui/Spinner'

export default function ScoreEntryPage() {
  const { t } = useTranslation()
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
    if (!result) return alert(t('admin.scores.selectVerdict'))

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
      
      await notificationService.sendNotification(
        `Final Result: ${match.team_a.team_name} vs ${match.team_b.team_name} - ${summary}`,
        'result'
      )

      alert(t('admin.scores.resultPublished'))
      navigate('/admin/tournament')
    } catch (err) {
      alert(t('admin.scores.failedPublish') + err.message)
    }
  }

  if (loading) {
    return <SectionLoader message={t('admin.scores.loadingMatches')} />
  }

  return (
    <div className="p-8 md:p-12">
      <header className="mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.05em] text-on-surface-variant mb-2 block">{t('admin.scores.tournamentAdminLabel')}</span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-[-0.02em] text-on-surface">{t('admin.scores.scoreResultEntry')}</h1>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => navigate(-1)}>{t('common.discard')}</Button>
            <Button onClick={handlePublish}>{t('admin.scores.publishResult')}</Button>
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
        >
          {scheduledMatches.map(m => (
            <option key={m.id} value={m.id}>{t('common.match')} #{m.match_number}: {m.team_a?.team_name} vs {m.team_b?.team_name}</option>
          ))}
          {scheduledMatches.length === 0 && <option>{t('admin.scores.noScheduledMatches')}</option>}
        </Select>
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
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-1">{t('admin.scores.runs')}</label>
                  <input type="number" value={scoreA.runs} onChange={e => setScoreA(p => ({ ...p, runs: e.target.value }))} placeholder={t('admin.scores.placeholderRuns')} required className="w-full bg-surface-container-lowest border-outline-variant/20 focus:ring-4 focus:ring-primary/10 rounded-2xl p-4 text-2xl font-bold tracking-tight" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-1">{t('admin.scores.wickets')}</label>
                  <input type="number" value={scoreA.wickets} onChange={e => setScoreA(p => ({ ...p, wickets: e.target.value }))} placeholder={t('admin.scores.placeholderWickets')} min="0" max="10" required className="w-full bg-surface-container-lowest border-outline-variant/20 focus:ring-4 focus:ring-primary/10 rounded-2xl p-4 text-2xl font-bold tracking-tight" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-1">{t('admin.scores.overs')}</label>
                  <input type="number" step="0.1" value={scoreA.overs} onChange={e => setScoreA(p => ({ ...p, overs: e.target.value }))} placeholder={t('admin.scores.placeholderOvers')} required className="w-full bg-surface-container-lowest border-outline-variant/20 focus:ring-4 focus:ring-primary/10 rounded-2xl p-4 text-2xl font-bold tracking-tight" />
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
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-1">{t('admin.scores.runs')}</label>
                  <input type="number" value={scoreB.runs} onChange={e => setScoreB(p => ({ ...p, runs: e.target.value }))} placeholder={t('admin.scores.placeholderRuns')} required className="w-full bg-surface-container-lowest border-outline-variant/20 focus:ring-4 focus:ring-primary/10 rounded-2xl p-4 text-2xl font-bold tracking-tight" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-1">{t('admin.scores.wickets')}</label>
                  <input type="number" value={scoreB.wickets} onChange={e => setScoreB(p => ({ ...p, wickets: e.target.value }))} placeholder={t('admin.scores.placeholderWickets')} min="0" max="10" required className="w-full bg-surface-container-lowest border-outline-variant/20 focus:ring-4 focus:ring-primary/10 rounded-2xl p-4 text-2xl font-bold tracking-tight" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-1">{t('admin.scores.overs')}</label>
                  <input type="number" step="0.1" value={scoreB.overs} onChange={e => setScoreB(p => ({ ...p, overs: e.target.value }))} placeholder={t('admin.scores.placeholderOvers')} required className="w-full bg-surface-container-lowest border-outline-variant/20 focus:ring-4 focus:ring-primary/10 rounded-2xl p-4 text-2xl font-bold tracking-tight" />
                </div>
              </div>
            </section>

            {/* Match Details */}
            <Card variant="default" className="space-y-6">
              <h3 className="text-xl font-bold mb-4">{t('admin.scores.finalAssessment')}</h3>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-1">{t('admin.scores.manOfMatch')}</label>
                <input type="text" value={manOfMatch} onChange={e => setManOfMatch(e.target.value)} placeholder={t('admin.scores.placeholderPlayer')} className="w-full bg-surface-container-low border-none focus:ring-4 focus:ring-primary/10 rounded-2xl p-4" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-1">{t('admin.scores.matchSummary')}</label>
                <textarea value={summary} onChange={e => setSummary(e.target.value)} rows="3" placeholder={t('admin.scores.placeholderSummary')} className="w-full bg-surface-container-low border-none focus:ring-4 focus:ring-primary/10 rounded-2xl p-4 leading-relaxed" />
              </div>
            </Card>
          </div>

          {/* Right: Verdict */}
          <aside className="lg:col-span-4 space-y-6">
            <Card variant="default">
              <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-6">{t('admin.scores.matchVerdict')}</h3>
              <div className="space-y-3">
                {[
                  { value: 'team_a', label: t('admin.scores.teamWon', { team: match.team_a?.team_name }) },
                  { value: 'team_b', label: t('admin.scores.teamWon', { team: match.team_b?.team_name }) },
                  { value: 'tie', label: t('admin.scores.tieMatch') },
                  { value: 'no_result', label: t('admin.scores.noResult') },
                ].map(opt => (
                  <label key={opt.value} className="group flex items-center justify-between p-4 rounded-2xl bg-surface-container-low hover:bg-secondary-container transition-colors cursor-pointer">
                    <span className="font-semibold text-on-surface">{opt.label}</span>
                    <input type="radio" name="result" value={opt.value} checked={result === opt.value} onChange={e => setResult(e.target.value)} className="text-primary focus:ring-primary rounded-full w-5 h-5" />
                  </label>
                ))}
              </div>
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
      )}
      {scheduledMatches.length === 0 && <div className="text-center py-20 text-on-surface-variant">{t('admin.scores.noScoreEntry')}</div>}
    </div>
  )
}
