export function Spinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-[1.5px]',
    md: 'w-5 h-5 border-2',
    lg: 'w-8 h-8 border-2',
  }

  return (
    <div
      className={`
        ${sizeClasses[size] || sizeClasses.md}
        border-current border-t-transparent rounded-full animate-spin
        ${className}
      `.trim()}
    />
  )
}

export function PageLoader({ message }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" className="text-primary" />
        {message && (
          <p className="text-outline animate-pulse text-sm">{message}</p>
        )}
      </div>
    </div>
  )
}

export function SectionLoader({ message }) {
  return (
    <div className="p-12 text-center text-outline animate-pulse">
      {message || 'Loading...'}
    </div>
  )
}
