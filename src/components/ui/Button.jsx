const variantClasses = {
  primary:
    'primary-gradient text-on-primary shadow-lg hover:scale-[1.02] active:scale-95',
  secondary:
    'bg-surface-container-lowest text-on-surface border border-outline-variant/20 hover:bg-surface-container-low',
  ghost:
    'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface',
  danger:
    'bg-error text-on-error shadow-lg hover:scale-[1.02] active:scale-95',
  whatsapp:
    'bg-[#25D366] text-white hover:brightness-105 shadow-md',
}

const sizeClasses = {
  sm: 'px-4 py-2 text-sm rounded-lg',
  md: 'px-6 py-3 text-sm rounded-xl',
  lg: 'px-8 py-4 text-base rounded-xl',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  className = '',
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2
        font-bold transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant] || variantClasses.primary}
        ${sizeClasses[size] || sizeClasses.md}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `.trim()}
      {...props}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon && <span className="material-symbols-outlined text-lg">{icon}</span>
      )}
      {children}
    </button>
  )
}
