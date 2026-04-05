import { forwardRef } from 'react'

const Input = forwardRef(function Input(
  {
    label,
    icon,
    error,
    required,
    id,
    className = '',
    type = 'text',
    ...props
  },
  ref
) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-bold tracking-widest text-on-surface-variant uppercase pl-1"
        >
          {label}{required && ' *'}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-outline text-xl">
              {icon}
            </span>
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={`
            block w-full ${icon ? 'pl-11' : 'pl-4'} pr-4 py-3.5
            bg-surface-container-low border-none rounded-xl
            text-on-surface placeholder-outline
            focus:ring-4 focus:ring-primary-fixed-dim/30 transition-all
            ${error ? 'ring-2 ring-error' : ''}
            ${className}
          `.trim()}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-error pl-1">{error}</p>
      )}
    </div>
  )
})

export default Input
