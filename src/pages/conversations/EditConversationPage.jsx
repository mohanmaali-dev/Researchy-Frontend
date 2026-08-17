import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { ErrorState, LoadingState } from '../../components/businesses/PageState.jsx'
import ConversationForm from '../../components/conversations/ConversationForm.jsx'
import BackButton from '../../components/ui/BackButton.jsx'
import * as conversationService from '../../services/conversation.service.js'

function EditConversationPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [conversation, setConversation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const loadConversation = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const result = await conversationService.getConversationById(id)
      setConversation(result.data)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadConversation()
  }, [loadConversation])

  const initialValues = useMemo(() => {
    if (!conversation) return undefined

    return {
      conversationDate: conversation.conversationDate.slice(0, 10),
      personName: conversation.personName,
      personRole: conversation.personRole,
      rawConversationNotes: conversation.rawConversationNotes,
      importantObservations: conversation.importantObservations || '',
      followUpNotes: conversation.followUpNotes || '',
    }
  }, [conversation])

  const handleSubmit = async (data) => {
    setSubmitting(true)
    setError('')

    try {
      await conversationService.updateConversation(id, data)
      navigate(`/conversations/${id}`)
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
          <BackButton fallback={`/conversations/${id}`} />
          <div className="mb-8 mt-5">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-dark">Update record</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">Edit conversation</h1>
            <p className="mt-2 text-slate-500">Update the conversation with {conversation.personName}.</p>
          </div>
          <ConversationForm
            businessName={conversation.business.companyName}
            initialValues={initialValues}
            onSubmit={handleSubmit}
            submitting={submitting}
            serverError={error}
            cancelTo={`/conversations/${id}`}
          />
        </>
      )}
    </main>
  )
}

export default EditConversationPage
