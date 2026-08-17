import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { FiAlertTriangle, FiX } from 'react-icons/fi'

function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  loading = false,
  tone = 'danger',
  loadingLabel,
  onConfirm,
  onCancel,
}) {
  const [rendered, setRendered] = useState(open)
  const [visible, setVisible] = useState(false)
  const cancelButtonRef = useRef(null)
  const dialogRef = useRef(null)
  const previousFocusRef = useRef(null)

  useEffect(() => {
    let frame
    let timer

    if (open) {
      previousFocusRef.current = document.activeElement
      setRendered(true)
      frame = requestAnimationFrame(() => setVisible(true))
      document.body.style.overflow = 'hidden'
      timer = setTimeout(() => cancelButtonRef.current?.focus(), 100)
    } else {
      setVisible(false)
      timer = setTimeout(() => setRendered(false), 200)
      document.body.style.overflow = ''
      previousFocusRef.current?.focus?.()
    }

    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(timer)
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && open && !loading) onCancel()
      if (event.key !== 'Tab' || !open) return
      const focusable = dialogRef.current?.querySelectorAll(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable?.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [loading, onCancel, open])

  if (!rendered) return null

  const isWarning = tone === 'warning'
  const iconClass = isWarning ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
  const confirmClass = isWarning ? 'bg-amber-600 shadow-amber-600/15 hover:bg-amber-700' : 'bg-red-600 shadow-red-600/15 hover:bg-red-700'

  return createPortal(
    <div className={`fixed inset-0 z-[100] flex items-end justify-center p-3 transition-opacity duration-200 sm:grid sm:place-items-center sm:p-4 ${visible ? 'opacity-100' : 'opacity-0'}`} role="presentation">
      <button type="button" className="absolute inset-0 bg-black/35 backdrop-blur-[2px]" onClick={loading ? undefined : onCancel} aria-label="Close confirmation" />
      <section ref={dialogRef} role="alertdialog" aria-modal="true" aria-labelledby="confirm-modal-title" aria-describedby="confirm-modal-message" className={`relative max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto rounded-[14px] bg-white p-4 shadow-[0_24px_80px_rgba(0,0,0,0.22)] transition duration-200 ease-out sm:p-6 ${visible ? 'translate-y-0 scale-100' : 'translate-y-6 scale-[0.98] sm:translate-y-3 sm:scale-95'}`}>
        <div className="flex items-start justify-between gap-4">
          <span className={`grid size-11 shrink-0 place-items-center rounded-full text-xl ${iconClass}`}><FiAlertTriangle aria-hidden="true" /></span>
          <button type="button" onClick={onCancel} disabled={loading} className="grid size-9 place-items-center rounded-full bg-[#f5f5f5] text-slate-500 transition hover:bg-[#ededed] hover:text-slate-900 disabled:opacity-50" aria-label="Close"><FiX aria-hidden="true" /></button>
        </div>
        <h2 id="confirm-modal-title" className="mt-5 text-xl font-semibold tracking-tight text-[#242424]">{title}</h2>
        <p id="confirm-modal-message" className="mt-2 text-sm leading-6 text-[#666]">{message}</p>
        <div className="mt-7 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <button ref={cancelButtonRef} type="button" onClick={onCancel} disabled={loading} className="min-h-11 w-full rounded-md border border-[#dedede] bg-white px-5 py-2.5 text-sm font-medium text-[#444] transition hover:bg-[#f6f6f6] disabled:opacity-50 sm:w-auto">{cancelLabel}</button>
          <button type="button" onClick={onConfirm} disabled={loading} className={`min-h-11 w-full rounded-md px-5 py-2.5 text-sm font-medium text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto ${confirmClass}`}>{loading ? (loadingLabel || (isWarning ? 'Working...' : 'Deleting...')) : confirmLabel}</button>
        </div>
      </section>
    </div>,
    document.body,
  )
}

export default ConfirmModal
