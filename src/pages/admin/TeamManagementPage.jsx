import { useEffect, useState } from 'react'
import { teamService } from '../../services/teamService'
import { useTranslation } from '../../i18n'
import { Badge, FilterPills, Button, Modal } from '../../components/ui'
import { SectionLoader } from '../../components/ui/Spinner'

export default function TeamManagementPage() {
  const { t } = useTranslation()
  const [filter, setFilter] = useState('all')
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [approvalModal, setApprovalModal] = useState(null)

  const fetchTeams = async () => {
    setLoading(true)
    try {
      const data = await teamService.getTeams('all')
      setTeams(data || [])
    } catch (err) {
      console.error('Error fetching teams:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeams()
  }, [])

  const filters = [
    { key: 'all', label: t('admin.teams.allTeams') },
    { key: 'pending', label: t('common.pending') },
    { key: 'approved', label: t('common.completed') },
    { key: 'rejected', label: 'Rejected' },
  ]
  const filtered = filter === 'all' ? teams : teams.filter(t => t.status === filter)

  const handleApprove = async (team) => {
    try {
      await teamService.updateTeam(team.id, { status: 'approved' })
      setTeams(prev => prev.map(t => t.id === team.id ? { ...t, status: 'approved' } : t))
      setApprovalModal(team)
    } catch (err) {
      alert(t('admin.teams.failedApprove'))
    }
  }

  const handleReject = async (teamId) => {
    try {
      await teamService.updateTeam(teamId, { status: 'rejected' })
      setTeams(prev => prev.map(t => t.id === teamId ? { ...t, status: 'rejected' } : t))
    } catch (err) {
      alert(t('admin.teams.failedReject'))
    }
  }

  const handlePayment = async (teamId, paid) => {
    try {
      await teamService.updateTeam(teamId, { payment_done: paid })
      setTeams(prev => prev.map(t => t.id === teamId ? { ...t, payment_done: paid } : t))
    } catch (err) {
      alert(t('admin.teams.failedPayment'))
    }
  }

  if (loading) {
    return <SectionLoader message={t('admin.teams.loadingTeams')} />
  }

  const headers = t('admin.teams.tableHeaders')

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 flex flex-col md:flex-row justify-between items-start md:items-center px-8 md:px-12 py-6 bg-stone-50/80 backdrop-blur-md gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-on-surface">{t('admin.teams.teamManagement')}</h2>
          <p className="text-sm text-outline-variant font-medium">{t('admin.teams.reviewDescription')}</p>
        </div>
        <button onClick={fetchTeams} className="p-2 border border-outline-variant/30 rounded-full hover:bg-surface-container transition-all">
            <span className="material-symbols-outlined">refresh</span>
        </button>
      </header>

      <div className="px-8 md:px-12 py-6">
        <FilterPills filters={filters} active={filter} onChange={setFilter} className="mb-6" />

        {/* Table */}
        <div className="bg-surface-container-lowest rounded-[2rem] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-surface-container-low/50">
                  {[headers.hash, headers.teamName, headers.captain, headers.mobile, headers.email, headers.age, headers.status, headers.paid, headers.actions].map(h => (
                    <th key={h} className={`px-5 py-4 text-[11px] font-bold uppercase tracking-widest text-outline-variant ${h === headers.actions ? 'text-right' : h === headers.status || h === headers.paid ? 'text-center' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low/30">
                {filtered.map((team, idx) => (
                  <tr key={team.id} className="hover:bg-surface-container-low/20 transition-colors">
                    <td className="px-5 py-5 text-sm text-outline-variant font-medium">{String(idx + 1).padStart(2, '0')}</td>
                    <td className="px-5 py-5 font-bold text-on-surface">{team.team_name}</td>
                    <td className="px-5 py-5 text-sm text-on-surface-variant">{team.captain_name}</td>
                    <td className="px-5 py-5 text-sm text-on-surface-variant font-mono">{team.mobile}</td>
                    <td className="px-5 py-5 text-sm text-on-surface-variant">{team.email || '—'}</td>
                    <td className="px-5 py-5 text-sm text-on-surface-variant">{team.age}</td>
                    <td className="px-5 py-5 text-center">
                      <Badge status={team.status}>{team.status}</Badge>
                    </td>
                    <td className="px-5 py-5 text-center">
                      <input type="checkbox" checked={team.payment_done} onChange={e => handlePayment(team.id, e.target.checked)} disabled={team.status === 'rejected'} className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary/20 disabled:opacity-30" />
                    </td>
                    <td className="px-5 py-5 text-right space-x-1">
                      {team.status === 'pending' && (
                        <>
                          <button onClick={() => handleApprove(team)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all" title="Approve">
                            <span className="material-symbols-outlined">check_circle</span>
                          </button>
                          <button onClick={() => handleReject(team.id)} className="p-2 text-error hover:bg-red-50 rounded-lg transition-all" title="Reject">
                            <span className="material-symbols-outlined">cancel</span>
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 bg-stone-50/50 flex justify-between items-center text-xs text-outline-variant font-medium">
            <span>{t('common.showing')} {filtered.length} {t('common.of')} {teams.length} {t('common.teams').toLowerCase()}</span>
          </div>
        </div>
      </div>

      {/* Approval Modal */}
      <Modal open={!!approvalModal} onClose={() => setApprovalModal(null)}>
        <Modal.Body>
          <Modal.Header
            title={t('admin.teams.teamApproved')}
            subtitle={t('admin.teams.credentialsGenerated')}
            onClose={() => setApprovalModal(null)}
          />
          {approvalModal && (
            <>
              <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 mb-6 space-y-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-outline-variant block mb-1">{t('admin.dashboard.team')}</label>
                  <p className="text-sm font-semibold text-on-surface">{approvalModal.team_name}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-outline-variant block mb-1">{t('admin.teams.loginEmail')}</label>
                  <p className="text-sm font-semibold text-on-surface">{approvalModal.email || approvalModal.mobile}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-outline-variant block mb-1">{t('admin.dashboard.statusCol')}</label>
                  <p className="text-sm font-mono font-bold text-on-surface bg-white px-3 py-1 inline-block rounded shadow-sm">{t('admin.teams.readyForLogin')}</p>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Button variant="whatsapp" fullWidth size="lg">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                  {t('admin.teams.inquireAboutLogin')}
                </Button>
                <Button
                  variant="secondary"
                  fullWidth
                  size="lg"
                  icon="content_copy"
                  onClick={() => navigator.clipboard?.writeText(`Email: ${approvalModal.email}\nMobile: ${approvalModal.mobile}`)}
                >
                  {t('common.copyDetails')}
                </Button>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>
    </div>
  )
}
