import { useCallback, useEffect, useState } from 'react'
import { FiArrowLeft, FiBriefcase, FiEdit2, FiMessageSquare, FiTrash2, FiUsers } from 'react-icons/fi'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'

import { ErrorState, LoadingState } from '../../components/businesses/PageState.jsx'
import AddFollowUpLink from '../../components/follow-ups/AddFollowUpLink.jsx'
import { ScoreBadge, ValidationBadge } from '../../components/opportunities/OpportunityBadges.jsx'
import ScoreBreakdown from '../../components/opportunities/ScoreBreakdown.jsx'
import ProblemTags from '../../components/problems/ProblemTags.jsx'
import ConfirmModal from '../../components/ui/ConfirmModal.jsx'
import * as opportunityService from '../../services/opportunity.service.js'

const formatDate = (date) =>
  new Date(date).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

function TextSection({ title, content }) {
  return (
    <section className="rounded-xl bg-slate-50 p-5">
      <h2 className="font-bold text-slate-900">{title}</h2>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{content || '—'}</p>
    </section>
  )
}

function OpportunityDetailsPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [opportunity, setOpportunity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState('')

  const loadOpportunity = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const result = await opportunityService.getOpportunityById(id)
      setOpportunity(result.data)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadOpportunity()
  }, [loadOpportunity])

  const handleDelete = async () => {
    setDeleting(true)
    setError('')

    try {
      await opportunityService.deleteOpportunity(opportunity._id)
      setConfirmDelete(false)
      navigate('/opportunities', { replace: true })
    } catch (requestError) {
      setError(requestError.message)
      setDeleting(false)
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      {loading ? (
        <LoadingState label="Loading opportunity..." />
      ) : error && !opportunity ? (
        <ErrorState message={error} onRetry={loadOpportunity} />
      ) : (
        <>
          <Link to="/opportunities" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary-dark"><FiArrowLeft aria-hidden="true" /> Back to opportunities</Link>

          {location.state?.notice && (
            <p className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{location.state.notice}</p>
          )}
          {error && (
            <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          )}

          <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-primary-dark">Opportunity</p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight">{opportunity.problem.title}</h1>
                  <ValidationBadge status={opportunity.validationStatus} />
                </div>
                <div className="mt-4"><ProblemTags tags={opportunity.problem.tags || []} /></div>
                <p className="mt-4 text-sm text-slate-500">Created {formatDate(opportunity.createdAt)} · {opportunity.status}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <ScoreBadge score={opportunity.opportunityScore} large />
                <AddFollowUpLink
                  businessId={opportunity.business._id}
                  opportunityId={opportunity._id}
                />
                <Link to={`/opportunities/${opportunity._id}/edit`} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"><FiEdit2 aria-hidden="true" /> Edit</Link>
                <button type="button" onClick={() => setConfirmDelete(true)} disabled={deleting} className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"><FiTrash2 aria-hidden="true" /> {deleting ? 'Deleting...' : 'Delete'}</button>
              </div>
            </div>
          </section>

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_23rem]">
            <div className="space-y-8">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <h2 className="text-xl font-bold">Linked research</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Link to={`/businesses/${opportunity.business._id}`} className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 hover:bg-slate-50"><FiBriefcase className="text-primary-dark" aria-hidden="true" /><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Business</p><p className="mt-1 font-bold">{opportunity.business.companyName}</p></div></Link>
                  <Link to={`/conversations/${opportunity.conversation._id}`} className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 hover:bg-slate-50"><FiMessageSquare className="text-primary-dark" aria-hidden="true" /><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Conversation</p><p className="mt-1 font-bold">{opportunity.conversation.personName} · {opportunity.conversation.personRole}</p></div></Link>
                </div>
                <Link to={`/problems/${opportunity.problem._id}`} className="mt-4 block rounded-xl border border-slate-200 p-5 hover:bg-slate-50">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Original Problem</p>
                  <p className="mt-1 font-bold text-primary-dark">{opportunity.problem.title}</p>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">{opportunity.problem.description}</p>
                </Link>
                <div className="mt-4 flex items-start gap-3 rounded-xl bg-primary-light p-4 text-primary-dark">
                  <FiUsers className="mt-0.5 shrink-0" aria-hidden="true" />
                  <p className="text-sm"><span className="font-bold">{opportunity.scoreBreakdown.uniqueBusinessCount} unique businesses</span> currently report a Problem with a matching tag or normalized title.</p>
                </div>
              </section>

              <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <TextSection title="Why this opportunity looks valuable" content={opportunity.whyValuable} />
                <TextSection title="Market potential" content={opportunity.marketPotential} />
                <TextSection title="Notes" content={opportunity.notes} />
                <dl className="grid gap-5 rounded-xl border border-slate-200 p-5 sm:grid-cols-3">
                  <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Difficulty</dt><dd className="mt-1 font-semibold">{opportunity.difficulty}</dd></div>
                  <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Validation</dt><dd className="mt-1 font-semibold">{opportunity.validationStatus}</dd></div>
                  <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status</dt><dd className="mt-1 font-semibold">{opportunity.status}</dd></div>
                </dl>
              </section>
            </div>

            <div className="h-fit"><ScoreBreakdown breakdown={opportunity.scoreBreakdown} total={opportunity.opportunityScore} /></div>
          </div>
          <ConfirmModal
            open={confirmDelete}
            title="Delete opportunity?"
            message={`The opportunity for “${opportunity.problem.title}” will be permanently deleted. The original Problem will remain available.`}
            confirmLabel="Delete opportunity"
            loading={deleting}
            onConfirm={handleDelete}
            onCancel={() => setConfirmDelete(false)}
          />
        </>
      )}
    </main>
  )
}

export default OpportunityDetailsPage
