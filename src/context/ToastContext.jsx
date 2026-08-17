import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from 'react-icons/fi'

import { TOAST_EVENT } from '../utils/toast.js'

const ToastContext = createContext(null)

const toneStyles = {
  success: { icon: FiCheckCircle, className: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
  error: { icon: FiAlertCircle, className: 'border-red-200 bg-red-50 text-red-700' },
  info: { icon: FiInfo, className: 'border-blue-200 bg-blue-50 text-blue-800' },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timersRef = useRef(new Map())

  const dismiss = useCallback((id) => {
    const timer = timersRef.current.get(id)
    if (timer) window.clearTimeout(timer)
    timersRef.current.delete(id)
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback((message, tone = 'success', duration = 4200) => {
    if (!message) return
    const id = `${Date.now()}-${Math.random()}`
    setToasts((current) => [...current.slice(-2), { id, message, tone }])
    const timer = window.setTimeout(() => dismiss(id), duration)
    timersRef.current.set(id, timer)
  }, [dismiss])

  useEffect(() => {
    const timers = timersRef.current
    const handleToast = (event) => showToast(event.detail?.message, event.detail?.tone)
    window.addEventListener(TOAST_EVENT, handleToast)
    return () => {
      window.removeEventListener(TOAST_EVENT, handleToast)
      timers.forEach((timer) => window.clearTimeout(timer))
      timers.clear()
    }
  }, [showToast])

  const value = useMemo(() => ({ showToast, dismiss }), [dismiss, showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div className="pointer-events-none fixed inset-x-3 top-3 z-[600] flex flex-col items-end gap-2 sm:left-auto sm:right-4 sm:top-4 sm:w-[24rem]" aria-live="polite" aria-atomic="false">
          {toasts.map((toast) => {
            const style = toneStyles[toast.tone] || toneStyles.info
            const Icon = style.icon
            return (
              <div key={toast.id} role={toast.tone === 'error' ? 'alert' : 'status'} className={`pointer-events-auto flex w-full items-start gap-3 rounded-lg border px-3.5 py-3 text-sm shadow-[0_12px_36px_rgba(34,34,34,0.13)] ${style.className}`}>
                <Icon className="mt-0.5 shrink-0 text-lg" aria-hidden="true" />
                <p className="min-w-0 flex-1 leading-5">{toast.message}</p>
                <button type="button" onClick={() => dismiss(toast.id)} className="grid size-8 shrink-0 place-items-center rounded-md transition hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2" aria-label="Dismiss message"><FiX aria-hidden="true" /></button>
              </div>
            )
          })}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- Provider and hook belong together.
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside ToastProvider')
  return context
}
