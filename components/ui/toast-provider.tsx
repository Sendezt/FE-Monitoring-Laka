'use client'

import { useEffect, useState, useCallback, useRef, createContext, useContext } from 'react'
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  type: ToastType
  message: string
  duration: number
  leaving?: boolean
}

interface ToastOptions {
  duration?: number
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType, options?: ToastOptions) => void
  success: (message: string, options?: ToastOptions) => void
  error: (message: string, options?: ToastOptions) => void
  info: (message: string, options?: ToastOptions) => void
  warning: (message: string, options?: ToastOptions) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be inside ToastProvider')
  return ctx
}

const DEFAULT_DURATION = 4000
const EXIT_MS = 220
const MAX_TOASTS = 4

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const clearTimer = useCallback((id: string) => {
    const t = timers.current.get(id)
    if (t) {
      clearTimeout(t)
      timers.current.delete(id)
    }
  }, [])

  // Remove instantly from DOM
  const remove = useCallback((id: string) => {
    clearTimer(id)
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [clearTimer])

  // Trigger exit animation, then remove
  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)))
    clearTimer(id)
    const exitTimer = setTimeout(() => remove(id), EXIT_MS)
    timers.current.set(id, exitTimer)
  }, [remove, clearTimer])

  const toast = useCallback(
    (message: string, type: ToastType = 'info', options?: ToastOptions) => {
      if (!message) return
      const id = Math.random().toString(36).slice(2)
      const duration = options?.duration ?? DEFAULT_DURATION
      setToasts((prev) => {
        const next = [...prev, { id, type, message, duration }]
        // Keep only the most recent MAX_TOASTS; drop the oldest
        if (next.length > MAX_TOASTS) {
          const overflow = next.slice(0, next.length - MAX_TOASTS)
          overflow.forEach((t) => clearTimer(t.id))
          return next.slice(next.length - MAX_TOASTS)
        }
        return next
      })
      const autoTimer = setTimeout(() => dismiss(id), duration)
      timers.current.set(id, autoTimer)
    },
    [dismiss, clearTimer]
  )

  const success = useCallback((m: string, o?: ToastOptions) => toast(m, 'success', o), [toast])
  const error = useCallback((m: string, o?: ToastOptions) => toast(m, 'error', o), [toast])
  const info = useCallback((m: string, o?: ToastOptions) => toast(m, 'info', o), [toast])
  const warning = useCallback((m: string, o?: ToastOptions) => toast(m, 'warning', o), [toast])

  // Cleanup all timers on unmount
  useEffect(() => {
    const map = timers.current
    return () => {
      map.forEach((t) => clearTimeout(t))
      map.clear()
    }
  }, [])

  const meta: Record<ToastType, { icon: React.ReactNode; accent: string; ring: string; iconColor: string; bar: string }> = {
    success: {
      icon: <CheckCircle2 size={18} />,
      accent: 'border-l-emerald-500',
      ring: 'bg-emerald-500/10',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      bar: 'bg-emerald-500',
    },
    error: {
      icon: <AlertCircle size={18} />,
      accent: 'border-l-rose-500',
      ring: 'bg-rose-500/10',
      iconColor: 'text-rose-600 dark:text-rose-400',
      bar: 'bg-rose-500',
    },
    warning: {
      icon: <AlertTriangle size={18} />,
      accent: 'border-l-amber-500',
      ring: 'bg-amber-500/10',
      iconColor: 'text-amber-600 dark:text-amber-400',
      bar: 'bg-amber-500',
    },
    info: {
      icon: <Info size={18} />,
      accent: 'border-l-primary',
      ring: 'bg-primary/10',
      iconColor: 'text-primary',
      bar: 'bg-primary',
    },
  }

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning, dismiss }}>
      {children}

      {/* Toast viewport: bottom on mobile, top-right on desktop */}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4
          sm:inset-x-auto sm:bottom-auto sm:right-4 sm:top-4 sm:items-end sm:p-0"
        role="region"
        aria-label="Notifikasi"
      >
        {toasts.map((t) => {
          const m = meta[t.type]
          return (
            <div
              key={t.id}
              role="alert"
              aria-live={t.type === 'error' ? 'assertive' : 'polite'}
              className={`pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-xl border border-l-4 ${m.accent}
                border-border bg-card/95 shadow-lg shadow-black/10 backdrop-blur
                ${t.leaving ? 'toast-out' : 'toast-in'}`}
            >
              <div className="flex items-start gap-3 px-4 py-3">
                <span className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full ${m.ring} ${m.iconColor}`}>
                  {m.icon}
                </span>
                <p className="flex-1 pt-0.5 text-sm font-medium leading-snug text-foreground break-words">
                  {t.message}
                </p>
                <button
                  onClick={() => dismiss(t.id)}
                  className="-mr-1 mt-0.5 shrink-0 rounded-md p-1 text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
                  aria-label="Tutup notifikasi"
                >
                  <X size={15} />
                </button>
              </div>
              {/* Progress bar */}
              {!t.leaving && (
                <span
                  className={`absolute bottom-0 left-0 h-0.5 ${m.bar} toast-progress`}
                  style={{ animationDuration: `${t.duration}ms` }}
                />
              )}
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
