export default function Select({
  label,
  children,
  error,
  required,
  className = '',
  ...props
}) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-xs font-bold tracking-wide uppercase text-on-surface-variant ml-1">
          {label}{required && ' *'}
        </label>
      )}
      <select
        className={`
          w-full bg-surface-container-lowest border-none rounded-xl
          py-3 px-4 text-sm font-medium
          focus:ring-4 focus:ring-primary-fixed-dim/30 transition-all
          ${error ? 'ring-2 ring-error' : ''}
          ${className}
        `.trim()}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="text-xs text-error pl-1">{error}</p>
      )}
    </div>
  )
}
