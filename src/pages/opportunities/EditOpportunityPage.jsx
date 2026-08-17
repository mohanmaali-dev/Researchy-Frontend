import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { ErrorState, LoadingState } from '../../components/businesses/PageState.jsx'
import OpportunityForm from '../../components/opportunities/OpportunityForm.jsx'
import BackButton from '../../components/ui/BackButton.jsx'
import * as opportunityService from '../../services/opportunity.service.js'

function EditOpportunityPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [opportunity, setOpportunity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
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

  const initialValues = useMemo(() => {
    if (!opportunity) return undefined

    return {
      whyValuable: opportunity.whyValuable,
      marketPotential: opportunity.marketPotential,
      difficulty: opportunity.difficulty,
      validationStatus: opportunity.validationStatus,
      notes: opportunity.notes || '',
      status: opportunity.status,
    }
  }, [opportunity])

  const handleSubmit = async (data) => {
    setSubmitting(true)
    setError('')

    try {
      await opportunityService.updateOpportunity(id, data)
      navigate(`/opportunities/${id}`, {
        state: { notice: 'Opportunity updated and score recalculated.' },
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
        <LoadingState label="Loading opportunity..." />
      ) : !opportunity ? (
        <ErrorState message={error} onRetry={loadOpportunity} />
      ) : (
        <>
          <BackButton fallback={`/opportunities/${id}`} />
          <div className="mb-8 mt-5">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-dark">Update research</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">Edit opportunity</h1>
            <p className="mt-2 text-slate-500">Update the research for “{opportunity.problem.title}”.</p>
          </div>
          <OpportunityForm
            problem={{
              ...opportunity.problem,
              business: opportunity.business,
              conversation: opportunity.conversation,
            }}
            initialValues={initialValues}
            onSubmit={handleSubmit}
            submitting={submitting}
            serverError={error}
            cancelTo={`/opportunities/${id}`}
          />
        </>
      )}
    </main>
  )
}

export default EditOpportunityPage
