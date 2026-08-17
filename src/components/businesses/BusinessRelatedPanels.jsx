import { useCallback, useEffect, useState } from 'react'
import { FiAlertCircle, FiCalendar, FiClock, FiMessageSquare, FiStar } from 'react-icons/fi'
import { Link } from 'react-router-dom'

import * as followUpService from '../../services/follow-up.service.js'
import * as opportunityService from '../../services/opportunity.service.js'
import * as problemService from '../../services/problem.service.js'
import FollowUpStatusBadge from '../follow-ups/FollowUpStatusBadge.jsx'
import AddFollowUpLink from '../follow-ups/AddFollowUpLink.jsx'
import { ScoreBadge, ValidationBadge } from '../opportunities/OpportunityBadges.jsx'
import ProblemStatusBadge from '../problems/ProblemStatusBadge.jsx'
import ProblemTags from '../problems/ProblemTags.jsx'
import { ErrorState, LoadingState } from './PageState.jsx'

const formatDate = (date) =>
  new Date(date).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })

function PanelShell({ icon: Icon, title, description, action, children }) {
  return (
    <section className="rounded-[22px] bg-white p-5 sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary-light text-primary-dark">
            <Icon aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-xl">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-[#777]">{description}</p>
          </div>
        </div>
        {action}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  )
}

function EmptyPanel({ message }) {
  return <p className="rounded-2xl bg-[#f7f7f7] px-5 py-10 text-center text-sm text-[#777]">{message}</p>
}

export function BusinessProblemsPanel({ businessId }) {
  const [problems, setProblems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadProblems = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const result = await problemService.getProblemsByBusiness(businessId)
      setProblems(result.data)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [businessId])

  useEffect(() => {
    loadProblems()
  }, [loadProblems])

  return (
    <PanelShell
      icon={FiAlertCircle}
      title="Problems"
      description="Problems discovered during this business’s conversations."
    >
      {loading ? (
        <LoadingState label="Loading problems..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadProblems} />
      ) : problems.length === 0 ? (
        <EmptyPanel message="No problems recorded yet. Open a Conversation to add the first problem." />
      ) : (
        <div className="space-y-2">
          {problems.map((problem) => (
            <Link
              key={problem._id}
              to={`/problems/${problem._id}`}
              className="block rounded-2xl bg-[#f7f7f7] p-4 transition hover:bg-[#f2f2f2]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-[#222]">{problem.title}</h3>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-[#777]">
                    <FiMessageSquare aria-hidden="true" />
                    {problem.conversation?.personName || 'Linked conversation'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs text-red-600">Pain {problem.painLevel}/10</span>
                  <ProblemStatusBadge status={problem.status} />
                </div>
              </div>
              {problem.tags?.length > 0 && (
                <div className="mt-3"><ProblemTags tags={problem.tags} compact /></div>
              )}
            </Link>
          ))}
        </div>
      )}
    </PanelShell>
  )
}

export function BusinessOpportunitiesPanel({ businessId }) {
  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadOpportunities = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const result = await opportunityService.getOpportunities()
      setOpportunities(
        result.data.filter((opportunity) => opportunity.business?._id === businessId),
      )
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [businessId])

  useEffect(() => {
    loadOpportunities()
  }, [loadOpportunities])

  return (
    <PanelShell
      icon={FiStar}
      title="Opportunities"
      description="Promising problems from this business that need further research."
    >
      {loading ? (
        <LoadingState label="Loading opportunities..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadOpportunities} />
      ) : opportunities.length === 0 ? (
        <EmptyPanel message="No opportunities yet. Open a promising Problem and choose Mark as Opportunity." />
      ) : (
        <div className="space-y-2">
          {opportunities.map((opportunity) => (
            <Link
              key={opportunity._id}
              to={`/opportunities/${opportunity._id}`}
              className="flex flex-col gap-3 rounded-2xl bg-[#f7f7f7] p-4 transition hover:bg-[#f2f2f2] sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-medium text-[#222]">{opportunity.problem?.title || 'Opportunity'}</h3>
                <p className="mt-1 text-xs text-[#777]">{opportunity.difficulty} difficulty</p>
              </div>
              <ValidationBadge status={opportunity.validationStatus} />
              <ScoreBadge score={opportunity.opportunityScore} />
            </Link>
          ))}
        </div>
      )}
    </PanelShell>
  )
}

export function BusinessFollowUpsPanel({ businessId }) {
  const [followUps, setFollowUps] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadFollowUps = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const result = await followUpService.getFollowUps({ businessId })
      setFollowUps(result.data)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [businessId])

  useEffect(() => {
    loadFollowUps()
  }, [loadFollowUps])

  return (
    <PanelShell
      icon={FiClock}
      title="Follow-ups"
      description="Reminders and next actions for this business."
      action={<AddFollowUpLink businessId={businessId} />}
    >
      {loading ? (
        <LoadingState label="Loading follow-ups..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadFollowUps} />
      ) : followUps.length === 0 ? (
        <EmptyPanel message="No follow-ups for this business yet." />
      ) : (
        <div className="space-y-2">
          {followUps.map((followUp) => (
            <Link
              key={followUp._id}
              to={`/follow-ups/${followUp._id}`}
              className="flex flex-col gap-3 rounded-2xl bg-[#f7f7f7] p-4 transition hover:bg-[#f2f2f2] sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-medium text-[#222]">{followUp.reason}</h3>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-[#777]">
                  <FiCalendar aria-hidden="true" /> {formatDate(followUp.followUpDate)}
                </p>
              </div>
              <FollowUpStatusBadge status={followUp.status} isOverdue={followUp.isOverdue} />
            </Link>
          ))}
        </div>
      )}
    </PanelShell>
  )
}
