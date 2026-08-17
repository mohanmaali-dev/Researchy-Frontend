import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { ErrorState, LoadingState } from '../../components/businesses/PageState.jsx'
import FollowUpForm from '../../components/follow-ups/FollowUpForm.jsx'
import BackButton from '../../components/ui/BackButton.jsx'
import * as businessService from '../../services/business.service.js'
import * as followUpService from '../../services/follow-up.service.js'
import * as opportunityService from '../../services/opportunity.service.js'

const getToday = () => {
  const now = new Date()
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

function AddFollowUpPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [businesses, setBusinesses] = useState([])
  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const initialValues = useMemo(
    () => ({
      business: searchParams.get('businessId') || '',
      conversation: searchParams.get('conversationId') || '',
      opportunity: searchParams.get('opportunityId') || '',
      followUpDate: getToday(),
      reason: '',
      notes: '',
      status: 'Pending',
    }),
    [searchParams],
  )

  const loadOptions = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const [businessResult, opportunityResult] = await Promise.all([
        businessService.getBusinesses(),
        opportunityService.getOpportunities(),
      ])
      setBusinesses(businessResult.data)
      setOpportunities(opportunityResult.data)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOptions()
  }, [loadOptions])

  const handleSubmit = async (data) => {
    setSubmitting(true)
    setError('')

    try {
      const result = await followUpService.createFollowUp(data)
      navigate(`/follow-ups/${result.data._id}`, {
        state: { notice: 'Follow-up created successfully.' },
      })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <BackButton fallback="/follow-ups" />
      <div className="mb-8 mt-5">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary-dark">Personal reminder</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Add Follow-up</h1>
        <p className="mt-2 text-slate-500">Record what to revisit and when.</p>
      </div>

      {loading ? (
        <LoadingState label="Loading form..." />
      ) : error && businesses.length === 0 ? (
        <ErrorState message={error} onRetry={loadOptions} />
      ) : (
        <FollowUpForm
          businesses={businesses}
          opportunities={opportunities}
          initialValues={initialValues}
          onSubmit={handleSubmit}
          submitting={submitting}
          serverError={error}
          cancelTo="/follow-ups"
        />
      )}
    </main>
  )
}

export default AddFollowUpPage
