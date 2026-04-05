import { Link } from 'react-router-dom'
import { useTranslation } from '../../i18n'

export default function Footer({ className = '' }) {
  const { t } = useTranslation()

  return (
    <footer className={`w-full py-12 mt-auto border-t border-stone-200/20 bg-stone-50 flex flex-col items-center justify-center text-center px-4 ${className}`}>
      <div className="flex flex-wrap justify-center gap-6 mb-4">
        <Link to="/info" className="text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors opacity-80">
          {t('footer.privacyPolicy')}
        </Link>
        <Link to="/info" className="text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors opacity-80">
          {t('footer.termsOfService')}
        </Link>
        <Link to="/info" className="text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors opacity-80">
          {t('footer.contactUs')}
        </Link>
        <Link to="/info" className="text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors opacity-80">
          {t('footer.support')}
        </Link>
      </div>
      <p className="text-xs text-zinc-400 tracking-wide">{t('common.copyright')}</p>
    </footer>
  )
}
