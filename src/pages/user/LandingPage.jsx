import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { teamService } from '../../services/teamService'
import { settingsService } from '../../services/settingsService'
import { useTranslation } from '../../i18n'
import { Button, Card } from '../../components/ui'

export default function LandingPage() {
  const { t } = useTranslation()
  const [approvedTeams, setApprovedTeams] = useState(0)
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [teams, status] = await Promise.all([
          teamService.getTeams('approved'),
          settingsService.getRegistrationStatus()
        ])
        setApprovedTeams(teams.length)
        setIsRegistrationOpen(status)
      } catch (err) {
        console.error('Error fetching landing data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center animate-pulse text-outline">{t('landing.loadingTournament')}</div>
  }

  return (
    <div className="bg-surface">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center px-6 md:px-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-stone-100 via-surface to-surface-container-low opacity-80" />
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
          <div className="w-full h-full" style={{ background: 'radial-gradient(circle at 70% 30%, #5f5e60 0%, transparent 60%)' }} />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto w-full py-20">
          <span className="inline-block px-4 py-1.5 bg-secondary-container text-on-secondary-container text-[10px] font-bold tracking-[0.15em] rounded-full uppercase mb-6 animate-fade-in">
            {t('landing.seasonBadge')}
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-[-0.04em] text-on-surface leading-[0.95] mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            {t('landing.heroTitle')}<br />
            <span className="text-outline">{t('landing.heroSubtitle')}</span>
          </h1>
          <p className="text-lg md:text-xl text-on-surface-variant leading-relaxed max-w-xl mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {t('landing.heroDescription')}
          </p>
          <div className="flex flex-wrap gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            {isRegistrationOpen ? (
              <Link to="/register" className="primary-gradient text-on-primary px-8 py-4 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-xl">sports_cricket</span>
                {t('landing.registerYourTeam')}
              </Link>
            ) : (
              <div className="bg-surface-container-high text-on-surface-variant px-8 py-4 rounded-xl font-bold flex items-center gap-2 cursor-not-allowed">
                <span className="material-symbols-outlined text-xl">lock</span>
                {t('landing.registrationClosed')}
              </div>
            )}
            <Link to="/info" className="bg-surface-container-lowest text-on-surface px-8 py-4 rounded-xl font-semibold border border-outline-variant/20 hover:bg-surface-container-low transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-xl">info</span>
              {t('landing.tournamentInfo')}
            </Link>
          </div>
        </div>
      </section>

      {/* Tournament Info Bento Grid */}
      <section className="px-6 md:px-12 max-w-7xl mx-auto -mt-12 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Overview Card */}
          <Card variant="default" hover className="md:col-span-5">
            <span className="material-symbols-outlined text-primary mb-4 p-3 bg-primary-container/30 rounded-2xl inline-block">groups</span>
            <h3 className="text-4xl font-black tracking-tight mb-2">{t('landing.teamsCount', { count: approvedTeams })}</h3>
            <p className="text-on-surface-variant text-sm mb-6">{t('landing.teamsDescription')}</p>
            <div className="flex gap-6">
              <div>
                <p className="text-2xl font-bold">{t('landing.formatValue')}</p>
                <p className="text-xs text-outline uppercase tracking-wider">{t('landing.format')}</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{t('landing.daysValue')}</p>
                <p className="text-xs text-outline uppercase tracking-wider">{t('landing.days')}</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{t('landing.oversValue')}</p>
                <p className="text-xs text-outline uppercase tracking-wider">{t('landing.overs')}</p>
              </div>
            </div>
          </Card>

          {/* Prize Card */}
          <Card variant="gradient" hover className="md:col-span-4 relative overflow-hidden">
            <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-white/10 text-[120px]">trophy</span>
            <span className="material-symbols-outlined mb-4 text-3xl">military_tech</span>
            <h3 className="text-3xl font-bold tracking-tight mb-6">{t('landing.gloryAwaits')}</h3>
            <ul className="space-y-3 relative z-10">
              <li className="flex justify-between border-b border-white/10 pb-2">
                <span className="font-medium opacity-80">{t('landing.champions')}</span>
                <span className="font-bold">{t('landing.championsReward')}</span>
              </li>
              <li className="flex justify-between border-b border-white/10 pb-2">
                <span className="font-medium opacity-80">{t('landing.runnersUp')}</span>
                <span className="font-bold">{t('landing.runnersUpReward')}</span>
              </li>
              <li className="flex justify-between">
                <span className="font-medium opacity-80">{t('landing.bestPlayer')}</span>
                <span className="font-bold">{t('landing.bestPlayerReward')}</span>
              </li>
            </ul>
          </Card>

          {/* Date Card */}
          <Card variant="secondary" hover className="md:col-span-3 flex flex-col justify-between">
            <span className="material-symbols-outlined text-secondary text-3xl mb-4">event</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-secondary-dim mb-2">{t('landing.tournamentDates')}</p>
              <p className="text-2xl font-bold tracking-tight text-on-secondary-container">{t('landing.dateRange')}</p>
              <p className="text-sm text-on-secondary-container/70 mt-2">{t('landing.weekendsEvenings')}</p>
            </div>
          </Card>
        </div>
      </section>

      {/* Rules Section */}
      <section className="px-6 md:px-12 max-w-7xl mx-auto pb-24">
        <div className="mb-12">
          <span className="text-xs font-bold uppercase tracking-[0.15em] text-primary mb-3 block">{t('landing.playingConditions')}</span>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter">{t('landing.tournamentRules')}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { num: '01', title: t('landing.rule01Title'), desc: t('landing.rule01Desc') },
            { num: '02', title: t('landing.rule02Title'), desc: t('landing.rule02Desc') },
            { num: '03', title: t('landing.rule03Title'), desc: t('landing.rule03Desc') },
          ].map(rule => (
            <div key={rule.num} className="group bg-surface-container-low rounded-[2rem] p-8 hover:bg-surface-container-lowest transition-all whisper-shadow">
              <span className="text-5xl font-black text-outline-variant/30 group-hover:text-secondary transition-colors">{rule.num}</span>
              <h3 className="text-xl font-bold mt-4 mb-3">{rule.title}</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">{rule.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 md:px-12 max-w-7xl mx-auto pb-24">
        <div className="bg-surface-container-highest rounded-[2.5rem] p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3">{t('landing.readyToPlay')}</h2>
            <p className="text-on-surface-variant text-lg">{t('landing.assembleCTA')}</p>
          </div>
          {isRegistrationOpen ? (
            <Link to="/register" className="primary-gradient text-on-primary px-10 py-4 rounded-xl font-bold shadow-xl hover:scale-[1.02] active:scale-95 transition-all whitespace-nowrap">
              {t('landing.registerNow')}
            </Link>
          ) : (
            <Link to="/login" className="primary-gradient text-on-primary px-10 py-4 rounded-xl font-bold shadow-xl hover:scale-[1.02] active:scale-95 transition-all whitespace-nowrap">
              {t('landing.teamLogin')}
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}
