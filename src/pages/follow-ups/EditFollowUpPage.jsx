import { useCallback, useEffect, useMemo, useState } from 'react'
import { FiArrowLeft } from 'react-icons/fi'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { ErrorState, LoadingState } from '../../components/businesses/PageState.jsx'
import FollowUpForm from '../../components/follow-ups/FollowUpForm.jsx'
import * as businessService from '../../services/business.service.js'
import * as followUpService from '../../services/follow-up.service.js'
import * as opportunityService from '../../services/opportunity.service.js'

function EditFollowUpPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [followUp, setFollowUp] = useState(null)
  const [businesses, setBusinesses] = useState([])
  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const [followUpResult, businessResult, opportunityResult] = await Promise.all([
        followUpService.getFollowUpById(id),
        businessService.getBusinesses(),
        opportunityService.getOpportunities(),
      ])
      setFollowUp(followUpResult.data)
      setBusinesses(businessResult.data)
      setOpportunities(opportunityResult.data)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadData()
  }, [loadData])

  const initialValues = useMemo(
    () => followUp && ({
      business: followUp.business._id,
      conversation: followUp.conversation?._id || '',
      opportunity: followUp.opportunity?._id || '',
      followUpDate: followUp.followUpDate.slice(0, 10),
      reason: followUp.reason,
      notes: followUp.notes || '',
      status: followUp.status,
    }),
    [followUp],
  )

  const handleSubmit = async (data) => {
    setSubmitting(true)
    setError('')

    try {
      await followUpService.updateFollowUp(id, data)
      navigate(`/follow-ups/${id}`, {
        state: { notice: 'Follow-up updated successfully.' },
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
        <LoadingState label="Loading follow-up..." />
      ) : !followUp ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : (
        <>
          <Link to={`/follow-ups/${id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary-dark">
            <FiArrowLeft aria-hidden="true" /> Back to follow-up
          </Link>
          <div className="mb-8 mt-5">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-dark">Update reminder</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">Edit Follow-up</h1>
          </div>
          <FollowUpForm
            businesses={businesses}
            opportunities={opportunities}
            initialValues={initialValues}
            onSubmit={handleSubmit}
            submitting={submitting}
            serverError={error}
            cancelTo={`/follow-ups/${id}`}
          />
        </>
      )}
    </main>
  )
}

export default EditFollowUpPage
