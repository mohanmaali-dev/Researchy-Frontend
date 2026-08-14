import { useCallback, useEffect, useState } from 'react'
import { FiCalendar, FiChevronRight, FiMessageSquare, FiPlus, FiTrash2, FiUser } from 'react-icons/fi'
import { Link } from 'react-router-dom'

import * as conversationService from '../../services/conversation.service.js'
import ConfirmModal from '../ui/ConfirmModal.jsx'

const formatDate = (date) =>
  new Date(date).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })

function ConversationList({ businessId }) {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [conversationToDelete, setConversationToDelete] = useState(null)

  const loadConversations = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const result = await conversationService.getConversationsByBusiness(businessId)
      setConversations(result.data)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [businessId])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  const handleDelete = async (conversation) => {
    setDeletingId(conversation._id)
    setError('')

    try {
      await conversationService.deleteConversation(conversation._id)
      setConversations((current) => current.filter((item) => item._id !== conversation._id))
      setConversationToDelete(null)
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
            <FiMessageSquare className="text-primary-dark" aria-hidden="true" />
            <h2 className="text-xl font-bold">Conversations and visits</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">Conversation history for this business.</p>
        </div>
        <Link
          to={`/businesses/${businessId}/conversations/new`}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          <FiPlus aria-hidden="true" /> Add conversation
        </Link>
      </div>

      {error && (
        <div role="alert" className="m-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:m-7">
          <p>{error}</p>
          <button type="button" onClick={loadConversations} className="mt-2 font-semibold underline">
            Try again
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid min-h-44 place-items-center">
          <div className="text-center">
            <div className="mx-auto size-8 animate-spin rounded-full border-4 border-primary-light border-t-primary" />
            <p className="mt-3 text-sm text-slate-500">Loading conversations...</p>
          </div>
        </div>
      ) : !error && conversations.length === 0 ? (
        <div className="px-6 py-14 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary-light text-xl text-primary-dark">
            <FiMessageSquare aria-hidden="true" />
          </span>
          <h3 className="mt-4 font-bold">No conversations yet</h3>
          <p className="mt-1 text-sm text-slate-500">Record the first conversation or business visit.</p>
          <Link
            to={`/businesses/${businessId}/conversations/new`}
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary-dark hover:underline"
          >
            <FiPlus aria-hidden="true" /> Add conversation
          </Link>
        </div>
      ) : !error ? (
        <div className="divide-y divide-slate-100">
          {conversations.map((conversation) => (
            <article key={conversation._id} className="flex flex-col gap-4 p-5 transition hover:bg-slate-50/70 sm:flex-row sm:items-center sm:p-6">
              <Link to={`/conversations/${conversation._id}`} className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                  <p className="flex items-center gap-2 font-bold text-slate-900">
                    <FiUser className="text-primary-dark" aria-hidden="true" />
                    {conversation.personName}
                  </p>
                  <p className="text-sm text-slate-500">{conversation.personRole}</p>
                </div>
                <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                  <FiCalendar aria-hidden="true" /> {formatDate(conversation.conversationDate)}
                </p>
              </Link>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setConversationToDelete(conversation)}
                  disabled={deletingId === conversation._id}
                  aria-label={`Delete conversation with ${conversation.personName}`}
                  className="rounded-lg p-2.5 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                >
                  <FiTrash2 aria-hidden="true" />
                </button>
                <Link
                  to={`/conversations/${conversation._id}`}
                  aria-label={`View conversation with ${conversation.personName}`}
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
        open={Boolean(conversationToDelete)}
        title="Delete conversation?"
        message={conversationToDelete ? `The conversation with ${conversationToDelete.personName} from ${formatDate(conversationToDelete.conversationDate)} will be permanently deleted.` : ''}
        confirmLabel="Delete conversation"
        loading={Boolean(deletingId)}
        onConfirm={() => conversationToDelete && handleDelete(conversationToDelete)}
        onCancel={() => setConversationToDelete(null)}
      />
    </section>
  )
}

export default ConversationList
