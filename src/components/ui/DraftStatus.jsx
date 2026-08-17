import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { FiAlertCircle, FiCheck, FiRotateCcw, FiSave, FiTrash2, FiX } from 'react-icons/fi'

function DraftStatus({
  restored,
  leavePromptOpen,
  leaveError,
  saveDraftAndLeave,
  discardAndLeave,
  discardRestoredDraft,
  cancelLeave,
}) {
  const dialogRef = useRef(null)
  const cancelButtonRef = useRef(null)
  const previousFocusRef = useRef(null)

  useEffect(() => {
    if (!leavePromptOpen) return undefined
    const closeWithKeyboard = (event) => {
      if (event.key === 'Escape') cancelLeave()
      if (event.key !== 'Tab') return
      const focusable = dialogRef.current?.querySelectorAll('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')
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
    previousFocusRef.current = document.activeElement
    document.addEventListener('keydown', closeWithKeyboard)
    document.body.style.overflow = 'hidden'
    const focusTimer = window.setTimeout(() => cancelButtonRef.current?.focus(), 80)
    return () => {
      window.clearTimeout(focusTimer)
      document.removeEventListener('keydown', closeWithKeyboard)
      document.body.style.overflow = ''
      previousFocusRef.current?.focus?.()
    }
  }, [cancelLeave, leavePromptOpen])

  if (!leavePromptOpen) {
    if (!restored) return null
    return (
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-[#edf3f9] px-3.5 py-2.5 text-xs text-[#315f91]">
        <span className="inline-flex items-center gap-1.5"><FiCheck aria-hidden="true" /> Your saved draft was restored.</span>
        <button type="button" onClick={discardRestoredDraft} className="inline-flex min-h-9 items-center gap-1.5 rounded-md px-2 font-medium text-red-600 transition hover:bg-red-50"><FiRotateCcw aria-hidden="true" /> Discard draft</button>
      </div>
    )
  }

  return createPortal(
    <div className="fixed inset-0 z-[500] flex items-end justify-center p-3 sm:grid sm:place-items-center sm:p-4">
      <button type="button" onClick={cancelLeave} className="absolute inset-0 bg-black/35 backdrop-blur-[2px]" aria-label="Stay on this page" />
      <section ref={dialogRef} role="alertdialog" aria-modal="true" aria-labelledby="draft-leave-title" aria-describedby="draft-leave-description" className="relative w-full max-w-md rounded-[14px] bg-white p-4 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-md bg-amber-50 text-xl text-amber-700"><FiAlertCircle aria-hidden="true" /></span>
          <button type="button" onClick={cancelLeave} className="grid size-10 place-items-center rounded-md bg-[#f2f2f1] text-[#666] hover:bg-[#e9e8e6]" aria-label="Close"><FiX aria-hidden="true" /></button>
        </div>
        <h2 id="draft-leave-title" className="mt-5 text-xl font-semibold text-[#242424]">Save your changes as a draft?</h2>
        <p id="draft-leave-description" className="mt-2 text-sm leading-6 text-[#666]">You have changes that have not been submitted. Save them on this device, discard them, or stay on this page.</p>
        {leaveError && <p className="mt-4 rounded-md bg-red-50 px-3.5 py-3 text-sm leading-5 text-red-600">{leaveError}</p>}
        <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <button ref={cancelButtonRef} type="button" onClick={cancelLeave} className="min-h-11 rounded-md border border-[#dedbd7] bg-white px-4 py-2.5 text-sm font-medium text-[#555] hover:bg-[#f7f7f7]">Cancel</button>
          <button type="button" onClick={discardAndLeave} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-100"><FiTrash2 aria-hidden="true" /> Discard</button>
          <button type="button" onClick={saveDraftAndLeave} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"><FiSave aria-hidden="true" /> Save as draft</button>
        </div>
      </section>
    </div>,
    document.body,
  )
}

export default DraftStatus
