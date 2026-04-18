import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '../../stores/authStore'
import { useTranslation } from '../../i18n'
import { Button, Input, Alert, toast } from '../../components/ui'

const adminLoginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

export default function AdminLoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { adminLogin } = useAuthStore()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (data) => {
    setError('')
    setLoading(true)
    try {
      const result = await adminLogin(data.email, data.password)
      if (result.success) {
        toast.success(t('auth.welcomeAdmin') || 'Welcome, Admin!')
        navigate('/admin/dashboard')
      } else {
        const msg = result.error || t('auth.invalidAdminCredentials')
        setError(msg)
        toast.error(msg)
      }
    } catch (err) {
      setError(err.message)
      toast.error(err.message)
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
            <h1 className="font-headline font-extrabold text-3xl tracking-tighter text-on-surface mb-2">{t('common.appName')}</h1>
            <p className="text-on-surface-variant font-medium tracking-tight">{t('auth.adminAccessPortal')}</p>
          </div>

          <div className="bg-surface-container-lowest rounded-3xl p-8 whisper-shadow">
            {error && (
              <div className="mb-6">
                <Alert variant="error">{error}</Alert>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
              <Input
                label={t('auth.emailAddress')}
                icon="alternate_email"
                type="email"
                {...register('email')}
                error={errors.email?.message}
              />

              <Input
                label={t('auth.password')}
                icon="key"
                type="password"
                {...register('password')}
                error={errors.password?.message}
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  loading={loading}
                  fullWidth
                  size="lg"
                >
                  {loading ? null : (
                    <>
                      <span>{t('auth.authorizeSession')}</span>
                      <span className="material-symbols-outlined">login</span>
                    </>
                  )}
                </Button>
              </div>
            </form>

            <Alert variant="info" icon="verified_user" className="mt-8">
              {t('auth.adminAccessHint')}
            </Alert>
          </div>

          <div className="text-center mt-6">
            <a href="/" className="inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-base">arrow_back</span>
              {t('common.backToTournament')}
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
