import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { teamService } from '../../services/teamService'
import { settingsService } from '../../services/settingsService'

const registrationSchema = z.object({
  team_name: z.string().min(2, 'Team name must be at least 2 characters').max(50),
  captain_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  age: z.coerce.number().min(18, 'Must be 18 or older').max(60, 'Age must be 60 or below'),
  mobile: z.string().regex(/^\d{10}$/, 'Enter a valid 10-digit mobile number'),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  agree_terms: z.literal(true, { errorMap: () => ({ message: 'You must accept the terms' }) }),
})

export default function RegistrationPage() {
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
      // Check if team name exists
      const exists = await teamService.checkTeamNameExists(data.team_name)
      if (exists) {
        setError('Team name already taken')
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
      setSubmitted(true)
    } catch (err) {
      setError('Registration failed: ' + err.message)
    }
  }

  if (loading) {
    return <div className="min-h-[80vh] flex items-center justify-center animate-pulse text-outline">Checking registration status...</div>
  }

  if (!isOpen) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-surface-container-high rounded-3xl flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-outline text-4xl">lock</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-3">Registration Closed</h1>
          <p className="text-on-surface-variant mb-8">The registration window has ended. Stay tuned for updates.</p>
          <Link to="/" className="primary-gradient text-on-primary px-6 py-3 rounded-xl font-semibold">Back to Home</Link>
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
          <h1 className="text-3xl font-black tracking-tight mb-3">Registration Submitted!</h1>
          <p className="text-on-surface-variant mb-4">Your team registration is being reviewed. You'll receive a confirmation and login credentials once approved.</p>
          <p className="text-sm text-outline mb-8">Typical review time: 24-48 hours</p>
          <Link to="/" className="primary-gradient text-on-primary px-6 py-3 rounded-xl font-semibold inline-flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">home</span>
            Back to Home
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
          <span className="text-xs font-bold uppercase tracking-[0.15em] text-primary mb-4">Join the Competition</span>
          <h1 className="text-5xl font-black tracking-[-0.03em] text-on-surface mb-6 leading-[1.05]">
            Register Your<br />Team Today
          </h1>
          <p className="text-lg text-on-surface-variant leading-relaxed mb-10 max-w-md">
            Secure your spot in the Master Stroke Box Cricket tournament. Fill out the form and our team will review your application.
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
            <h2 className="text-2xl font-extrabold tracking-tight mb-2">Team Registration</h2>
            <p className="text-sm text-on-surface-variant">All fields marked with * are required</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && <div className="p-4 bg-error-container text-on-error-container text-sm rounded-xl font-medium">{error}</div>}

            {/* Team Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant pl-1">Team Name *</label>
              <input {...register('team_name')} placeholder="Enter your team name" className={`w-full bg-surface-container-low border-none rounded-xl py-3.5 px-4 text-on-surface placeholder-outline focus:ring-4 focus:ring-primary-fixed-dim/30 transition-all ${errors.team_name ? 'ring-2 ring-error' : ''}`} />
              {errors.team_name && <p className="text-xs text-error pl-1">{errors.team_name.message}</p>}
            </div>

            {/* Captain Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant pl-1">Captain Name *</label>
              <input {...register('captain_name')} placeholder="Full name of team captain" className={`w-full bg-surface-container-low border-none rounded-xl py-3.5 px-4 text-on-surface placeholder-outline focus:ring-4 focus:ring-primary-fixed-dim/30 transition-all ${errors.captain_name ? 'ring-2 ring-error' : ''}`} />
              {errors.captain_name && <p className="text-xs text-error pl-1">{errors.captain_name.message}</p>}
            </div>

            {/* Age + Mobile */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant pl-1">Age *</label>
                <input {...register('age')} type="number" placeholder="18+" className={`w-full bg-surface-container-low border-none rounded-xl py-3.5 px-4 text-on-surface placeholder-outline focus:ring-4 focus:ring-primary-fixed-dim/30 transition-all ${errors.age ? 'ring-2 ring-error' : ''}`} />
                {errors.age && <p className="text-xs text-error pl-1">{errors.age.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant pl-1">Mobile *</label>
                <input {...register('mobile')} placeholder="10-digit number" className={`w-full bg-surface-container-low border-none rounded-xl py-3.5 px-4 text-on-surface placeholder-outline focus:ring-4 focus:ring-primary-fixed-dim/30 transition-all ${errors.mobile ? 'ring-2 ring-error' : ''}`} />
                {errors.mobile && <p className="text-xs text-error pl-1">{errors.mobile.message}</p>}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant pl-1">Email (Optional)</label>
              <input {...register('email')} type="email" placeholder="team@email.com" className="w-full bg-surface-container-low border-none rounded-xl py-3.5 px-4 text-on-surface placeholder-outline focus:ring-4 focus:ring-primary-fixed-dim/30 transition-all" />
              {errors.email && <p className="text-xs text-error pl-1">{errors.email.message}</p>}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3">
              <input {...register('agree_terms')} type="checkbox" className="mt-1 w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary/20" />
              <div>
                <p className="text-sm text-on-surface-variant">
                  I agree to the{' '}
                  <button type="button" onClick={() => setShowTerms(true)} className="text-primary font-semibold hover:underline">
                    Terms & Conditions
                  </button>
                </p>
                {errors.agree_terms && <p className="text-xs text-error">{errors.agree_terms.message}</p>}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full primary-gradient text-on-primary py-4 rounded-xl font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">send</span>
                  Submit Registration
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-outline mt-6">
            Already registered?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">Login here</Link>
          </p>
        </div>
      </div>

      {/* Terms Modal */}
      {showTerms && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowTerms(false)}>
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-[2rem] p-8 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Terms & Conditions</h3>
              <button onClick={() => setShowTerms(false)} className="p-2 hover:bg-surface-container rounded-full">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-4 text-sm text-on-surface-variant leading-relaxed">
              <p>By registering for the Master Stroke Box Cricket tournament, teams acknowledge and agree to all rules, safety protocols, and conditions set forth by the organizing committee.</p>
              <p>All players must be aged 18 or above. Valid identification may be requested at any point during the tournament.</p>
              <p>The organizing committee reserves the right to reschedule or cancel matches due to weather or venue issues without prior notice.</p>
              <p>Unsportsmanlike conduct will result in penalties including point deductions, match forfeits, or disqualification.</p>
              <p>Registration fees are non-refundable after team approval.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
