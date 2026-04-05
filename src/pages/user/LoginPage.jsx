import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useTranslation } from '../../i18n'
import { Button, Input, Alert } from '../../components/ui'

export default function LoginPage() {
  const { t } = useTranslation()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      const result = await login(identifier, password)
      if (result.success) {
        navigate('/dashboard')
      } else {
        setError(result.error || t('auth.invalidCredentials'))
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
          {/* Logo */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-surface-container-highest rounded-xl mb-6 whisper-shadow">
              <span className="material-symbols-outlined text-primary text-3xl">sports_cricket</span>
            </div>
            <h1 className="font-headline font-extrabold text-3xl tracking-tighter text-on-surface mb-2">{t('common.appName')}</h1>
            <p className="text-on-surface-variant font-medium tracking-tight">{t('auth.teamPortalLogin')}</p>
          </div>

          {/* Login Card */}
          <div className="bg-surface-container-lowest rounded-3xl p-8 whisper-shadow">
            {error && (
              <div className="mb-6">
                <Alert variant="error">{error}</Alert>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label={t('auth.mobileOrEmail')}
                icon="person"
                id="identifier"
                type="text"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder={t('auth.placeholderEmail')}
                required
              />

              <div className="space-y-2">
                <div className="flex justify-between items-center pl-1">
                  <label className="block text-xs font-bold tracking-widest text-on-surface-variant uppercase" htmlFor="password">{t('auth.password')}</label>
                  <span className="text-xs font-semibold text-primary cursor-pointer hover:text-on-surface transition-colors">{t('auth.forgotPassword')}</span>
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
                    placeholder={t('auth.placeholderPassword')}
                    required
                    className="block w-full pl-11 pr-4 py-3.5 bg-surface-container-low border-none rounded-xl text-on-surface placeholder-outline focus:ring-4 focus:ring-primary-fixed-dim/30 transition-all"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  loading={loading}
                  fullWidth
                  size="lg"
                  icon={loading ? undefined : undefined}
                >
                  {loading ? null : (
                    <>
                      <span>{t('auth.accessDashboard')}</span>
                      <span className="material-symbols-outlined">login</span>
                    </>
                  )}
                </Button>
              </div>
            </form>

            <Alert variant="info" icon="info" className="mt-8">
              {t('auth.loginCredentialsHint')}
            </Alert>
          </div>

          {/* Links */}
          <div className="text-center mt-6 space-y-3">
            <p className="text-sm text-on-surface-variant">
              {t('auth.noCredentials')}{' '}
              <Link to="/register" className="text-primary font-semibold hover:underline">{t('auth.registerYourTeam')}</Link>
            </p>
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-base">arrow_back</span>
              {t('common.backToHome')}
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
