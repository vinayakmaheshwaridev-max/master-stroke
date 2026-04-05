export default function FilterPills({
  filters,
  active,
  onChange,
  className = '',
}) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {filters.map((f) => {
        const key = typeof f === 'string' ? f : f.key
        const label = typeof f === 'string' ? f : f.label

        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors capitalize ${
              active === key
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
