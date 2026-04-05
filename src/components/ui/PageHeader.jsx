export default function PageHeader({
  subtitle,
  title,
  description,
  actions,
  badge,
  className = '',
}) {
  return (
    <header className={`mb-10 ${className}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          {subtitle && (
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-primary mb-2 block">
              {subtitle}
            </span>
          )}
          <div className="flex items-center gap-3">
            <h1 className="text-4xl md:text-5xl font-black tracking-[-0.03em] text-on-surface">
              {title}
            </h1>
            {badge}
          </div>
          {description && (
            <p className="text-lg text-on-surface-variant leading-relaxed mt-2">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </header>
  )
}
