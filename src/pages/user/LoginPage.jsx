import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

export default function LoginPage() {
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    const result = await login(mobile, password)
    setLoading(false)
    
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <main className="flex-grow flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-surface-container-highest rounded-xl mb-6 whisper-shadow">
              <span className="material-symbols-outlined text-primary text-3xl">sports_cricket</span>
            </div>
            <h1 className="font-headline font-extrabold text-3xl tracking-tighter text-on-surface mb-2">Master Stroke</h1>
            <p className="text-on-surface-variant font-medium tracking-tight">Team Portal Login</p>
          </div>

          {/* Login Card */}
          <div className="bg-surface-container-lowest rounded-3xl p-8 whisper-shadow">
            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-error-container/20 border border-error/20 flex items-center gap-3 animate-fade-in">
                <span className="material-symbols-outlined text-error">error</span>
                <p className="text-sm text-error font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Mobile */}
              <div className="space-y-2">
                <label className="block text-xs font-bold tracking-widest text-on-surface-variant uppercase pl-1" htmlFor="mobile">Mobile Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline text-xl">phone_android</span>
                  </div>
                  <input
                    id="mobile"
                    type="tel"
                    value={mobile}
                    onChange={e => setMobile(e.target.value)}
                    placeholder="Enter 10-digit mobile"
                    required
                    className="block w-full pl-11 pr-4 py-4 bg-surface-container-low border-none rounded-xl text-on-surface placeholder-outline focus:ring-4 focus:ring-primary-fixed-dim/30 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center pl-1">
                  <label className="block text-xs font-bold tracking-widest text-on-surface-variant uppercase" htmlFor="password">Password</label>
                  <span className="text-xs font-semibold text-primary cursor-pointer hover:text-on-surface transition-colors">Forgot Password?</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline text-xl">key</span>
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="block w-full pl-11 pr-4 py-4 bg-surface-container-low border-none rounded-xl text-on-surface placeholder-outline focus:ring-4 focus:ring-primary-fixed-dim/30 transition-all"
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full primary-gradient text-on-primary font-bold py-4 rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Access Dashboard</span>
                      <span className="material-symbols-outlined">login</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Info Notice */}
            <div className="mt-8 flex items-start gap-3 p-4 bg-secondary-container/30 rounded-2xl border border-outline-variant/10">
              <span className="material-symbols-outlined text-on-secondary-container text-lg mt-0.5">info</span>
              <p className="text-xs text-on-secondary-container leading-relaxed">
                Use the credentials shared by the tournament admin via WhatsApp after your team was approved.
              </p>
            </div>
          </div>

          {/* Links */}
          <div className="text-center mt-6 space-y-3">
            <p className="text-sm text-on-surface-variant">
              Don't have credentials?{' '}
              <Link to="/register" className="text-primary font-semibold hover:underline">Register your team</Link>
            </p>
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
