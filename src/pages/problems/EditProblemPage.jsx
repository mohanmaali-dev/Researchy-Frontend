import { useCallback, useEffect, useMemo, useState } from 'react'
import { FiArrowLeft } from 'react-icons/fi'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { ErrorState, LoadingState } from '../../components/businesses/PageState.jsx'
import ProblemForm from '../../components/problems/ProblemForm.jsx'
import * as problemService from '../../services/problem.service.js'

const formatDate = (date) =>
  new Date(date).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })

function EditProblemPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [problem, setProblem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
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

  const initialValues = useMemo(() => {
    if (!problem) return undefined

    return {
      title: problem.title,
      description: problem.description,
      currentProcess: problem.currentProcess,
      frequency: problem.frequency,
      painLevel: problem.painLevel,
      timeImpact: problem.timeImpact,
      financialImpact: problem.financialImpact || '',
      existingSoftware: problem.existingSoftware || '',
      willingnessToPay: problem.willingnessToPay,
      notes: problem.notes || '',
      status: problem.status,
      tags: problem.tags || [],
    }
  }, [problem])

  const handleSubmit = async (data) => {
    setSubmitting(true)
    setError('')

    try {
      await problemService.updateProblem(id, data)
      navigate(`/problems/${id}`, {
        state: { notice: 'Problem updated successfully.' },
      })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      {loading ? (
        <LoadingState label="Loading problem..." />
      ) : !problem ? (
        <ErrorState message={error} onRetry={loadProblem} />
      ) : (
        <>
          <Link to={`/problems/${id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary-dark">
            <FiArrowLeft aria-hidden="true" /> Back to problem
          </Link>
          <div className="mb-8 mt-5">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-dark">Update record</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">Edit problem</h1>
            <p className="mt-2 text-slate-500">Update “{problem.title}”.</p>
          </div>
          <ProblemForm
            businessName={problem.business.companyName}
            conversationLabel={`${problem.conversation.personName} · ${formatDate(problem.conversation.conversationDate)}`}
            initialValues={initialValues}
            onSubmit={handleSubmit}
            submitting={submitting}
            serverError={error}
            cancelTo={`/problems/${id}`}
          />
        </>
      )}
    </main>
  )
}

export default EditProblemPage
