import { useCallback, useEffect, useState } from 'react'
import { FiCheckCircle, FiMonitor, FiShield, FiSmartphone, FiTrash2 } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

import { ErrorState, LoadingState } from '../components/businesses/PageState.jsx'
import BackButton from '../components/ui/BackButton.jsx'
import ConfirmModal from '../components/ui/ConfirmModal.jsx'
import * as authService from '../services/auth.service.js'

const formatDate = (value) => new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })

function deviceDetails(userAgent) {
  const mobile = /Android|iPhone|iPad|Mobile/i.test(userAgent)
  let browser = 'Browser'
  if (/Edg/i.test(userAgent)) browser = 'Edge'
  else if (/Chrome|CriOS/i.test(userAgent)) browser = 'Chrome'
  else if (/Safari/i.test(userAgent)) browser = 'Safari'
  else if (/Firefox|FxiOS/i.test(userAgent)) browser = 'Firefox'
  return { mobile, label: `${mobile ? 'Mobile device' : 'Computer'} · ${browser}` }
}

function SessionsPage() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [confirmOthers, setConfirmOthers] = useState(false)
  const [working, setWorking] = useState(false)
  const [notice, setNotice] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try { const result = await authService.getActiveSessions(); setSessions(result.data) } catch (requestError) { setError(requestError.message) } finally { setLoading(false) }
  }, [])
  useEffect(() => { load() }, [load])

  const revoke = async () => {
    setWorking(true)
    setError('')
    try {
      const result = await authService.revokeSession(selected._id)
      if (result.data.currentRevoked) { navigate('/login', { replace: true }); return }
      setSessions((items) => items.filter((item) => item._id !== selected._id))
      setNotice('Session signed out successfully.')
      setSelected(null)
    } catch (requestError) { setError(requestError.message) } finally { setWorking(false) }
  }

  const revokeOthers = async () => {
    setWorking(true)
    setError('')
    try {
      const result = await authService.revokeOtherSessions()
      setSessions((items) => items.filter((item) => item.isCurrent))
      setNotice(`${result.data.revoked} other session${result.data.revoked === 1 ? '' : 's'} signed out.`)
      setConfirmOthers(false)
    } catch (requestError) { setError(requestError.message) } finally { setWorking(false) }
  }

  return (
    <main className="min-h-screen bg-[#f2f2f1] p-2.5 pb-24 text-[#242424] sm:p-4">
      <div className="mx-auto max-w-4xl">
        <section className="rounded-lg bg-white p-5 sm:p-7"><BackButton fallback="/home" /><div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-medium uppercase tracking-wider text-[#315f91]">Application security</p><h1 className="mt-1 text-3xl tracking-[-0.035em] sm:text-4xl">Active sessions</h1><p className="mt-2 text-sm leading-6 text-[#777]">Review devices where your account is signed in and remove access you do not recognise.</p></div>{sessions.length > 1 && <button type="button" onClick={() => setConfirmOthers(true)} className="rounded-md bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100">Sign out other devices</button>}</div>{notice && <p className="mt-4 rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</p>}{error && <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}</section>
        <section className="mt-3 rounded-lg bg-white p-4 sm:p-6">{loading ? <LoadingState label="Loading active sessions..." /> : error && !sessions.length ? <ErrorState message={error} onRetry={load} backTo="/home" backLabel="Go Home" /> : <div className="divide-y divide-[#ece9e5]">{sessions.map((session) => { const device = deviceDetails(session.userAgent); const Icon = device.mobile ? FiSmartphone : FiMonitor; return <article key={session._id} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0"><span className={`grid size-10 shrink-0 place-items-center rounded-md ${session.isCurrent ? 'bg-emerald-50 text-emerald-700' : 'bg-[#f2f2f1] text-[#666]'}`}><Icon aria-hidden="true" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-sm font-semibold">{device.label}</h2>{session.isCurrent && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700"><FiCheckCircle aria-hidden="true" /> Current</span>}</div><p className="mt-1 text-xs text-[#777]">Last active {formatDate(session.lastUsedAt)}</p><p className="mt-1 break-all text-[11px] text-[#999]">{session.ipAddress || 'IP unavailable'}</p></div><button type="button" onClick={() => setSelected(session)} className="grid size-11 shrink-0 place-items-center rounded-md bg-red-50 text-red-600 hover:bg-red-100" aria-label={session.isCurrent ? 'Sign out this device' : 'Revoke session'}><FiTrash2 aria-hidden="true" /></button></article>})}{!sessions.length && <div className="py-12 text-center"><FiShield className="mx-auto text-2xl text-[#999]" /><p className="mt-3 text-sm text-[#777]">No active sessions found.</p></div>}</div>}</section>
      </div>
      <ConfirmModal open={Boolean(selected)} title={selected?.isCurrent ? 'Sign out this device?' : 'Remove this session?'} message={selected?.isCurrent ? 'You will return to the login page on this device.' : 'Access from this device will be removed immediately.'} confirmLabel={selected?.isCurrent ? 'Sign out' : 'Remove session'} loading={working} loadingLabel="Removing..." onConfirm={revoke} onCancel={() => setSelected(null)} />
      <ConfirmModal open={confirmOthers} title="Sign out other devices?" message="Every other active session will be removed. This device will stay signed in." confirmLabel="Sign out others" loading={working} loadingLabel="Signing out..." onConfirm={revokeOthers} onCancel={() => setConfirmOthers(false)} />
    </main>
  )
}

export default SessionsPage
