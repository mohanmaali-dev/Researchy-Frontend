import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { ErrorState, LoadingState } from '../../components/businesses/PageState.jsx'
import OpportunityForm from '../../components/opportunities/OpportunityForm.jsx'
import BackButton from '../../components/ui/BackButton.jsx'
import * as opportunityService from '../../services/opportunity.service.js'
import * as problemService from '../../services/problem.service.js'

function AddOpportunityPage() {
  const { problemId } = useParams()
  const navigate = useNavigate()
  const [problem, setProblem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const loadProblem = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const [problemResult, opportunityResult] = await Promise.all([
        problemService.getProblemById(problemId),
        opportunityService.getOpportunityByProblem(problemId),
      ])

      if (opportunityResult.data) {
        navigate(`/opportunities/${opportunityResult.data._id}`, { replace: true })
        return
      }

      setProblem(problemResult.data)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [navigate, problemId])

  useEffect(() => {
    loadProblem()
  }, [loadProblem])

  const handleSubmit = async (data) => {
    setSubmitting(true)
    setError('')

    try {
      const result = await opportunityService.createOpportunity({ ...data, problem: problemId })
      navigate(`/opportunities/${result.data._id}`)
      return true
    } catch (requestError) {
      setError(requestError.message)
      return false
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      {loading ? (
        <LoadingState label="Loading Problem..." />
      ) : !problem ? (
        <ErrorState message={error} onRetry={loadProblem} />
      ) : (
        <>
          <BackButton fallback={`/problems/${problemId}`} />
          <div className="mb-8 mt-5">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-dark">Promising Problem</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">Mark as Opportunity</h1>
            <p className="mt-2 text-slate-500">Capture why this Problem is worth researching further.</p>
          </div>
          <OpportunityForm
            problem={problem}
            onSubmit={handleSubmit}
            submitting={submitting}
            serverError={error}
            cancelTo={`/problems/${problemId}`}
          />
        </>
      )}
    </main>
  )
}

export default AddOpportunityPage
