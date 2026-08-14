import { useCallback, useEffect, useState } from 'react'
import { FiAlertTriangle, FiChevronRight, FiPlus, FiTrash2 } from 'react-icons/fi'
import { Link } from 'react-router-dom'

import * as problemService from '../../services/problem.service.js'
import ConfirmModal from '../ui/ConfirmModal.jsx'
import ProblemStatusBadge from './ProblemStatusBadge.jsx'
import ProblemTags from './ProblemTags.jsx'

function ProblemList({ conversationId }) {
  const [problems, setProblems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [problemToDelete, setProblemToDelete] = useState(null)

  const loadProblems = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const result = await problemService.getProblemsByConversation(conversationId)
      setProblems(result.data)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [conversationId])

  useEffect(() => {
    loadProblems()
  }, [loadProblems])

  const handleDelete = async (problem) => {
    setDeletingId(problem._id)
    setError('')

    try {
      await problemService.deleteProblem(problem._id)
      setProblems((current) => current.filter((item) => item._id !== problem._id))
      setProblemToDelete(null)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/60 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div>
          <div className="flex items-center gap-3">
            <FiAlertTriangle className="text-primary-dark" aria-hidden="true" />
            <h2 className="text-xl font-bold">Problems discovered</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">Problems revealed during this conversation.</p>
        </div>
        <Link
          to={`/conversations/${conversationId}/problems/new`}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          <FiPlus aria-hidden="true" /> Add problem
        </Link>
      </div>

      {error && (
        <div role="alert" className="m-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:m-7">
          <p>{error}</p>
          <button type="button" onClick={loadProblems} className="mt-2 font-semibold underline">
            Try again
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid min-h-44 place-items-center">
          <div className="text-center">
            <div className="mx-auto size-8 animate-spin rounded-full border-4 border-primary-light border-t-primary" />
            <p className="mt-3 text-sm text-slate-500">Loading problems...</p>
          </div>
        </div>
      ) : !error && problems.length === 0 ? (
        <div className="px-6 py-14 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary-light text-xl text-primary-dark">
            <FiAlertTriangle aria-hidden="true" />
          </span>
          <h3 className="mt-4 font-bold">No problems recorded</h3>
          <p className="mt-1 text-sm text-slate-500">Add the first problem discovered in this conversation.</p>
          <Link
            to={`/conversations/${conversationId}/problems/new`}
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary-dark hover:underline"
          >
            <FiPlus aria-hidden="true" /> Add problem
          </Link>
        </div>
      ) : !error ? (
        <div className="divide-y divide-slate-100">
          {problems.map((problem) => (
            <article key={problem._id} className="flex flex-col gap-4 p-5 transition hover:bg-slate-50/70 sm:flex-row sm:items-center sm:p-6">
              <Link to={`/problems/${problem._id}`} className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-slate-900">{problem.title}</h3>
                  <ProblemStatusBadge status={problem.status} />
                </div>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{problem.description}</p>
                {problem.tags?.length > 0 && (
                  <div className="mt-3">
                    <ProblemTags tags={problem.tags} compact />
                  </div>
                )}
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-500">
                  <span className="rounded-full bg-red-50 px-2.5 py-1 text-red-700">Pain {problem.painLevel}/10</span>
                  <span>Frequency: {problem.frequency}</span>
                  <span>Willing to pay: {problem.willingnessToPay}</span>
                </div>
              </Link>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setProblemToDelete(problem)}
                  disabled={deletingId === problem._id}
                  aria-label={`Delete ${problem.title}`}
                  className="rounded-lg p-2.5 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                >
                  <FiTrash2 aria-hidden="true" />
                </button>
                <Link
                  to={`/problems/${problem._id}`}
                  aria-label={`View ${problem.title}`}
                  className="rounded-lg p-2.5 text-slate-400 hover:bg-primary-light hover:text-primary-dark"
                >
                  <FiChevronRight aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : null}
      <ConfirmModal
        open={Boolean(problemToDelete)}
        title="Delete problem?"
        message={problemToDelete ? `“${problemToDelete.title}” will be permanently deleted. This action cannot be undone.` : ''}
        confirmLabel="Delete problem"
        loading={Boolean(deletingId)}
        onConfirm={() => problemToDelete && handleDelete(problemToDelete)}
        onCancel={() => setProblemToDelete(null)}
      />
    </section>
  )
}

export default ProblemList
