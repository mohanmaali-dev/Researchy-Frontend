import { useCallback, useEffect, useState } from 'react'
import { FiArrowLeft, FiBriefcase, FiEdit2, FiMessageSquare, FiTrash2 } from 'react-icons/fi'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'

import { ErrorState, LoadingState } from '../../components/businesses/PageState.jsx'
import OpportunityAction from '../../components/opportunities/OpportunityAction.jsx'
import ProblemStatusBadge from '../../components/problems/ProblemStatusBadge.jsx'
import ProblemTags from '../../components/problems/ProblemTags.jsx'
import ConfirmModal from '../../components/ui/ConfirmModal.jsx'
import * as problemService from '../../services/problem.service.js'

const formatDate = (date) =>
  new Date(date).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })

function DetailItem({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-slate-700">{children || '—'}</dd>
    </div>
  )
}

function TextSection({ title, content }) {
  return (
    <section className="rounded-xl bg-slate-50 p-5">
      <h2 className="font-bold text-slate-900">{title}</h2>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{content || '—'}</p>
    </section>
  )
}

function ProblemDetailsPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [problem, setProblem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState('')

  const loadProblem = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const result = await problemService.getProblemById(id)
      setProblem(result.data)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadProblem()
  }, [loadProblem])

  const handleDelete = async () => {
    setDeleting(true)
    setError('')

    try {
      await problemService.deleteProblem(problem._id)
      setConfirmDelete(false)
      navigate(`/conversations/${problem.conversation._id}`, { replace: true })
    } catch (requestError) {
      setError(requestError.message)
      setDeleting(false)
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      {loading ? (
        <LoadingState label="Loading problem..." />
      ) : error && !problem ? (
        <ErrorState message={error} />
      ) : (
        <>
          <Link to={`/conversations/${problem.conversation._id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary-dark">
            <FiArrowLeft aria-hidden="true" /> Back to conversation
          </Link>

          {location.state?.notice && (
            <p className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {location.state.notice}
            </p>
          )}

          {error && (
            <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-slate-50/60 p-5 sm:p-7">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-bold tracking-tight">{problem.title}</h1>
                    <ProblemStatusBadge status={problem.status} />
                  </div>
                  <p className="mt-3 inline-flex rounded-full bg-red-50 px-3 py-1 text-sm font-bold text-red-700">
                    Pain level {problem.painLevel}/10
                  </p>
                  {problem.tags?.length > 0 && (
                    <div className="mt-4">
                      <ProblemTags tags={problem.tags} />
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <OpportunityAction problemId={problem._id} />
                  <Link
                    to={`/problems/${problem._id}/edit`}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <FiEdit2 aria-hidden="true" /> Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    disabled={deleting}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    <FiTrash2 aria-hidden="true" /> {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-7">
              <div className="grid gap-4 sm:grid-cols-2">
                <Link to={`/businesses/${problem.business._id}`} className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 hover:bg-slate-50">
                  <FiBriefcase className="text-primary-dark" aria-hidden="true" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Business</p>
                    <p className="mt-1 font-bold">{problem.business.companyName}</p>
                  </div>
                </Link>
                <Link to={`/conversations/${problem.conversation._id}`} className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 hover:bg-slate-50">
                  <FiMessageSquare className="text-primary-dark" aria-hidden="true" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Conversation</p>
                    <p className="mt-1 font-bold">{problem.conversation.personName} · {formatDate(problem.conversation.conversationDate)}</p>
                  </div>
                </Link>
              </div>

              <div className="mt-6 space-y-5">
                <TextSection title="Description" content={problem.description} />
                <TextSection title="Current process / current solution" content={problem.currentProcess} />
              </div>

              <dl className="mt-6 grid gap-6 rounded-xl border border-slate-200 p-5 sm:grid-cols-2 lg:grid-cols-3">
                <DetailItem label="Frequency">{problem.frequency}</DetailItem>
                <DetailItem label="Pain level">{problem.painLevel}/10</DetailItem>
                <DetailItem label="Time impact">{problem.timeImpact}</DetailItem>
                <DetailItem label="Financial impact">{problem.financialImpact}</DetailItem>
                <DetailItem label="Existing software/tool">{problem.existingSoftware}</DetailItem>
                <DetailItem label="Willingness to pay">{problem.willingnessToPay}</DetailItem>
                <DetailItem label="Status">{problem.status}</DetailItem>
              </dl>

              <div className="mt-6">
                <TextSection title="Notes" content={problem.notes} />
              </div>
            </div>
          </section>
          <ConfirmModal
            open={confirmDelete}
            title="Delete problem?"
            message={`“${problem.title}” will be permanently deleted. This action cannot be undone.`}
            confirmLabel="Delete problem"
            loading={deleting}
            onConfirm={handleDelete}
            onCancel={() => setConfirmDelete(false)}
          />
        </>
      )}
    </main>
  )
}

export default ProblemDetailsPage
