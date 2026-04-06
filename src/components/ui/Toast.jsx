import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

/* ── Toast Context ─────────────────────────────────────────────── */
const ToastContext = createContext(null)

let _addToast = null // module-level ref so imperative helpers work outside React

/* ── Provider ──────────────────────────────────────────────────── */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const add = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type, visible: true }])
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, visible: false } : t))
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 350)
    }, duration)
    return id
  }, [])

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, visible: false } : t))
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 350)
  }, [])

  // Expose imperatively (for non-hook usage)
  useEffect(() => { _addToast = add }, [add])

  return (
    <ToastContext.Provider value={{ toasts, add, dismiss }}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  )
}

/* ── Hook ───────────────────────────────────────────────────────── */
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>')
  return {
    toast: ctx.add,
    dismiss: ctx.dismiss,
  }
}

/* ── Imperative helper (use anywhere, even outside React tree) ─── */
export const toast = {
  show:    (msg, duration) => _addToast?.(msg, 'info', duration),
  success: (msg, duration) => _addToast?.(msg, 'success', duration),
  error:   (msg, duration) => _addToast?.(msg, 'error', duration),
  warning: (msg, duration) => _addToast?.(msg, 'warning', duration),
  info:    (msg, duration) => _addToast?.(msg, 'info', duration),
}

/* ── Config per type ────────────────────────────────────────────── */
const TYPE_CONFIG = {
  success: {
    icon: 'check_circle',
    bar:  'bg-[#15803d]',
    iconClass: 'text-[#15803d]',
  },
  error: {
    icon: 'error',
    bar:  'bg-[#b91c1c]',
    iconClass: 'text-[#b91c1c]',
  },
  warning: {
    icon: 'warning',
    bar:  'bg-[#c2410c]',
    iconClass: 'text-[#c2410c]',
  },
  info: {
    icon: 'info',
    bar:  'bg-[var(--color-primary)]',
    iconClass: 'text-[var(--color-primary)]',
  },
}

/* ── Single Toast item ──────────────────────────────────────────── */
function ToastItem({ id, message, type, visible, onDismiss }) {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.info

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        transition: 'opacity 0.35s ease, transform 0.35s ease',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(32px)',
        pointerEvents: visible ? 'auto' : 'none',
      }}
      className="relative flex items-center gap-4 bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/20 rounded-3xl shadow-xl px-5 py-4 min-w-[340px] max-w-[440px] overflow-hidden group"
    >
      {/* Colored side bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-3xl ${cfg.bar}`} />

      {/* Icon circle */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center bg-[var(--color-surface-container-low)]`}>
        <span className={`material-symbols-outlined text-[22px] ${cfg.iconClass}`}>
          {cfg.icon}
        </span>
      </div>

      {/* Message */}
      <p className="text-[15px] font-semibold text-[var(--color-on-surface)] leading-snug flex-1 pr-6">
        {message}
      </p>

      {/* Close button */}
      <button
        onClick={() => onDismiss(id)}
        className="absolute top-3 right-3 text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] opacity-0 group-hover:opacity-100 transition-all rounded-full p-1 hover:bg-[var(--color-surface-container)]"
        aria-label="Dismiss"
      >
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
  )
}

/* ── Toaster (portal-like fixed container) ─────────────────────── */
function Toaster() {
  const ctx = useContext(ToastContext)
  if (!ctx) return null

  return (
    <div
      aria-label="Notifications"
      className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 items-end"
      style={{ pointerEvents: 'none' }}
    >
      {ctx.toasts.map(t => (
        <ToastItem key={t.id} {...t} onDismiss={ctx.dismiss} />
      ))}
    </div>
  )
}
