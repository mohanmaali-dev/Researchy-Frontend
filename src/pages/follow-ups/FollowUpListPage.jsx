import { useCallback, useEffect, useState } from 'react'
import { FiBriefcase, FiCalendar, FiCheck, FiClock, FiPlus } from 'react-icons/fi'
import { Link } from 'react-router-dom'

import { ErrorState, LoadingState } from '../../components/businesses/PageState.jsx'
import FollowUpStatusBadge from '../../components/follow-ups/FollowUpStatusBadge.jsx'
import * as followUpService from '../../services/follow-up.service.js'

const FILTERS = ['Upcoming', 'Pending', 'Overdue', 'Completed', 'Cancelled', 'All']

const formatDate = (date) =>
  new Date(date).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })

function FollowUpListPage() {
  const [filter, setFilter] = useState('Upcoming')
  const [followUps, setFollowUps] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState('')
  const [error, setError] = useState('')

  const loadFollowUps = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const result = filter === 'Upcoming'
        ? await followUpService.getUpcomingFollowUps()
        : await followUpService.getFollowUps(filter === 'All' ? {} : { status: filter })
      setFollowUps(result.data)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    loadFollowUps()
  }, [loadFollowUps])

  const handleComplete = async (followUpId) => {
    setUpdatingId(followUpId)
    setError('')

    try {
      await followUpService.completeFollowUp(followUpId)
      await loadFollowUps()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setUpdatingId('')
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-dark">Things to revisit</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Follow-ups</h1>
          <p className="mt-2 text-slate-500">Upcoming reminders are ordered by the nearest date.</p>
        </div>
        <Link to="/follow-ups/new" className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark">
          <FiPlus aria-hidden="true" /> Add follow-up
        </Link>
      </div>

      <div className="mt-7 flex gap-2 overflow-x-auto pb-2" aria-label="Filter follow-ups">
        {FILTERS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${filter === item ? 'bg-primary text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
          >
            {item}
          </button>
        ))}
      </div>

      {error && followUps.length > 0 && (
        <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <section className="mt-6">
        {loading ? (
          <LoadingState label="Loading follow-ups..." />
        ) : error && followUps.length === 0 ? (
          <ErrorState message={error} onRetry={loadFollowUps} />
        ) : followUps.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary-light text-2xl text-primary-dark"><FiClock aria-hidden="true" /></span>
            <h2 className="mt-4 text-xl font-bold">No {filter.toLowerCase()} follow-ups</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Add a reminder from here or from a Business, Conversation, or Opportunity.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {followUps.map((followUp) => (
              <div key={followUp._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <Link to={`/follow-ups/${followUp._id}`} className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-bold text-slate-900">{followUp.reason}</h2>
                      <FollowUpStatusBadge status={followUp.status} isOverdue={followUp.isOverdue} />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                      <span className="inline-flex items-center gap-1.5"><FiBriefcase aria-hidden="true" /> {followUp.business.companyName}</span>
                      <span className="inline-flex items-center gap-1.5"><FiCalendar aria-hidden="true" /> {formatDate(followUp.followUpDate)}</span>
                      {followUp.opportunity && <span>Opportunity: {followUp.opportunity.problem?.title || 'Linked opportunity'}</span>}
                    </div>
                  </Link>
                  {followUp.status === 'Pending' && (
                    <button
                      type="button"
                      onClick={() => handleComplete(followUp._id)}
                      disabled={updatingId === followUp._id}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-emerald-200 px-3.5 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                    >
                      <FiCheck aria-hidden="true" /> {updatingId === followUp._id ? 'Completing...' : 'Complete'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default FollowUpListPage
