import { useState } from 'react'
import { mockTeams } from '../../data/mockData'

export default function TeamManagementPage() {
  const [filter, setFilter] = useState('all')
  const [teams, setTeams] = useState(mockTeams)
  const [approvalModal, setApprovalModal] = useState(null)

  const filters = ['all', 'pending', 'approved', 'rejected']
  const filtered = filter === 'all' ? teams : teams.filter(t => t.status === filter)

  const handleApprove = (team) => {
    setTeams(prev => prev.map(t => t.id === team.id ? { ...t, status: 'approved' } : t))
    setApprovalModal(team)
  }

  const handleReject = (teamId) => {
    setTeams(prev => prev.map(t => t.id === teamId ? { ...t, status: 'rejected' } : t))
  }

  const handlePayment = (teamId, paid) => {
    setTeams(prev => prev.map(t => t.id === teamId ? { ...t, payment_done: paid } : t))
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 flex flex-col md:flex-row justify-between items-start md:items-center px-8 md:px-12 py-6 bg-stone-50/80 backdrop-blur-md gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-on-surface">Team Management</h2>
          <p className="text-sm text-outline-variant font-medium">Review and manage team registrations</p>
        </div>
      </header>

      <div className="px-8 md:px-12 py-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-5 py-2 rounded-full text-sm font-semibold capitalize transition-colors ${filter === f ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-low text-on-surface hover:bg-surface-container'}`}>
              {f === 'all' ? 'All Teams' : f}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-surface-container-lowest rounded-[2rem] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-surface-container-low/50">
                  {['#', 'Team Name', 'Captain', 'Mobile', 'Email', 'Age', 'Status', 'Paid', 'Actions'].map(h => (
                    <th key={h} className={`px-5 py-4 text-[11px] font-bold uppercase tracking-widest text-outline-variant ${h === 'Actions' ? 'text-right' : h === 'Status' || h === 'Paid' ? 'text-center' : ''}`}>{h}</th>
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
                      <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        team.status === 'approved' ? 'bg-green-100 text-green-700' :
                        team.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>{team.status}</span>
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
            <span>Showing {filtered.length} of {teams.length} teams</span>
          </div>
        </div>
      </div>

      {/* Approval Modal */}
      {approvalModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setApprovalModal(null)}>
          <div className="bg-surface-container-lowest w-full max-w-md rounded-[2.5rem] whisper-shadow overflow-hidden animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-extrabold tracking-tight text-on-surface">Team Approved ✓</h3>
                  <p className="text-sm text-outline-variant mt-1">Credentials generated</p>
                </div>
                <button onClick={() => setApprovalModal(null)} className="p-2 hover:bg-surface-container rounded-full text-outline-variant">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 mb-6 space-y-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-outline-variant block mb-1">Team</label>
                  <p className="text-sm font-semibold text-on-surface">{approvalModal.team_name}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-outline-variant block mb-1">Login Mobile</label>
                  <p className="text-sm font-semibold text-on-surface">{approvalModal.mobile}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-outline-variant block mb-1">Temporary Password</label>
                  <p className="text-sm font-mono font-bold text-on-surface bg-white px-3 py-1 inline-block rounded shadow-sm">MSB-{Math.random().toString(36).slice(2, 8).toUpperCase()}</p>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <button className="w-full bg-[#25D366] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:brightness-105 transition-all shadow-md">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                  Share on WhatsApp
                </button>
                <button onClick={() => navigator.clipboard?.writeText(`Mobile: ${approvalModal.mobile}\nPassword: test123`)} className="w-full bg-surface-container-high text-on-surface-variant py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-surface-variant transition-all">
                  <span className="material-symbols-outlined text-lg">content_copy</span>
                  Copy Credentials
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
