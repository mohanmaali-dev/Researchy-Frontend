import { useCallback, useEffect, useState } from 'react'
import { FiArrowLeft } from 'react-icons/fi'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { ErrorState, LoadingState } from '../../components/businesses/PageState.jsx'
import ConversationForm from '../../components/conversations/ConversationForm.jsx'
import * as businessService from '../../services/business.service.js'
import * as conversationService from '../../services/conversation.service.js'

function AddConversationPage() {
  const { businessId } = useParams()
  const navigate = useNavigate()
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const loadBusiness = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const result = await businessService.getBusinessById(businessId)
      setBusiness(result.data)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [businessId])

  useEffect(() => {
    loadBusiness()
  }, [loadBusiness])

  const handleSubmit = async (data) => {
    setSubmitting(true)
    setError('')

    try {
      const result = await conversationService.createConversation({
        ...data,
        business: businessId,
      })
      navigate(`/conversations/${result.data._id}`, {
        state: { notice: 'Conversation created successfully.' },
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
        <LoadingState label="Loading business..." />
      ) : !business ? (
        <ErrorState message={error} onRetry={loadBusiness} />
      ) : (
        <>
          <Link to={`/businesses/${businessId}`} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary-dark">
            <FiArrowLeft aria-hidden="true" /> Back to business
          </Link>
          <div className="mb-8 mt-5">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-dark">New record</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">Add conversation</h1>
            <p className="mt-2 text-slate-500">Record a conversation or visit for {business.companyName}.</p>
          </div>
          <ConversationForm
            businessName={business.companyName}
            onSubmit={handleSubmit}
            submitting={submitting}
            serverError={error}
            cancelTo={`/businesses/${businessId}`}
          />
        </>
      )}
    </main>
  )
}

export default AddConversationPage
