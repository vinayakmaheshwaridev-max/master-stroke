const variantConfig = {
  error: {
    containerClass: 'bg-error-container/20 border-error/20',
    icon: 'error',
    iconClass: 'text-error',
    textClass: 'text-error',
  },
  info: {
    containerClass: 'bg-secondary-container/30 border-outline-variant/10',
    icon: 'info',
    iconClass: 'text-on-secondary-container',
    textClass: 'text-on-secondary-container',
  },
  success: {
    containerClass: 'bg-tertiary-container/30 border-tertiary/20',
    icon: 'check_circle',
    iconClass: 'text-tertiary',
    textClass: 'text-tertiary',
  },
  warning: {
    containerClass: 'bg-status-pending-bg border-status-pending-text/20',
    icon: 'warning',
    iconClass: 'text-status-pending-text',
    textClass: 'text-status-pending-text',
  },
}

export default function Alert({
  children,
  variant = 'error',
  icon: customIcon,
  className = '',
}) {
  const config = variantConfig[variant] || variantConfig.error

  return (
    <div
      className={`
        p-4 rounded-2xl border flex items-start gap-3 animate-fade-in
        ${config.containerClass}
        ${className}
      `.trim()}
    >
      <span className={`material-symbols-outlined ${config.iconClass} mt-0.5`}>
        {customIcon || config.icon}
      </span>
      <div className={`text-sm font-medium leading-relaxed ${config.textClass}`}>
        {children}
      </div>
    </div>
  )
}
