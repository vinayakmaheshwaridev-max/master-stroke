const statusClasses = {
  approved: 'bg-status-approved-bg text-status-approved-text',
  completed: 'bg-status-completed-bg text-status-completed-text',
  pending: 'bg-status-pending-bg text-status-pending-text',
  rejected: 'bg-status-rejected-bg text-status-rejected-text',
  scheduled: 'bg-status-scheduled-bg text-status-scheduled-text',
  info: 'bg-secondary-container text-on-secondary-container',
  error: 'bg-error-container/20 text-error',
}

export default function Badge({
  children,
  status = 'info',
  className = '',
  ...props
}) {
  return (
    <span
      className={`
        inline-flex px-3 py-1 rounded-full
        text-[10px] font-bold uppercase tracking-wider
        ${statusClasses[status] || statusClasses.info}
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </span>
  )
}
