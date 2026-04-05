import { useTranslation } from '../../i18n'
import { Card } from '../../components/ui'

export default function InfoPage() {
  const { t } = useTranslation()

  return (
    <div className="py-8 md:py-12 px-6 max-w-7xl mx-auto">
      {/* Hero */}
      <header className="mb-16 flex flex-col md:flex-row gap-10 items-end">
        <div className="md:w-2/3">
          <span className="text-xs font-bold uppercase tracking-[0.1em] text-outline mb-4 block">{t('info.officialGuide')}</span>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-on-surface leading-[0.95] mb-6">
            {t('info.tournamentProtocols').split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}
          </h1>
          <p className="text-xl text-on-surface-variant leading-relaxed max-w-2xl">
            {t('info.infoDescription')}
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
            <h2 className="text-2xl font-bold tracking-tight">{t('info.playingConditions')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-lg mb-2">{t('info.matchFormat')}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{t('info.matchFormatDesc')}</p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">{t('info.equipment')}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{t('info.equipmentDesc')}</p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-lg mb-2">{t('info.playerConduct')}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{t('info.playerConductDesc')}</p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">{t('info.disputeResolution')}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{t('info.disputeResolutionDesc')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Prize Structure */}
        <Card variant="gradient" className="md:col-span-4 flex flex-col justify-between">
          <div>
            <span className="material-symbols-outlined mb-4 text-4xl">military_tech</span>
            <h2 className="text-3xl font-bold tracking-tight mb-8">{t('info.prizePool').split('\n').map((line,i) => <span key={i}>{line}<br /></span>)}</h2>
            <ul className="space-y-6">
              <li className="flex justify-between items-baseline border-b border-white/10 pb-4">
                <span className="font-medium">{t('landing.champions')}</span>
                <span className="text-xl font-black">{t('info.championsTrophy')}</span>
              </li>
              <li className="flex justify-between items-baseline border-b border-white/10 pb-4">
                <span className="font-medium">{t('landing.runnersUp')}</span>
                <span className="text-lg font-bold">{t('info.runnersMedal')}</span>
              </li>
              <li className="flex justify-between items-baseline">
                <span className="font-medium opacity-80 italic">{t('landing.bestPlayer')}</span>
                <span className="font-bold">{t('info.bestPlayerAward')}</span>
              </li>
            </ul>
          </div>
          <div className="mt-10 text-xs opacity-60 uppercase tracking-widest">{t('info.subjectToSize')}</div>
        </Card>

        {/* Fees */}
        <Card variant="secondary" className="md:col-span-5 p-8 md:p-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-secondary">payments</span>
            <h2 className="text-2xl font-bold">{t('info.registrationFee')}</h2>
          </div>
          <div className="bg-surface/50 p-6 rounded-2xl mb-6">
            <div className="flex justify-between mb-3">
              <span className="text-on-surface-variant text-sm">{t('info.perTeam')}</span>
              <span className="font-bold text-lg">{t('info.contactAdmin')}</span>
            </div>
            <p className="text-xs text-on-surface-variant border-t border-secondary/10 pt-3 mt-3">
              {t('info.feeDetails')}
            </p>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-secondary">{t('info.paymentMethods')}</p>
            <div className="flex items-center gap-4 bg-white p-4 rounded-xl">
              <span className="material-symbols-outlined text-zinc-400">qr_code_2</span>
              <div>
                <p className="text-xs text-on-surface-variant">{t('info.upiTransfer')}</p>
                <p className="font-mono font-bold text-sm">{t('info.detailsPostApproval')}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Terms */}
        <section className="md:col-span-7 bg-surface-container-low rounded-[2rem] p-8 md:p-10 relative overflow-hidden">
          <h2 className="text-2xl font-bold mb-5">{t('info.termsOfParticipation')}</h2>
          <div className="space-y-4 max-h-56 overflow-y-auto pr-4 custom-scrollbar text-sm text-on-surface-variant leading-relaxed">
            <p>{t('info.terms.p1')}</p>
            <p>{t('info.terms.p2')}</p>
            <p>{t('info.terms.p3')}</p>
            <p>{t('info.terms.p4')}</p>
            <p>{t('info.terms.p5')}</p>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-surface-container-low to-transparent pointer-events-none" />
        </section>

        {/* Contact */}
        <section className="md:col-span-12 bg-surface-container-highest rounded-[2rem] p-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-black tracking-tight mb-2">{t('info.needAssistance')}</h2>
            <p className="text-on-surface-variant">{t('info.assistanceDescription')}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-surface p-4 px-6 rounded-full flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">mail</span>
              <span className="font-medium text-sm">{t('info.email')}</span>
            </div>
            <div className="bg-surface p-4 px-6 rounded-full flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">call</span>
              <span className="font-medium text-sm">{t('info.phone')}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
