import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { adminLogin } = useAuthStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await adminLogin(email, password)
      if (result.success) {
        navigate('/admin/dashboard')
      } else {
        setError(result.error || 'Invalid admin credentials')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <main className="flex-grow flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-surface-container-highest rounded-xl mb-6 whisper-shadow">
              <span className="material-symbols-outlined text-primary text-3xl">lock</span>
            </div>
            <h1 className="font-headline font-extrabold text-3xl tracking-tighter text-on-surface mb-2">Master Stroke</h1>
            <p className="text-on-surface-variant font-medium tracking-tight">Administrative Access Portal</p>
          </div>

          <div className="bg-surface-container-lowest rounded-3xl p-8 whisper-shadow">
            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-error-container/20 border border-error/20 flex items-center gap-3 animate-fade-in">
                <span className="material-symbols-outlined text-error">error</span>
                <p className="text-sm text-error font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold tracking-widest text-on-surface-variant uppercase pl-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline text-xl">alternate_email</span>
                  </div>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@masterstroke.com" required className="block w-full pl-11 pr-4 py-4 bg-surface-container-low border-none rounded-xl text-on-surface placeholder-outline focus:ring-4 focus:ring-primary-fixed-dim/30 transition-all" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold tracking-widest text-on-surface-variant uppercase pl-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline text-xl">key</span>
                  </div>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••••••" required className="block w-full pl-11 pr-4 py-4 bg-surface-container-low border-none rounded-xl text-on-surface placeholder-outline focus:ring-4 focus:ring-primary-fixed-dim/30 transition-all" />
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" disabled={loading} className="w-full primary-gradient text-on-primary font-bold py-4 rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><span>Authorize Session</span><span className="material-symbols-outlined">login</span></>}
                </button>
              </div>
            </form>

            <div className="mt-8 flex items-start gap-3 p-4 bg-secondary-container/30 rounded-2xl border border-outline-variant/10">
              <span className="material-symbols-outlined text-on-secondary-container text-lg mt-0.5">verified_user</span>
              <p className="text-xs text-on-secondary-container leading-relaxed">
                This area is restricted to authorized personnel only. All access attempts are logged.
              </p>
            </div>
          </div>

          <div className="text-center mt-6">
            <a href="/" className="inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Back to Tournament
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
