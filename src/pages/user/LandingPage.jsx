import { Link } from 'react-router-dom'
import { mockSettings, mockTeams } from '../../data/mockData'

export default function LandingPage() {
  const approvedTeams = mockTeams.filter(t => t.status === 'approved').length
  const isRegistrationOpen = mockSettings.registration_open

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
            Season 2024 • Box Cricket
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-[-0.04em] text-on-surface leading-[0.95] mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Master Stroke<br />
            <span className="text-outline">Box Cricket</span>
          </h1>
          <p className="text-lg md:text-xl text-on-surface-variant leading-relaxed max-w-xl mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            The premier box cricket tournament experience. Register your team, compete against the best, and chase glory on the pitch.
          </p>
          <div className="flex flex-wrap gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            {isRegistrationOpen ? (
              <Link to="/register" className="primary-gradient text-on-primary px-8 py-4 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-xl">sports_cricket</span>
                Register Your Team
              </Link>
            ) : (
              <div className="bg-surface-container-high text-on-surface-variant px-8 py-4 rounded-xl font-bold flex items-center gap-2 cursor-not-allowed">
                <span className="material-symbols-outlined text-xl">lock</span>
                Registration Closed
              </div>
            )}
            <Link to="/info" className="bg-surface-container-lowest text-on-surface px-8 py-4 rounded-xl font-semibold border border-outline-variant/20 hover:bg-surface-container-low transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-xl">info</span>
              Tournament Info
            </Link>
          </div>
        </div>
      </section>

      {/* Tournament Info Bento Grid */}
      <section className="px-6 md:px-12 max-w-7xl mx-auto -mt-12 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Overview Card */}
          <div className="md:col-span-5 bg-surface-container-lowest rounded-[2rem] p-8 whisper-shadow hover:scale-[1.01] transition-transform">
            <span className="material-symbols-outlined text-primary mb-4 p-3 bg-primary-container/30 rounded-2xl inline-block">groups</span>
            <h3 className="text-4xl font-black tracking-tight mb-2">{approvedTeams} Teams</h3>
            <p className="text-on-surface-variant text-sm mb-6">Registered and competing across the tournament bracket.</p>
            <div className="flex gap-6">
              <div>
                <p className="text-2xl font-bold">T20</p>
                <p className="text-xs text-outline uppercase tracking-wider">Format</p>
              </div>
              <div>
                <p className="text-2xl font-bold">30</p>
                <p className="text-xs text-outline uppercase tracking-wider">Days</p>
              </div>
              <div>
                <p className="text-2xl font-bold">6</p>
                <p className="text-xs text-outline uppercase tracking-wider">Overs</p>
              </div>
            </div>
          </div>

          {/* Prize Card */}
          <div className="md:col-span-4 primary-gradient text-on-primary rounded-[2rem] p-8 relative overflow-hidden hover:scale-[1.01] transition-transform">
            <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-white/10 text-[120px]">trophy</span>
            <span className="material-symbols-outlined mb-4 text-3xl">military_tech</span>
            <h3 className="text-3xl font-bold tracking-tight mb-6">Glory Awaits</h3>
            <ul className="space-y-3 relative z-10">
              <li className="flex justify-between border-b border-white/10 pb-2">
                <span className="font-medium opacity-80">Champions</span>
                <span className="font-bold">🏆 Trophy + Prize</span>
              </li>
              <li className="flex justify-between border-b border-white/10 pb-2">
                <span className="font-medium opacity-80">Runners Up</span>
                <span className="font-bold">🥈 Medal + Cash</span>
              </li>
              <li className="flex justify-between">
                <span className="font-medium opacity-80">Best Player</span>
                <span className="font-bold">⭐ Special Award</span>
              </li>
            </ul>
          </div>

          {/* Date Card */}
          <div className="md:col-span-3 bg-secondary-container rounded-[2rem] p-8 flex flex-col justify-between hover:scale-[1.01] transition-transform">
            <span className="material-symbols-outlined text-secondary text-3xl mb-4">event</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-secondary-dim mb-2">Tournament Dates</p>
              <p className="text-2xl font-bold tracking-tight text-on-secondary-container">Oct 12 — Nov 10</p>
              <p className="text-sm text-on-secondary-container/70 mt-2">Weekends & Evenings</p>
            </div>
          </div>
        </div>
      </section>

      {/* Rules Section */}
      <section className="px-6 md:px-12 max-w-7xl mx-auto pb-24">
        <div className="mb-12">
          <span className="text-xs font-bold uppercase tracking-[0.15em] text-primary mb-3 block">Playing Conditions</span>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter">Tournament Rules</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { num: '01', title: 'Match Format', desc: '6-over box cricket format. Standard rules apply with box cricket modifications. Each team fields 6 players.' },
            { num: '02', title: 'Team Composition', desc: 'Maximum 8 players per team (6 playing + 2 substitutes). All players must be registered before the tournament begins.' },
            { num: '03', title: 'Fair Play', desc: 'Zero tolerance for unsportsmanlike conduct. Any violation leads to point deductions or disqualification from the tournament.' },
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
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3">Ready to Play?</h2>
            <p className="text-on-surface-variant text-lg">Assemble your squad and register before spots fill up.</p>
          </div>
          {isRegistrationOpen ? (
            <Link to="/register" className="primary-gradient text-on-primary px-10 py-4 rounded-xl font-bold shadow-xl hover:scale-[1.02] active:scale-95 transition-all whitespace-nowrap">
              Register Now →
            </Link>
          ) : (
            <Link to="/login" className="primary-gradient text-on-primary px-10 py-4 rounded-xl font-bold shadow-xl hover:scale-[1.02] active:scale-95 transition-all whitespace-nowrap">
              Team Login →
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}
