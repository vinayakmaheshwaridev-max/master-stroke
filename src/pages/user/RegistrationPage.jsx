import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { teamService } from '../../services/teamService'
import { settingsService } from '../../services/settingsService'
import { useTranslation } from '../../i18n'
import { Button, Input, Alert, Modal, toast } from '../../components/ui'
import { SectionLoader } from '../../components/ui/Spinner'

const registrationSchema = z.object({
  team_name: z.string().min(2, 'Team name must be at least 2 characters').max(50),
  captain_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  age: z.coerce.number().min(18, 'Must be 18 or older').max(60, 'Age must be 60 or below'),
  mobile: z.string().regex(/^\d{10}$/, 'Enter a valid 10-digit mobile number'),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  agree_terms: z.literal(true, { errorMap: () => ({ message: 'You must accept the terms' }) }),
})

export default function RegistrationPage() {
  const { t } = useTranslation()
  const [submitted, setSubmitted] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [isOpen, setIsOpen] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function checkStatus() {
      try {
        const status = await settingsService.getRegistrationStatus()
        setIsOpen(status)
      } catch (err) {
        console.error('Error checking registration status:', err)
        toast.error(t('registration.failedCheckStatus') || 'Failed to check registration status')
      } finally {
        setLoading(false)
      }
    }
    checkStatus()
  }, [])

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registrationSchema),
    defaultValues: { team_name: '', captain_name: '', age: '', mobile: '', email: '', agree_terms: false },
  })

  const onSubmit = async (data) => {
    setError(null)
    try {
      const exists = await teamService.checkTeamNameExists(data.team_name)
      if (exists) {
        setError(t('registration.teamNameExists'))
        toast.error(t('registration.teamNameExists'))
        return
      }

      await teamService.registerTeam({
        team_name: data.team_name,
        captain_name: data.captain_name,
        age: data.age,
        mobile: data.mobile,
        email: data.email || null,
        status: 'pending',
        payment_done: false
      })
      toast.success(t('registration.registrationSuccess') || 'Registration submitted successfully!')
      setSubmitted(true)
    } catch (err) {
      const msg = t('registration.registrationFailed') + err.message
      setError(msg)
      toast.error(msg)
    }
  }

  if (loading) {
    return <SectionLoader message={t('registration.checkingStatus')} />
  }

  if (!isOpen) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-surface-container-high rounded-3xl flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-outline text-4xl">lock</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-3">{t('registration.registrationClosed')}</h1>
          <p className="text-on-surface-variant mb-8">{t('registration.closedDescription')}</p>
          <Button as={Link} to="/">{t('common.backToHome')}</Button>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6">
        <div className="text-center max-w-md animate-fade-in">
          <div className="w-20 h-20 bg-tertiary-container rounded-3xl flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-tertiary text-4xl">check_circle</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-3">{t('registration.registrationSubmitted')}</h1>
          <p className="text-on-surface-variant mb-4">{t('registration.submittedDescription')}</p>
          <p className="text-sm text-outline mb-8">{t('registration.reviewTime')}</p>
          <Link to="/" className="primary-gradient text-on-primary px-6 py-3 rounded-xl font-semibold inline-flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">home</span>
            {t('common.backToHome')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] py-12 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left: Editorial */}
        <div className="hidden lg:flex flex-col justify-center py-12">
          <span className="text-xs font-bold uppercase tracking-[0.15em] text-primary mb-4">{t('registration.joinCompetition')}</span>
          <h1 className="text-5xl font-black tracking-[-0.03em] text-on-surface mb-6 leading-[1.05]">
            {t('registration.registerYourTeamToday').split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}
          </h1>
          <p className="text-lg text-on-surface-variant leading-relaxed mb-10 max-w-md">
            {t('registration.formDescription')}
          </p>
          <div className="rounded-[2rem] overflow-hidden h-64 bg-surface-container-high">
            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary-container/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-[80px] text-outline-variant/30">sports_cricket</span>
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="bg-surface-container-lowest rounded-[2.5rem] p-8 md:p-10 whisper-shadow">
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold tracking-tight mb-2">{t('registration.teamRegistration')}</h2>
            <p className="text-sm text-on-surface-variant">{t('registration.allFieldsRequired')}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit, () => toast.error(t('registration.fixValidationErrors') || 'Please fill all required fields correctly'))} className="space-y-6">
            {error && <Alert variant="error">{error}</Alert>}

            <Input
              label={t('registration.teamName')}
              required
              error={errors.team_name?.message}
              {...register('team_name')}
            />

            <Input
              label={t('registration.captainName')}
              required
              error={errors.captain_name?.message}
              {...register('captain_name')}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t('registration.age')}
                required
                type="number"
                error={errors.age?.message}
                {...register('age')}
              />
              <Input
                label={t('registration.mobile')}
                required
                error={errors.mobile?.message}
                {...register('mobile')}
              />
            </div>

            <Input
              label={t('registration.emailOptional')}
              type="email"
              error={errors.email?.message}
              {...register('email')}
            />

            {/* Terms */}
            <div className="flex items-start gap-3">
              <input {...register('agree_terms')} type="checkbox" className="mt-1 w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary/20" />
              <div>
                <p className="text-sm text-on-surface-variant">
                  {t('registration.agreeToTerms')}{' '}
                  <button type="button" onClick={() => setShowTerms(true)} className="text-primary font-semibold hover:underline">
                    {t('registration.termsAndConditions')}
                  </button>
                </p>
                {errors.agree_terms && <p className="text-xs text-error">{errors.agree_terms.message}</p>}
              </div>
            </div>

            <Button type="submit" loading={isSubmitting} fullWidth size="lg" icon={isSubmitting ? undefined : 'send'}>
              {isSubmitting ? t('registration.submitting') : t('registration.submitRegistration')}
            </Button>
          </form>

          <p className="text-center text-xs text-outline mt-6">
            {t('auth.alreadyRegistered')}{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">{t('auth.loginHere')}</Link>
          </p>
        </div>
      </div>

      {/* Terms Modal */}
      <Modal open={showTerms} onClose={() => setShowTerms(false)} maxWidth="max-w-lg">
        <Modal.Body>
          <Modal.Header title={t('registration.termsAndConditions')} onClose={() => setShowTerms(false)} />
          <div className="space-y-4 text-sm text-on-surface-variant leading-relaxed">
            <p>{t('registration.termsContent.p1')}</p>
            <p>{t('registration.termsContent.p2')}</p>
            <p>{t('registration.termsContent.p3')}</p>
            <p>{t('registration.termsContent.p4')}</p>
            <p>{t('registration.termsContent.p5')}</p>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  )
}
