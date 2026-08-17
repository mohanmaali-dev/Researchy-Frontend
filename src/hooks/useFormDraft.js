import { useCallback, useEffect, useRef, useState } from 'react'
import { useBlocker, useLocation } from 'react-router-dom'

import { useAuth } from '../context/AuthContext.jsx'
import { NAVIGATION_REQUEST_EVENT } from '../utils/navigationGuard.js'

const DRAFT_PREFIX = 'enter_manage_form_draft_'

export function useFormDraft({ watch, reset, initialValues }) {
  const { user } = useAuth()
  const location = useLocation()
  const userId = user?._id || user?.id || 'workspace'
  const storageKey = `${DRAFT_PREFIX}${userId}_${location.pathname}`
  const [restored, setRestored] = useState(false)
  const [leavePromptOpen, setLeavePromptOpen] = useState(false)
  const [leaveError, setLeaveError] = useState('')
  const [dirty, setDirty] = useState(false)
  const dirtyRef = useRef(false)
  const allowNavigationRef = useRef(false)
  const currentValuesRef = useRef(initialValues)
  const pendingNavigationRef = useRef(null)
  const blocker = useBlocker(({ currentLocation, nextLocation }) =>
    dirtyRef.current &&
    !allowNavigationRef.current &&
    (currentLocation.pathname !== nextLocation.pathname ||
      currentLocation.search !== nextLocation.search ||
      currentLocation.hash !== nextLocation.hash),
  )

  const markClean = useCallback(() => {
    dirtyRef.current = false
    allowNavigationRef.current = true
    setDirty(false)
  }, [])

  const clearDraft = useCallback(() => {
    try { window.localStorage.removeItem(storageKey) } catch { /* Draft cleanup is best effort. */ }
    markClean()
    setRestored(false)
  }, [markClean, storageKey])

  useEffect(() => {
    try {
      const draft = JSON.parse(window.localStorage.getItem(storageKey))
      if (draft?.values && typeof draft.values === 'object') {
        currentValuesRef.current = draft.values
        reset(draft.values)
        dirtyRef.current = true
        setDirty(true)
        setRestored(true)
      }
    } catch {
      // Ignore unavailable or invalid local draft data.
    }
  }, [reset, storageKey])

  useEffect(() => {
    const subscription = watch((values, details) => {
      currentValuesRef.current = values
      if (!details?.name && !details?.type) return
      dirtyRef.current = true
      allowNavigationRef.current = false
      setDirty(true)
    })
    return () => subscription.unsubscribe()
  }, [watch])

  const requestLeave = useCallback((continueNavigation) => {
    if (!dirtyRef.current) {
      continueNavigation()
      return
    }
    pendingNavigationRef.current = continueNavigation
    setLeaveError('')
    setLeavePromptOpen(true)
  }, [])

  useEffect(() => {
    const guardRequestedNavigation = (event) => {
      if (!dirtyRef.current || typeof event.detail?.proceed !== 'function') return
      event.preventDefault()
      requestLeave(event.detail.proceed)
    }

    document.addEventListener(NAVIGATION_REQUEST_EVENT, guardRequestedNavigation)
    return () => {
      document.removeEventListener(NAVIGATION_REQUEST_EVENT, guardRequestedNavigation)
    }
  }, [requestLeave])

  useEffect(() => {
    if (blocker.state !== 'blocked' || leavePromptOpen) return
    pendingNavigationRef.current = blocker.proceed
    setLeaveError('')
    setLeavePromptOpen(true)
  }, [blocker, leavePromptOpen])

  useEffect(() => {
    const warnBeforeUnload = (event) => {
      if (!dirtyRef.current) return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warnBeforeUnload)
    return () => window.removeEventListener('beforeunload', warnBeforeUnload)
  }, [])

  const continueAfterDecision = useCallback(() => {
    const continueNavigation = pendingNavigationRef.current
    pendingNavigationRef.current = null
    markClean()
    setLeavePromptOpen(false)
    setLeaveError('')
    continueNavigation?.()
  }, [markClean])

  const saveDraftAndLeave = useCallback(() => {
    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({ values: currentValuesRef.current, savedAt: Date.now() }),
      )
      continueAfterDecision()
    } catch {
      setLeaveError('The draft could not be saved on this device. Please try again or choose Discard.')
    }
  }, [continueAfterDecision, storageKey])

  const discardAndLeave = useCallback(() => {
    try { window.localStorage.removeItem(storageKey) } catch { /* Continue even if cleanup is unavailable. */ }
    setRestored(false)
    continueAfterDecision()
  }, [continueAfterDecision, storageKey])

  const discardRestoredDraft = useCallback(() => {
    try { window.localStorage.removeItem(storageKey) } catch { /* Draft cleanup is best effort. */ }
    currentValuesRef.current = initialValues
    markClean()
    setRestored(false)
    reset(initialValues)
  }, [initialValues, markClean, reset, storageKey])

  const cancelLeave = useCallback(() => {
    pendingNavigationRef.current = null
    if (blocker.state === 'blocked') blocker.reset()
    setLeavePromptOpen(false)
    setLeaveError('')
  }, [blocker])

  const submitWithDraft = useCallback(
    (submitter) => async (values) => {
      allowNavigationRef.current = true
      try {
        const successful = await submitter(values)
        if (successful === true) clearDraft()
        else allowNavigationRef.current = false
        return successful
      } catch (error) {
        allowNavigationRef.current = false
        throw error
      }
    },
    [clearDraft],
  )

  return {
    restored,
    dirty,
    leavePromptOpen,
    leaveError,
    saveDraftAndLeave,
    discardAndLeave,
    discardRestoredDraft,
    cancelLeave,
    submitWithDraft,
  }
}
