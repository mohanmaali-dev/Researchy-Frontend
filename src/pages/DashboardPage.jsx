import { useCallback, useEffect, useState } from 'react'
import {
  FiAlertCircle,
  FiAlertTriangle,
  FiArrowRight,
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiChevronDown,
  FiClock,
  FiMessageSquare,
  FiRepeat,
  FiStar,
  FiTag,
} from 'react-icons/fi'
import { Link } from 'react-router-dom'

import { ErrorState, LoadingState } from '../components/businesses/PageState.jsx'
import FollowUpStatusBadge from '../components/follow-ups/FollowUpStatusBadge.jsx'
import { ScoreBadge, ValidationBadge } from '../components/opportunities/OpportunityBadges.jsx'
import { formatTag } from '../components/problems/tag.utils.js'
import * as dashboardService from '../services/dashboard.service.js'

const formatDate = (date, options = {}) =>
  new Date(date).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
    ...options,
  })

const activityIcons = {
  business: FiBriefcase,
  conversation: FiMessageSquare,
  problem: FiAlertCircle,
  opportunity: FiStar,
}

function EmptyState({ icon: Icon, title, message }) {
  return (
    <div className="grid min-h-36 place-items-center rounded-2xl bg-[#f7f7f7] p-5 text-center">
      <div>
        <span className="mx-auto grid size-10 place-items-center rounded-full bg-white text-slate-500"><Icon aria-hidden="true" /></span>
        <p className="mt-3 text-sm font-bold text-slate-900">{title}</p>
        <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">{message}</p>
      </div>
    </div>
  )
}

function CardHeader({ title, description, to, action = 'View all' }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-lg font-extrabold tracking-tight text-[#151515]">{title}</h2>
        {description && <p className="mt-1 text-xs text-[#777]">{description}</p>}
      </div>
      {to && (
        <Link to={to} className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#dedede] px-3.5 py-2 text-xs font-semibold text-[#333] hover:bg-[#f7f7f7]">
          {action} <FiArrowRight aria-hidden="true" />
        </Link>
      )}
    </div>
  )
}

function FollowUpCard({ title, description, items, overdue = false }) {
  return (
    <section className="dashboard-panel rounded-2xl bg-white p-5 sm:p-6">
      <CardHeader title={title} description={description} to="/follow-ups" />
      <div className="mt-5">
        {items.length === 0 ? (
          <EmptyState
            icon={overdue ? FiCheckCircle : FiClock}
            title={overdue ? 'No overdue follow-ups' : 'No upcoming follow-ups'}
            message={overdue ? 'Everything is currently on schedule.' : 'Pending reminders will appear here.'}
          />
        ) : (
          <div className="divide-y divide-[#ededed]">
            {items.map((followUp) => (
              <div key={followUp._id} className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0">
                <span className={`grid size-10 shrink-0 place-items-center rounded-full ${overdue ? 'bg-red-50 text-red-600' : 'bg-[#f5f5f5] text-[#222]'}`}>
                  {overdue ? <FiAlertTriangle aria-hidden="true" /> : <FiClock aria-hidden="true" />}
                </span>
                <div className="min-w-0 flex-1">
                  <Link to={`/follow-ups/${followUp._id}`} className="block truncate text-sm font-bold text-[#1b1b1b] hover:text-primary">{followUp.reason}</Link>
                  <p className="mt-1 truncate text-xs text-[#777]">
                    <Link to={`/businesses/${followUp.business._id}`} className="hover:text-primary">{followUp.business.companyName}</Link>
                    <span className="mx-2">•</span>{formatDate(followUp.followUpDate)}
                  </p>
                </div>
                <FollowUpStatusBadge status={followUp.status} isOverdue={overdue || followUp.isOverdue} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function DashboardPage() {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const result = await dashboardService.getDashboard()
      setDashboard(result.data)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  if (loading) {
    return <main className="p-5"><LoadingState label="Preparing your dashboard..." /></main>
  }

  if (!dashboard) {
    return <main className="p-5"><ErrorState message={error} onRetry={loadDashboard} /></main>
  }

  const summaryCards = [
    { label: 'Total Businesses', value: dashboard.summary.totalBusinesses, week: `${dashboard.researchProgress.businessesThisWeek} researched this week`, icon: FiBriefcase, to: '/businesses' },
    { label: 'Conversations', value: dashboard.summary.totalConversations, week: `${dashboard.researchProgress.conversationsThisWeek} recorded this week`, icon: FiMessageSquare, to: '/businesses' },
    { label: 'Problems', value: dashboard.summary.totalProblems, week: `${dashboard.researchProgress.problemsThisWeek} discovered this week`, icon: FiAlertCircle, to: '/problem-patterns' },
    { label: 'Opportunities', value: dashboard.summary.totalOpportunities, week: `${dashboard.researchProgress.opportunitiesThisWeek} created this week`, icon: FiStar, to: '/opportunities' },
    { label: 'Pending Follow-ups', value: dashboard.summary.pendingFollowUps, week: 'Open reminders', icon: FiClock, to: '/follow-ups' },
    { label: 'Overdue Follow-ups', value: dashboard.summary.overdueFollowUps, week: 'Needs your attention', icon: FiAlertTriangle, to: '/follow-ups', danger: true },
  ]

  return (
    <main className="w-full px-1 pb-2 pt-1 sm:px-2 sm:pb-3">
      <div className="flex flex-col gap-4 px-1 py-2 sm:flex-row sm:items-center sm:justify-between sm:px-2">
        <div>
          <h1 className="text-3xl font-extrabold tracking-[-0.035em] text-[#0a0a0a]">Research Overview</h1>
          <p className="mt-1 text-sm text-[#737373]">Your business research performance and priorities.</p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#dedede] bg-white px-4 py-2.5 text-xs font-semibold text-[#292929]">
          <FiCalendar className="text-base" aria-hidden="true" /> {formatDate(new Date(), { timeZone: undefined })} <FiChevronDown className="text-[#777]" aria-hidden="true" />
        </span>
      </div>

      {error && <p role="alert" className="mx-2 mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <section className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 min-[1750px]:grid-cols-6" aria-label="Research totals">
        {summaryCards.map(({ label, value, week, icon: Icon, to, danger }) => (
          <Link key={label} to={to} className="dashboard-stat group rounded-2xl bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-[#666]">{label}</p>
              <span className={`grid size-10 place-items-center rounded-full ${danger ? 'bg-red-50 text-red-600' : 'bg-[#f6f6f6] text-[#222]'}`}><Icon aria-hidden="true" /></span>
            </div>
            <p className="mt-4 text-4xl font-medium tracking-[-0.04em] text-[#0b0b0b]">{value}</p>
            <p className={`mt-5 text-xs ${danger && value > 0 ? 'font-semibold text-red-600' : 'text-[#686868]'}`}>{week}</p>
          </Link>
        ))}
      </section>

      <div className="mt-3 grid gap-3 min-[1200px]:grid-cols-[minmax(0,1.45fr)_minmax(19rem,0.75fr)]">
        <section className="dashboard-panel rounded-2xl bg-white p-5 sm:p-6">
          <CardHeader title="Strong Opportunities" description="Top opportunities ranked by current score" to="/opportunities" action="Top 5" />
          <div className="mt-6">
            {dashboard.strongOpportunities.length === 0 ? (
              <EmptyState icon={FiStar} title="No opportunities yet" message="Mark a promising Problem as an Opportunity to see it here." />
            ) : (
              <div className="divide-y divide-[#ededed]">
                {dashboard.strongOpportunities.map((opportunity, index) => (
                  <div key={opportunity._id} className="flex flex-wrap items-center gap-3 py-3.5 first:pt-0 last:pb-0">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#f5f5f5] text-xs font-bold text-[#555]">{index + 1}</span>
                    <div className="min-w-44 flex-1">
                      <Link to={`/opportunities/${opportunity._id}`} className="block truncate text-sm font-bold text-[#181818] hover:text-primary">{opportunity.problem?.title || 'Opportunity'}</Link>
                      <p className="mt-1 truncate text-xs text-[#777]">{opportunity.business?.companyName || 'Business unavailable'} · {opportunity.difficulty} difficulty</p>
                    </div>
                    <ValidationBadge status={opportunity.validationStatus} />
                    <ScoreBadge score={opportunity.opportunityScore} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="dashboard-panel rounded-2xl bg-white p-5 sm:p-6">
          <CardHeader title="Repeated Problems" description="Common signals across businesses" to="/problem-patterns" />
          <div className="mt-5">
            {dashboard.repeatedProblems.length === 0 ? (
              <EmptyState icon={FiRepeat} title="No repeated patterns" message="Patterns appear after similar Problems are reported by multiple businesses." />
            ) : (
              <div className="space-y-2.5">
                {dashboard.repeatedProblems.map((pattern) => (
                  <Link key={`${pattern.type}:${pattern.key}`} to={`/problem-patterns/details/${pattern.type}?key=${encodeURIComponent(pattern.key)}`} className="flex items-center gap-3 rounded-2xl bg-[#f7f7f7] px-4 py-3 hover:bg-[#f1f1f1]">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-primary"><FiTag aria-hidden="true" /></span>
                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-[#202020]">{formatTag(pattern.name)}</p><p className="mt-0.5 text-[11px] text-[#777]">{pattern.problemCount} problems</p></div>
                    <div className="text-right"><p className="text-lg font-bold text-[#111]">{pattern.uniqueBusinessCount}</p><p className="text-[10px] text-[#777]">businesses</p></div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <FollowUpCard title="Upcoming Follow-ups" description="Nearest pending actions first" items={dashboard.followUps.upcoming} />
        <FollowUpCard title="Overdue Follow-ups" description="Pending actions that need attention" items={dashboard.followUps.overdue} overdue />
      </div>

      <section className="dashboard-panel mt-3 overflow-hidden rounded-2xl bg-white p-5 sm:p-6">
        <CardHeader title="Recent Activity" description="Latest records across your research workspace" />
        <div className="mt-5">
          {dashboard.recentActivity.length === 0 ? (
            <EmptyState icon={FiClock} title="No recent activity" message="Add a Business to begin your research timeline." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] border-separate border-spacing-0 text-left">
                <thead>
                  <tr className="bg-[#f7f7f7] text-xs font-medium text-[#777]"><th className="rounded-l-xl px-4 py-3">Activity</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Context</th><th className="px-4 py-3">Date</th><th className="rounded-r-xl px-4 py-3 text-right">Open</th></tr>
                </thead>
                <tbody className="divide-y divide-[#eeeeee]">
                  {dashboard.recentActivity.map((activity) => {
                    const Icon = activityIcons[activity.type] || FiClock
                    return (
                      <tr key={`${activity.type}:${activity.id}`} className="text-sm text-[#262626]">
                        <td className="border-b border-[#eeeeee] px-4 py-3.5"><div className="flex items-center gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#f5f5f5]"><Icon aria-hidden="true" /></span><span className="max-w-xs truncate font-semibold">{activity.title}</span></div></td>
                        <td className="border-b border-[#eeeeee] px-4 py-3.5 capitalize text-[#666]">{activity.type}</td>
                        <td className="border-b border-[#eeeeee] px-4 py-3.5 text-[#666]">{activity.subtitle}</td>
                        <td className="border-b border-[#eeeeee] px-4 py-3.5 text-[#666]">{formatDate(activity.createdAt)}</td>
                        <td className="border-b border-[#eeeeee] px-4 py-3.5 text-right"><Link to={activity.path} className="inline-flex size-8 items-center justify-center rounded-full border border-[#ddd] hover:bg-[#f5f5f5]" aria-label={`Open ${activity.title}`}><FiArrowRight aria-hidden="true" /></Link></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export default DashboardPage
