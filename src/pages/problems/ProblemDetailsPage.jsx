import { useCallback, useEffect, useState } from 'react'
import { FiBriefcase, FiChevronRight, FiEdit2, FiMessageSquare, FiTrash2 } from 'react-icons/fi'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'

import { ErrorState, LoadingState } from '../../components/businesses/PageState.jsx'
import OpportunityAction from '../../components/opportunities/OpportunityAction.jsx'
import ProblemStatusBadge from '../../components/problems/ProblemStatusBadge.jsx'
import ProblemTags from '../../components/problems/ProblemTags.jsx'
import { formatTag } from '../../components/problems/tag.utils.js'
import ConfirmModal from '../../components/ui/ConfirmModal.jsx'
import BackButton from '../../components/ui/BackButton.jsx'
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
    <div className="min-w-0">
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-xs">{label}</dt>
      <dd className="mt-1 break-words whitespace-pre-wrap text-sm leading-5 text-slate-700 sm:mt-1.5 sm:leading-6">{children || '—'}</dd>
    </div>
  )
}

function TextSection({ title, content }) {
  return (
    <section className="rounded-md bg-[#f7f6f4] p-3.5 sm:p-5">
      <h2 className="text-sm font-semibold text-slate-900 sm:text-base">{title}</h2>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700 sm:mt-3 sm:leading-7">{content || '—'}</p>
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
    <main className="w-full px-1 pb-3 pt-1 sm:px-2">
      {loading ? (
        <LoadingState label="Loading problem..." />
      ) : error && !problem ? (
        <ErrorState message={error} />
      ) : (
        <>
          <BackButton fallback={`/conversations/${problem.conversation._id}`} />

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

          <section className="mt-3 overflow-hidden rounded-lg bg-white shadow-[0_2px_10px_rgba(44,38,34,0.05)]">
            <div className="bg-[#faf9f8] p-4 sm:p-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="break-words text-2xl font-semibold tracking-[-0.025em] sm:text-3xl">{problem.title}</h1>
                    <ProblemStatusBadge status={problem.status} />
                  </div>
                  <p className="mt-2.5 inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 sm:mt-3 sm:px-3 sm:text-sm">
                    Pain level {problem.painLevel}/10
                  </p>
                  {problem.tags?.length > 0 && (
                    <>
                      <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 sm:hidden">
                        {problem.tags.map((tag) => (
                          <span key={tag} className="shrink-0 rounded-full bg-primary-light px-2 py-0.5 text-xs font-medium text-primary-dark">
                            {formatTag(tag)}
                          </span>
                        ))}
                      </div>
                      <div className="mt-4 hidden sm:block"><ProblemTags tags={problem.tags} /></div>
                    </>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                  <OpportunityAction problemId={problem._id} className="col-span-2 w-full sm:w-auto" />
                  <Link
                    to={`/problems/${problem._id}/edit`}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-[#ebe9e6] px-4 py-2.5 text-sm font-semibold text-[#333] transition hover:bg-[#dfdcd8]"
                  >
                    <FiEdit2 aria-hidden="true" /> Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    disabled={deleting}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                  >
                    <FiTrash2 aria-hidden="true" /> {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3.5 sm:p-7">
              <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-4">
                <Link to={`/businesses/${problem.business._id}`} className="group flex min-w-0 items-center gap-3 rounded-md bg-primary-light p-3 transition hover:bg-[#ffebe5] focus:outline-none focus:ring-2 focus:ring-primary/20 sm:p-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-md bg-white text-primary-dark"><FiBriefcase aria-hidden="true" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Business</p>
                    <p className="mt-0.5 truncate text-sm font-semibold text-[#333] group-hover:text-primary-dark sm:mt-1 sm:text-base">{problem.business.companyName}</p>
                  </div>
                  <FiChevronRight className="shrink-0 text-primary-dark transition group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
                <Link to={`/conversations/${problem.conversation._id}`} className="group flex min-w-0 items-center gap-3 rounded-md bg-[#f3f2f0] p-3 transition hover:bg-[#ebe9e6] focus:outline-none focus:ring-2 focus:ring-primary/20 sm:p-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-md bg-white text-primary-dark"><FiMessageSquare aria-hidden="true" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Conversation</p>
                    <p className="mt-0.5 truncate text-sm font-semibold text-[#333] group-hover:text-primary-dark sm:mt-1 sm:text-base">{problem.conversation.personName} · {formatDate(problem.conversation.conversationDate)}</p>
                  </div>
                  <FiChevronRight className="shrink-0 text-[#888] transition group-hover:translate-x-0.5 group-hover:text-primary-dark" aria-hidden="true" />
                </Link>
              </div>

              <div className="mt-3 space-y-3 sm:mt-6 sm:space-y-5">
                <TextSection title="Description" content={problem.description} />
                <TextSection title="Current process / current solution" content={problem.currentProcess} />
              </div>

              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-5 rounded-md bg-[#faf9f8] p-3.5 sm:mt-6 sm:gap-6 sm:p-5 lg:grid-cols-3">
                <DetailItem label="Frequency">{problem.frequency}</DetailItem>
                <DetailItem label="Pain level">{problem.painLevel}/10</DetailItem>
                <DetailItem label="Time impact">{problem.timeImpact}</DetailItem>
                <DetailItem label="Financial impact">{problem.financialImpact}</DetailItem>
                <DetailItem label="Existing software/tool">{problem.existingSoftware}</DetailItem>
                <DetailItem label="Willingness to pay">{problem.willingnessToPay}</DetailItem>
                <DetailItem label="Status">{problem.status}</DetailItem>
              </dl>

              <div className="mt-3 sm:mt-6">
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
