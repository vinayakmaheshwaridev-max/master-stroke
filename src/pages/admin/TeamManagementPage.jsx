import { useEffect, useState } from 'react'
import { teamService } from '../../services/teamService'
import { useTranslation } from '../../i18n'
import { Badge, FilterPills, Button, Modal, toast } from '../../components/ui'
import { SectionLoader } from '../../components/ui/Spinner'

export default function TeamManagementPage() {
  const { t } = useTranslation()
  const [filter, setFilter] = useState('all')
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [approvalModal, setApprovalModal] = useState(null)
  const [paymentModal, setPaymentModal] = useState(null)
  const [actionModal, setActionModal] = useState(null)
  const [editingPassword, setEditingPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [passwordUpdating, setPasswordUpdating] = useState(false)

  const fetchTeams = async () => {
    setLoading(true)
    try {
      const data = await teamService.getTeams('all')
      setTeams(data || [])
    } catch (err) {
      console.error('Error fetching teams:', err)
      toast.error(t('admin.teams.failedLoadTeams') || 'Failed to load teams')
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

  const confirmAction = (team, action) => {
    setActionModal({ team, action })
  }

  const handleActionConfirm = () => {
    if (!actionModal) return
    if (actionModal.action === 'approve') {
      handleApprove(actionModal.team)
    } else if (actionModal.action === 'reject') {
      handleReject(actionModal.team.id)
    }
    setActionModal(null)
  }

  const handleApprove = async (team) => {
    try {
      const generatedPassword = Math.random().toString(36).slice(-8)
      
      // We pass the generated password via teamService
      // (This assumes you will either update the Supabase 'teams' table to have a "password" column
      // or teamService.approveTeam will handle the logic internally)
      const approvedTeam = await teamService.approveTeam(team, generatedPassword)
      
      setTeams(prev => prev.map(t => t.id === team.id ? { ...approvedTeam } : t))
      setApprovalModal(approvedTeam)
      toast.success(t('admin.teams.teamApprovedSuccess') || `Team "${team.team_name}" approved successfully`)
    } catch (err) {
      toast.error(t('admin.teams.failedApprove') + (err.message ? ': ' + err.message : ''))
      console.error(err)
    }
  }

  const handleReject = async (teamId) => {
    try {
      await teamService.updateTeam(teamId, { status: 'rejected' })
      setTeams(prev => prev.map(t => t.id === teamId ? { ...t, status: 'rejected' } : t))
      toast.success(t('admin.teams.teamRejectedSuccess') || 'Team rejected')
    } catch (err) {
      toast.error(t('admin.teams.failedReject'))
    }
  }

  const confirmPaymentToggle = (teamId, isPaid) => {
    setPaymentModal({ teamId, isPaid })
  }

  const handlePaymentConfirm = async () => {
    if (!paymentModal) return
    try {
      const { teamId, isPaid } = paymentModal
      await teamService.updateTeam(teamId, { payment_done: isPaid })
      setTeams(prev => prev.map(t => t.id === teamId ? { ...t, payment_done: isPaid } : t))
      setPaymentModal(null)
      toast.success(isPaid ? (t('admin.teams.paymentMarkedDone') || 'Payment marked as done') : (t('admin.teams.paymentMarkedPending') || 'Payment marked as pending'))
    } catch (err) {
      toast.error(t('admin.teams.failedPayment'))
    }
  }

  if (loading) {
    return <SectionLoader message={t('admin.teams.loadingTeams')} />
  }

  const tableHeaders = [
    t('admin.teams.tableHeaders.hash'),
    t('admin.teams.tableHeaders.teamName'),
    t('admin.teams.tableHeaders.captain'),
    t('admin.teams.tableHeaders.mobile'),
    t('admin.teams.tableHeaders.email'),
    t('admin.teams.tableHeaders.age'),
    t('admin.teams.tableHeaders.status'),
    t('admin.teams.tableHeaders.paid'),
    t('admin.teams.tableHeaders.actions'),
    t('admin.teams.tableHeaders.password')
  ]
  const actionHeader = t('admin.teams.tableHeaders.actions')
  const statusHeader = t('admin.teams.tableHeaders.status')
  const paidHeader = t('admin.teams.tableHeaders.paid')
  const passwordHeader = t('admin.teams.tableHeaders.password')

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
                <tr className="bg-primary text-on-primary">
                  {tableHeaders.map((h, i) => (
                    <th key={i} className={`px-5 py-4 text-[11px] font-bold uppercase tracking-widest ${h === actionHeader || h === passwordHeader ? 'text-right' : h === statusHeader || h === paidHeader ? 'text-center' : ''}`}>{h}</th>
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
                      <input type="checkbox" checked={team.payment_done} onChange={e => confirmPaymentToggle(team.id, e.target.checked)} disabled={team.status === 'rejected'} className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary/20 disabled:opacity-30" />
                    </td>
                    <td className="px-5 py-5 text-right space-x-1">
                      <button 
                        onClick={() => confirmAction(team, 'approve')} 
                        disabled={team.status === 'approved'}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed" 
                        title="Approve">
                        <span className="material-symbols-outlined">check_circle</span>
                      </button>
                      <button 
                        onClick={() => confirmAction(team, 'reject')} 
                        disabled={team.status === 'rejected'}
                        className="p-2 text-error hover:bg-red-50 rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed" 
                        title="Reject">
                        <span className="material-symbols-outlined">cancel</span>
                      </button>
                    </td>
                    <td className="px-5 py-5 text-right space-x-1">
                      <button onClick={() => setApprovalModal(team)} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-all" title="View Credentials">
                        <span className="material-symbols-outlined">key</span>
                      </button>
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
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-outline-variant block">{t('admin.teams.tableHeaders.password')}</label>
                    {!editingPassword && (
                      <button onClick={() => { setEditingPassword(true); setNewPassword('') }} className="text-primary hover:text-primary-dim flex items-center transition-all bg-primary/10 px-2 py-0.5 rounded">
                        <span className="material-symbols-outlined text-[12px] mr-1">edit</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider">Reset</span>
                      </button>
                    )}
                  </div>
                  {editingPassword ? (
                    <div className="flex gap-2 items-center">
                      <input 
                        type="text" 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} 
                        className="text-sm font-mono font-semibold text-on-surface bg-white px-3 py-1.5 rounded border border-outline-variant/40 shadow-inner w-full outline-primary focus:border-primary transition-all"
                        placeholder="Enter new password..."
                      />
                      <button 
                        onClick={async () => {
                          if (!newPassword.trim()) return
                          setPasswordUpdating(true)
                          try {
                            const updatedUser = await teamService.updateTeamPassword(approvalModal, newPassword)
                            setApprovalModal(updatedUser)
                            setTeams(prev => prev.map(t => t.id === updatedUser.id ? updatedUser : t))
                            setEditingPassword(false)
                            toast.success(t('admin.teams.passwordUpdated') || 'Password updated successfully')
                          } catch (err) {
                            toast.error((t('admin.teams.failedPasswordUpdate') || 'Failed to update password') + ': ' + err.message)
                          } finally {
                            setPasswordUpdating(false)
                          }
                        }}
                        disabled={passwordUpdating}
                        className="p-1.5 bg-primary text-on-primary rounded hover:bg-primary-dim disabled:opacity-50 transition-all shadow-sm flex-shrink-0"
                      >
                        <span className="material-symbols-outlined text-sm">{passwordUpdating ? 'hourglass_empty' : 'check'}</span>
                      </button>
                      <button onClick={() => setEditingPassword(false)} className="p-1.5 bg-surface-variant text-on-surface-variant rounded hover:bg-outline-variant/30 transition-all flex-shrink-0">
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  ) : (
                    <div className="bg-white px-3 py-1.5 inline-flex items-center rounded border border-outline-variant/20 shadow-sm gap-2">
                      <span className="text-sm font-mono font-bold tracking-[0.2em] text-on-surface">
                        {approvalModal._tempPassword ? approvalModal._tempPassword : '••••••••'}
                      </span>
                      {!approvalModal._tempPassword && (
                        <span className="text-[10px] uppercase tracking-wider font-bold text-outline bg-surface-container px-1.5 py-0.5 rounded">Encrypted</span>
                      )}
                    </div>
                  )}
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
                  onClick={() => { navigator.clipboard?.writeText(`Hi ${approvalModal.captain_name},\nYour team '${approvalModal.team_name}' has been approved for Master Stroke Box Cricket!\n\nHere are your login credentials:\nEmail/Mobile: ${approvalModal.email || approvalModal.mobile}\nPassword: ${approvalModal._tempPassword || '[Encrypted - Please Reset if Lost]'}\n\nPlease login to the team portal to check your schedule.`); toast.success(t('admin.teams.credentialsCopied') || 'Credentials copied to clipboard') }}
                >
                  {t('common.copyDetails')}
                </Button>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>

      {/* Payment Confirmation Modal */}
      <Modal open={!!paymentModal} onClose={() => setPaymentModal(null)}>
        <Modal.Body>
          <Modal.Header
            title="Confirm Payment Status"
            subtitle={paymentModal?.isPaid ? "Mark this team's payment as done?" : "Reverse this team's payment status to unpaid?"}
            onClose={() => setPaymentModal(null)}
          />
          <div className="flex gap-3 pt-6">
            <Button variant="secondary" fullWidth size="lg" onClick={() => setPaymentModal(null)}>Cancel</Button>
            <Button variant="primary" fullWidth size="lg" onClick={handlePaymentConfirm}>Confirm</Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Action Confirmation Modal */}
      <Modal open={!!actionModal} onClose={() => setActionModal(null)}>
        <Modal.Body>
          <Modal.Header
            title="Confirm Action"
            subtitle={`Are you sure you want to ${actionModal?.action} this team?`}
            onClose={() => setActionModal(null)}
          />
          <div className="flex gap-3 pt-6">
            <Button variant="secondary" fullWidth size="lg" onClick={() => setActionModal(null)}>Cancel</Button>
            <Button variant="primary" fullWidth size="lg" onClick={handleActionConfirm}>Confirm</Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  )
}
