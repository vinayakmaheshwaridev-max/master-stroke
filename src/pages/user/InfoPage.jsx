export default function InfoPage() {
  return (
    <div className="py-8 md:py-12 px-6 max-w-7xl mx-auto">
      {/* Hero */}
      <header className="mb-16 flex flex-col md:flex-row gap-10 items-end">
        <div className="md:w-2/3">
          <span className="text-xs font-bold uppercase tracking-[0.1em] text-outline mb-4 block">Official Guide</span>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-on-surface leading-[0.95] mb-6">
            Tournament<br />Protocols
          </h1>
          <p className="text-xl text-on-surface-variant leading-relaxed max-w-2xl">
            Everything you need to know about the Master Stroke Box Cricket championship. Rules, format, and essential information.
          </p>
        </div>
        <div className="md:w-1/3 w-full h-48 md:h-56 rounded-[2rem] overflow-hidden bg-surface-container-high">
          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary-container/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-[80px] text-outline-variant/20">sports_cricket</span>
          </div>
        </div>
      </header>

      {/* Bento Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Playing Conditions */}
        <section className="md:col-span-8 bg-surface-container-low rounded-[2rem] p-8 md:p-12 whisper-shadow">
          <div className="flex items-center gap-3 mb-8">
            <span className="material-symbols-outlined text-primary">gavel</span>
            <h2 className="text-2xl font-bold tracking-tight">Playing Conditions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-lg mb-2">01. Match Format</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">6-over box cricket format. Each team fields 6 players. Standard box cricket rules apply with boundaries defined by the box walls.</p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">02. Equipment</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">Official tournament balls and bats will be provided. Players must wear appropriate sports attire. No metal spikes allowed.</p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-lg mb-2">03. Player Conduct</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">Zero-tolerance for dissent or unsportsmanlike conduct. Any breach results in penalty runs, point deductions, or disqualification.</p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">04. Dispute Resolution</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">The umpire's decision is final. Disputes are escalated to the tournament committee whose decision is binding.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Prize Structure */}
        <section className="md:col-span-4 primary-gradient text-on-primary rounded-[2rem] p-8 md:p-10 flex flex-col justify-between">
          <div>
            <span className="material-symbols-outlined mb-4 text-4xl">military_tech</span>
            <h2 className="text-3xl font-bold tracking-tight mb-8">Prize<br />Pool</h2>
            <ul className="space-y-6">
              <li className="flex justify-between items-baseline border-b border-white/10 pb-4">
                <span className="font-medium">Champions</span>
                <span className="text-xl font-black">🏆 Trophy</span>
              </li>
              <li className="flex justify-between items-baseline border-b border-white/10 pb-4">
                <span className="font-medium">Runners Up</span>
                <span className="text-lg font-bold">🥈 Medal</span>
              </li>
              <li className="flex justify-between items-baseline">
                <span className="font-medium opacity-80 italic">Best Player</span>
                <span className="font-bold">⭐ Award</span>
              </li>
            </ul>
          </div>
          <div className="mt-10 text-xs opacity-60 uppercase tracking-widest">*Subject to tournament size</div>
        </section>

        {/* Fees */}
        <section className="md:col-span-5 bg-secondary-container rounded-[2rem] p-8 md:p-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-secondary">payments</span>
            <h2 className="text-2xl font-bold">Registration Fee</h2>
          </div>
          <div className="bg-surface/50 p-6 rounded-2xl mb-6">
            <div className="flex justify-between mb-3">
              <span className="text-on-surface-variant text-sm">Per Team</span>
              <span className="font-bold text-lg">Contact Admin</span>
            </div>
            <p className="text-xs text-on-surface-variant border-t border-secondary/10 pt-3 mt-3">
              Fee details and payment methods will be shared after registration approval.
            </p>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-secondary">Payment Methods</p>
            <div className="flex items-center gap-4 bg-white p-4 rounded-xl">
              <span className="material-symbols-outlined text-zinc-400">qr_code_2</span>
              <div>
                <p className="text-xs text-on-surface-variant">UPI / Bank Transfer</p>
                <p className="font-mono font-bold text-sm">Details shared post-approval</p>
              </div>
            </div>
          </div>
        </section>

        {/* Terms */}
        <section className="md:col-span-7 bg-surface-container-low rounded-[2rem] p-8 md:p-10 relative overflow-hidden">
          <h2 className="text-2xl font-bold mb-5">Terms of Participation</h2>
          <div className="space-y-4 max-h-56 overflow-y-auto pr-4 custom-scrollbar text-sm text-on-surface-variant leading-relaxed">
            <p>By registering, teams acknowledge all safety protocols and rules set forth by the organizing committee.</p>
            <p>The organizers reserve the right to reschedule or cancel matches due to weather, venue issues, or force majeure without prior consent.</p>
            <p>Any photographs or videos taken during the event may be used for promotional purposes.</p>
            <p>All players must provide valid ID proof if requested during the tournament.</p>
            <p>Registration fees are non-refundable after team approval. Cancellations prior to approval are fully refundable.</p>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-surface-container-low to-transparent pointer-events-none" />
        </section>

        {/* Contact */}
        <section className="md:col-span-12 bg-surface-container-highest rounded-[2rem] p-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-black tracking-tight mb-2">Need Assistance?</h2>
            <p className="text-on-surface-variant">Our team is available to help with any queries.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-surface p-4 px-6 rounded-full flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">mail</span>
              <span className="font-medium text-sm">contact@masterstroke.com</span>
            </div>
            <div className="bg-surface p-4 px-6 rounded-full flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">call</span>
              <span className="font-medium text-sm">+91 XXXXX XXXXX</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
