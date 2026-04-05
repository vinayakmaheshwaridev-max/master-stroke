const variantClasses = {
  default:
    'bg-surface-container-lowest rounded-[2rem] p-8 whisper-shadow',
  flat:
    'bg-surface-container-low rounded-[2rem] p-8',
  elevated:
    'bg-surface-container-lowest rounded-[2rem] p-8 shadow-sm border border-on-surface/5',
  gradient:
    'primary-gradient text-on-primary rounded-[2rem] p-8',
  secondary:
    'bg-secondary-container rounded-[2rem] p-8',
}

export default function Card({
  children,
  variant = 'default',
  hover = false,
  className = '',
  ...props
}) {
  return (
    <div
      className={`
        ${variantClasses[variant] || variantClasses.default}
        ${hover ? 'hover:scale-[1.01] transition-transform' : ''}
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </div>
  )
}
