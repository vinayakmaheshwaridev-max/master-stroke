import translations from './en.json'

/**
 * Lightweight translation hook.
 * Supports dot-notation keys and {placeholder} interpolation.
 *
 * Usage:
 *   const { t } = useTranslation()
 *   t('auth.loginTitle')
 *   t('dashboard.welcomeTeam', { teamName: 'Warriors' })
 */
export function useTranslation() {
  return { t }
}

/**
 * Get a translated string by dot-notation key.
 * Falls back to the key itself if not found.
 */
export function t(key, params) {
  let value = key.split('.').reduce((obj, k) => obj?.[k], translations)

  if (value === undefined || value === null) {
    // Fallback to key for development visibility
    return key
  }

  if (typeof value !== 'string') {
    return key
  }

  // Interpolation: replace {placeholder} with param values
  if (params) {
    Object.entries(params).forEach(([placeholder, replacement]) => {
      value = value.replace(new RegExp(`\\{${placeholder}\\}`, 'g'), replacement)
    })
  }

  return value
}

export default useTranslation
