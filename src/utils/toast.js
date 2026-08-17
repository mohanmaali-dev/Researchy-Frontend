export const TOAST_EVENT = 'workspace:toast'

export function notify(message, tone = 'success') {
  if (!message || typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: { message, tone } }))
}
