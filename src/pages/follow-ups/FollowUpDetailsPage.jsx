import { useCallback, useEffect, useState } from 'react'
import { FiBriefcase, FiCheck, FiEdit2, FiMessageSquare, FiRefreshCw, FiStar, FiTrash2 } from 'react-icons/fi'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'

import { ErrorState, LoadingState } from '../../components/businesses/PageState.jsx'
import FollowUpStatusBadge from '../../components/follow-ups/FollowUpStatusBadge.jsx'
import ConfirmModal from '../../components/ui/ConfirmModal.jsx'
import BackButton from '../../components/ui/BackButton.jsx'
import * as followUpService from '../../services/follow-up.service.js'

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      })
    : '—'

function RelatedLink({ to, icon, label, value }) {
  return (
    <Link to={to} className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 hover:bg-slate-50">
      <span className="text-primary-dark">{icon}</span>
      <span><span className="block text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</span><span className="mt-1 block font-bold">{value}</span></span>
    </Link>
  )
}

function FollowUpDetailsPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [followUp, setFollowUp] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState('')

  const loadFollowUp = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const result = await followUpService.getFollowUpById(id)
      setFollowUp(result.data)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadFollowUp()
  }, [loadFollowUp])

  const handleStatusAction = async () => {
    setUpdating(true)
    setError('')

    try {
      const result = followUp.status === 'Completed'
        ? await followUpService.reopenFollowUp(id)
        : await followUpService.completeFollowUp(id)
      setFollowUp(result.data)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    setError('')
    try {
      await followUpService.deleteFollowUp(id)
      setConfirmDelete(false)
      navigate('/follow-ups', { replace: true })
    } catch (requestError) {
      setError(requestError.message)
      setDeleting(false)
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      {loading ? (
        <LoadingState label="Loading follow-up..." />
      ) : !followUp ? (
        <ErrorState message={error} onRetry={loadFollowUp} />
      ) : (
        <>
          <BackButton fallback="/follow-ups" />

          {location.state?.notice && <p className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{location.state.notice}</p>}
          {error && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

          <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-primary-dark">Follow-up</p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight">{followUp.reason}</h1>
                  <FollowUpStatusBadge status={followUp.status} isOverdue={followUp.isOverdue} />
                </div>
                <p className="mt-3 text-sm text-slate-500">Scheduled for {formatDate(followUp.followUpDate)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(followUp.status === 'Pending' || followUp.status === 'Completed') && (
                  <button type="button" onClick={handleStatusAction} disabled={updating} className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50">
                    {followUp.status === 'Completed' ? <FiRefreshCw aria-hidden="true" /> : <FiCheck aria-hidden="true" />}
                    {updating ? 'Updating...' : followUp.status === 'Completed' ? 'Reopen' : 'Complete'}
                  </button>
                )}
                <Link to={`/follow-ups/${id}/edit`} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"><FiEdit2 aria-hidden="true" /> Edit</Link>
                <button type="button" onClick={() => setConfirmDelete(true)} disabled={deleting} className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"><FiTrash2 aria-hidden="true" /> {deleting ? 'Deleting...' : 'Delete'}</button>
              </div>
            </div>
          </section>

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <h2 className="text-xl font-bold">Related records</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <RelatedLink to={`/businesses/${followUp.business._id}`} icon={<FiBriefcase aria-hidden="true" />} label="Business" value={followUp.business.companyName} />
                {followUp.conversation && <RelatedLink to={`/conversations/${followUp.conversation._id}`} icon={<FiMessageSquare aria-hidden="true" />} label="Conversation" value={`${followUp.conversation.personName} · ${followUp.conversation.personRole}`} />}
                {followUp.opportunity && <RelatedLink to={`/opportunities/${followUp.opportunity._id}`} icon={<FiStar aria-hidden="true" />} label="Opportunity" value={followUp.opportunity.problem?.title || 'Linked opportunity'} />}
              </div>
              <div className="mt-7 rounded-xl bg-slate-50 p-5">
                <h2 className="font-bold">Notes</h2>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{followUp.notes || '—'}</p>
              </div>
            </section>

            <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <dl className="space-y-5">
                <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status</dt><dd className="mt-1.5 font-semibold">{followUp.status}</dd></div>
                <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Follow-up date</dt><dd className="mt-1.5 font-semibold">{formatDate(followUp.followUpDate)}</dd></div>
                <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Completed date</dt><dd className="mt-1.5 font-semibold">{formatDate(followUp.completedAt)}</dd></div>
                <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Created</dt><dd className="mt-1.5 font-semibold">{formatDate(followUp.createdAt)}</dd></div>
              </dl>
            </aside>
          </div>
          <ConfirmModal
            open={confirmDelete}
            title="Delete follow-up?"
            message={`“${followUp.reason}” will be permanently deleted. The related Business and other records will not be affected.`}
            confirmLabel="Delete follow-up"
            loading={deleting}
            onConfirm={handleDelete}
            onCancel={() => setConfirmDelete(false)}
          />
        </>
      )}
    </main>
  )
}

export default FollowUpDetailsPage
