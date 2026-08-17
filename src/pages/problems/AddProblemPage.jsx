import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { ErrorState, LoadingState } from '../../components/businesses/PageState.jsx'
import ProblemForm from '../../components/problems/ProblemForm.jsx'
import BackButton from '../../components/ui/BackButton.jsx'
import * as conversationService from '../../services/conversation.service.js'
import * as problemService from '../../services/problem.service.js'

const formatDate = (date) =>
  new Date(date).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })

function AddProblemPage() {
  const { conversationId } = useParams()
  const navigate = useNavigate()
  const [conversation, setConversation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const loadConversation = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const result = await conversationService.getConversationById(conversationId)
      setConversation(result.data)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [conversationId])

  useEffect(() => {
    loadConversation()
  }, [loadConversation])

  const handleSubmit = async (data) => {
    setSubmitting(true)
    setError('')

    try {
      const result = await problemService.createProblem({
        ...data,
        business: conversation.business._id,
        conversation: conversationId,
      })
      navigate(`/problems/${result.data._id}`)
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
        <LoadingState label="Loading conversation..." />
      ) : !conversation ? (
        <ErrorState message={error} onRetry={loadConversation} />
      ) : (
        <>
          <BackButton fallback={`/conversations/${conversationId}`} />
          <div className="mb-8 mt-5">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-dark">New record</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">Add problem</h1>
            <p className="mt-2 text-slate-500">Record a problem discovered in this conversation.</p>
          </div>
          <ProblemForm
            businessName={conversation.business.companyName}
            conversationLabel={`${conversation.personName} · ${formatDate(conversation.conversationDate)}`}
            onSubmit={handleSubmit}
            submitting={submitting}
            serverError={error}
            cancelTo={`/conversations/${conversationId}`}
          />
        </>
      )}
    </main>
  )
}

export default AddProblemPage
