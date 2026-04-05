export default function Modal({
  open,
  onClose,
  children,
  maxWidth = 'max-w-md',
  className = '',
}) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`
          bg-surface-container-lowest w-full ${maxWidth}
          rounded-[2.5rem] whisper-shadow overflow-hidden animate-fade-in
          ${className}
        `.trim()}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

Modal.Header = function ModalHeader({ title, subtitle, onClose }) {
  return (
    <div className="flex justify-between items-start mb-6">
      <div>
        <h3 className="text-2xl font-extrabold tracking-tight text-on-surface">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-outline-variant mt-1">{subtitle}</p>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-2 hover:bg-surface-container rounded-full text-outline-variant"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      )}
    </div>
  )
}

Modal.Body = function ModalBody({ children, className = '' }) {
  return <div className={`p-8 ${className}`}>{children}</div>
}
