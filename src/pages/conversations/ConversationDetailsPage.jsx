import { useCallback, useEffect, useState } from 'react'
import { FiBriefcase, FiCalendar, FiEdit2, FiTrash2, FiUser } from 'react-icons/fi'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'

import { ErrorState, LoadingState } from '../../components/businesses/PageState.jsx'
import AddFollowUpLink from '../../components/follow-ups/AddFollowUpLink.jsx'
import ConfirmModal from '../../components/ui/ConfirmModal.jsx'
import BackButton from '../../components/ui/BackButton.jsx'
import ProblemList from '../../components/problems/ProblemList.jsx'
import * as conversationService from '../../services/conversation.service.js'

const formatDate = (date) =>
  new Date(date).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })

function NoteSection({ title, content }) {
  return (
    <section className="rounded-xl bg-slate-50 p-5">
      <h2 className="font-bold text-slate-900">{title}</h2>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{content || '—'}</p>
    </section>
  )
}

function ConversationDetailsPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [conversation, setConversation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
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

  const handleDelete = async () => {
    setDeleting(true)
    setError('')

    try {
      await conversationService.deleteConversation(conversation._id)
      setConfirmDelete(false)
      navigate(`/businesses/${conversation.business._id}`, { replace: true })
    } catch (requestError) {
      setError(requestError.message)
      setDeleting(false)
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      {loading ? (
        <LoadingState label="Loading conversation..." />
      ) : error && !conversation ? (
        <ErrorState message={error} />
      ) : (
        <>
          <BackButton fallback={`/businesses/${conversation.business._id}`} />

          {location.state?.notice && (
            <p className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {location.state.notice}
            </p>
          )}

          {error && (
            <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-slate-50/60 p-5 sm:p-7">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-primary-dark">Conversation / visit</p>
                  <h1 className="mt-1 text-3xl font-bold tracking-tight">{conversation.personName}</h1>
                  <p className="mt-2 text-slate-500">{conversation.personRole}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <AddFollowUpLink
                    businessId={conversation.business._id}
                    conversationId={conversation._id}
                  />
                  <Link
                    to={`/conversations/${conversation._id}/edit`}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <FiEdit2 aria-hidden="true" /> Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    disabled={deleting}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    <FiTrash2 aria-hidden="true" /> {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-7">
              <dl className="grid gap-5 rounded-xl border border-slate-200 p-5 sm:grid-cols-3">
                <div>
                  <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400"><FiBriefcase aria-hidden="true" /> Business</dt>
                  <dd className="mt-2 text-sm font-semibold text-slate-700">{conversation.business.companyName}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400"><FiCalendar aria-hidden="true" /> Date</dt>
                  <dd className="mt-2 text-sm font-semibold text-slate-700">{formatDate(conversation.conversationDate)}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400"><FiUser aria-hidden="true" /> Person</dt>
                  <dd className="mt-2 text-sm font-semibold text-slate-700">{conversation.personName} · {conversation.personRole}</dd>
                </div>
              </dl>

              <div className="mt-6 space-y-5">
                <NoteSection title="Raw conversation notes" content={conversation.rawConversationNotes} />
                <NoteSection title="Important observations" content={conversation.importantObservations} />
                <NoteSection title="Follow-up notes" content={conversation.followUpNotes} />
              </div>
            </div>
          </section>
          <ProblemList conversationId={conversation._id} />
          <ConfirmModal
            open={confirmDelete}
            title="Delete conversation?"
            message={`The conversation with ${conversation.personName} will be permanently deleted. This action cannot be undone.`}
            confirmLabel="Delete conversation"
            loading={deleting}
            onConfirm={handleDelete}
            onCancel={() => setConfirmDelete(false)}
          />
        </>
      )}
    </main>
  )
}

export default ConversationDetailsPage
