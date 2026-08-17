import { useCallback, useEffect, useState } from 'react'
import { FiBriefcase, FiChevronRight, FiEdit2, FiMessageSquare, FiTrash2, FiUsers } from 'react-icons/fi'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'

import { ErrorState, LoadingState } from '../../components/businesses/PageState.jsx'
import AddFollowUpLink from '../../components/follow-ups/AddFollowUpLink.jsx'
import { ScoreBadge, ValidationBadge } from '../../components/opportunities/OpportunityBadges.jsx'
import ScoreBreakdown from '../../components/opportunities/ScoreBreakdown.jsx'
import ProblemTags from '../../components/problems/ProblemTags.jsx'
import ConfirmModal from '../../components/ui/ConfirmModal.jsx'
import BackButton from '../../components/ui/BackButton.jsx'
import * as opportunityService from '../../services/opportunity.service.js'

const formatDate = (date) =>
  new Date(date).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

function TextSection({ title, content }) {
  return (
    <section className="rounded-md bg-[#f7f6f4] p-3.5 sm:p-5">
      <h2 className="text-sm font-semibold text-[#292929] sm:text-base">{title}</h2>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#666] sm:mt-3 sm:leading-7">{content || '—'}</p>
    </section>
  )
}

function ResearchLink({ to, icon, label, title, tone = 'neutral' }) {
  return (
    <Link
      to={to}
      className={`group flex min-w-0 items-center gap-3 rounded-md p-3 transition focus:outline-none focus:ring-2 focus:ring-primary/20 sm:p-4 ${
        tone === 'primary' ? 'bg-primary-light hover:bg-[#ffebe5]' : 'bg-[#f3f2f0] hover:bg-[#ebe9e6]'
      }`}
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-md bg-white text-primary-dark">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-semibold uppercase tracking-wide text-[#999] sm:text-xs">{label}</span>
        <span className="mt-0.5 block truncate text-sm font-semibold text-[#333] group-hover:text-primary-dark sm:mt-1 sm:text-base">{title}</span>
      </span>
      <FiChevronRight className="shrink-0 text-[#999] transition group-hover:translate-x-0.5 group-hover:text-primary-dark" aria-hidden="true" />
    </Link>
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
    <main className="w-full px-1 pb-3 pt-1 sm:px-2">
      {loading ? (
        <LoadingState label="Loading opportunity..." />
      ) : error && !opportunity ? (
        <ErrorState message={error} onRetry={loadOpportunity} />
      ) : (
        <>
          <BackButton fallback="/opportunities" />

          {location.state?.notice && (
            <p className="mt-3 rounded-md bg-emerald-50 px-3.5 py-3 text-sm text-emerald-700 sm:px-4">{location.state.notice}</p>
          )}
          {error && (
            <p role="alert" className="mt-3 rounded-md bg-red-50 px-3.5 py-3 text-sm text-red-600 sm:px-4">{error}</p>
          )}

          <section className="mt-3 overflow-hidden rounded-lg bg-white shadow-[0_2px_10px_rgba(44,38,34,0.05)]">
            <div className="bg-[#faf9f8] p-4 sm:p-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary-dark">Opportunity</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2.5 sm:gap-3">
                    <h1 className="break-words text-2xl font-semibold tracking-[-0.025em] text-[#222] sm:text-3xl">{opportunity.problem.title}</h1>
                    <ValidationBadge status={opportunity.validationStatus} />
                  </div>
                  {opportunity.problem.tags?.length > 0 && (
                    <div className="mt-3 overflow-x-auto pb-1 sm:mt-4"><ProblemTags tags={opportunity.problem.tags} /></div>
                  )}
                  <p className="mt-3 text-xs text-[#777] sm:mt-4 sm:text-sm">Created {formatDate(opportunity.createdAt)} · {opportunity.status}</p>
                </div>
                <ScoreBadge score={opportunity.opportunityScore} large />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
                <div className="col-span-2 [&>a]:w-full sm:col-span-1 sm:[&>a]:w-auto">
                  <AddFollowUpLink
                    businessId={opportunity.business._id}
                    opportunityId={opportunity._id}
                  />
                </div>
                <Link to={`/opportunities/${opportunity._id}/edit`} className="inline-flex items-center justify-center gap-2 rounded-md bg-[#ebe9e6] px-4 py-2.5 text-sm font-semibold text-[#333] transition hover:bg-[#dfdcd8]"><FiEdit2 aria-hidden="true" /> Edit</Link>
                <button type="button" onClick={() => setConfirmDelete(true)} disabled={deleting} className="inline-flex items-center justify-center gap-2 rounded-md bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"><FiTrash2 aria-hidden="true" /> {deleting ? 'Deleting...' : 'Delete'}</button>
              </div>
            </div>
          </section>

          <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="space-y-3">
              <section className="rounded-lg bg-white p-3.5 sm:p-6">
                <h2 className="text-lg font-semibold text-[#292929]">Linked research</h2>
                <p className="mt-1 text-xs text-[#808080] sm:text-sm">Open the records connected to this opportunity.</p>
                <div className="mt-3 grid gap-2.5 sm:grid-cols-2 sm:gap-3">
                  <ResearchLink
                    to={`/businesses/${opportunity.business._id}`}
                    icon={<FiBriefcase aria-hidden="true" />}
                    label="Business"
                    title={opportunity.business.companyName}
                    tone="primary"
                  />
                  <ResearchLink
                    to={`/conversations/${opportunity.conversation._id}`}
                    icon={<FiMessageSquare aria-hidden="true" />}
                    label="Conversation"
                    title={`${opportunity.conversation.personName} · ${opportunity.conversation.personRole}`}
                  />
                </div>
                <Link to={`/problems/${opportunity.problem._id}`} className="group mt-2.5 block rounded-md bg-[#f7f6f4] p-3.5 transition hover:bg-[#efedea] focus:outline-none focus:ring-2 focus:ring-primary/20 sm:mt-3 sm:p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-[#999] sm:text-xs">Original problem</p>
                    <FiChevronRight className="shrink-0 text-[#999] transition group-hover:translate-x-0.5 group-hover:text-primary-dark" aria-hidden="true" />
                  </div>
                  <p className="mt-1 text-sm font-semibold text-primary-dark sm:text-base">{opportunity.problem.title}</p>
                  <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-[#666]">{opportunity.problem.description}</p>
                </Link>
                <div className="mt-2.5 flex items-start gap-2.5 rounded-md bg-primary-light p-3 text-primary-dark sm:mt-3 sm:p-4">
                  <FiUsers className="mt-0.5 shrink-0" aria-hidden="true" />
                  <p className="text-xs leading-5 sm:text-sm"><span className="font-semibold">{opportunity.scoreBreakdown.uniqueBusinessCount} unique businesses</span> report a problem with a matching tag or title.</p>
                </div>
              </section>

              <section className="space-y-3 rounded-lg bg-white p-3.5 sm:space-y-4 sm:p-6">
                <TextSection title="Why it looks valuable" content={opportunity.whyValuable} />
                <TextSection title="Market potential" content={opportunity.marketPotential} />
                <TextSection title="Notes" content={opportunity.notes} />
                <dl className="grid grid-cols-2 gap-x-4 gap-y-4 rounded-md bg-[#faf9f8] p-3.5 sm:grid-cols-3 sm:gap-5 sm:p-5">
                  <div><dt className="text-[10px] font-semibold uppercase tracking-wide text-[#999] sm:text-xs">Difficulty</dt><dd className="mt-1 text-sm font-semibold text-[#444]">{opportunity.difficulty}</dd></div>
                  <div><dt className="text-[10px] font-semibold uppercase tracking-wide text-[#999] sm:text-xs">Validation</dt><dd className="mt-1 text-sm font-semibold text-[#444]">{opportunity.validationStatus}</dd></div>
                  <div><dt className="text-[10px] font-semibold uppercase tracking-wide text-[#999] sm:text-xs">Status</dt><dd className="mt-1 text-sm font-semibold text-[#444]">{opportunity.status}</dd></div>
                </dl>
              </section>
            </div>

            <div className="order-first h-fit lg:order-last"><ScoreBreakdown breakdown={opportunity.scoreBreakdown} total={opportunity.opportunityScore} /></div>
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
