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
  onConfirm,
  onCancel,
}) {
  const [rendered, setRendered] = useState(open)
  const [visible, setVisible] = useState(false)
  const cancelButtonRef = useRef(null)

  useEffect(() => {
    let frame
    let timer

    if (open) {
      setRendered(true)
      frame = requestAnimationFrame(() => setVisible(true))
      document.body.style.overflow = 'hidden'
      timer = setTimeout(() => cancelButtonRef.current?.focus(), 100)
    } else {
      setVisible(false)
      timer = setTimeout(() => setRendered(false), 200)
      document.body.style.overflow = ''
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
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [loading, onCancel, open])

  if (!rendered) return null

  return createPortal(
    <div className={`fixed inset-0 z-[100] grid place-items-center p-4 transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`} role="presentation">
      <button type="button" className="absolute inset-0 bg-black/35 backdrop-blur-[2px]" onClick={loading ? undefined : onCancel} aria-label="Close confirmation" />
      <section role="alertdialog" aria-modal="true" aria-labelledby="confirm-modal-title" aria-describedby="confirm-modal-message" className={`relative w-full max-w-md rounded-[24px] bg-white p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)] transition duration-200 ease-out ${visible ? 'translate-y-0 scale-100' : 'translate-y-3 scale-95'}`}>
        <div className="flex items-start justify-between gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-red-50 text-xl text-red-600"><FiAlertTriangle aria-hidden="true" /></span>
          <button type="button" onClick={onCancel} disabled={loading} className="grid size-9 place-items-center rounded-full bg-[#f5f5f5] text-slate-500 transition hover:bg-[#ededed] hover:text-slate-900 disabled:opacity-50" aria-label="Close"><FiX aria-hidden="true" /></button>
        </div>
        <h2 id="confirm-modal-title" className="mt-5 text-xl font-semibold tracking-tight text-[#242424]">{title}</h2>
        <p id="confirm-modal-message" className="mt-2 text-sm leading-6 text-[#666]">{message}</p>
        <div className="mt-7 flex justify-end gap-2.5">
          <button ref={cancelButtonRef} type="button" onClick={onCancel} disabled={loading} className="rounded-full border border-[#dedede] bg-white px-5 py-2.5 text-sm font-medium text-[#444] transition hover:bg-[#f6f6f6] disabled:opacity-50">{cancelLabel}</button>
          <button type="button" onClick={onConfirm} disabled={loading} className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-red-600/15 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Deleting...' : confirmLabel}</button>
        </div>
      </section>
    </div>,
    document.body,
  )
}

export default ConfirmModal
