import { useCallback, useEffect, useState } from 'react'
import { FiBriefcase, FiChevronRight, FiStar } from 'react-icons/fi'
import { Link } from 'react-router-dom'

import { ErrorState, LoadingState } from '../../components/businesses/PageState.jsx'
import { ScoreBadge, ValidationBadge } from '../../components/opportunities/OpportunityBadges.jsx'
import * as opportunityService from '../../services/opportunity.service.js'

const formatDate = (date) =>
  new Date(date).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

function OpportunityListPage() {
  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadOpportunities = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const result = await opportunityService.getOpportunities()
      setOpportunities(result.data)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOpportunities()
  }, [loadOpportunities])

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-primary-dark">Research priorities</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Opportunities</h1>
        <p className="mt-2 max-w-2xl text-slate-500">Promising Problems sorted by their current prioritization score.</p>
      </div>

      <section className="mt-8">
        {loading ? (
          <LoadingState label="Loading opportunities..." />
        ) : error ? (
          <ErrorState message={error} onRetry={loadOpportunities} />
        ) : opportunities.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary-light text-2xl text-primary-dark"><FiStar aria-hidden="true" /></span>
            <h2 className="mt-4 text-xl font-bold">No opportunities yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Open a promising Problem and select “Mark as Opportunity” to start evaluating it.</p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
              <table className="w-full border-collapse text-left">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3.5">Opportunity / Problem</th>
                    <th className="px-5 py-3.5">Business</th>
                    <th className="px-5 py-3.5">Score</th>
                    <th className="px-5 py-3.5">Validation</th>
                    <th className="px-5 py-3.5">Difficulty</th>
                    <th className="px-5 py-3.5">Created</th>
                    <th className="px-5 py-3.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {opportunities.map((opportunity) => (
                    <tr key={opportunity._id} className="transition hover:bg-slate-50/70">
                      <td className="px-5 py-4">
                        <Link to={`/opportunities/${opportunity._id}`} className="font-bold text-slate-900 hover:text-primary-dark">{opportunity.problem.title}</Link>
                        <p className="mt-1 text-xs text-slate-400">{opportunity.status}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">{opportunity.business.companyName}</td>
                      <td className="px-5 py-4"><ScoreBadge score={opportunity.opportunityScore} /></td>
                      <td className="px-5 py-4"><ValidationBadge status={opportunity.validationStatus} /></td>
                      <td className="px-5 py-4 text-sm text-slate-600">{opportunity.difficulty}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{formatDate(opportunity.createdAt)}</td>
                      <td className="px-5 py-4"><Link to={`/opportunities/${opportunity._id}`} aria-label={`View ${opportunity.problem.title}`} className="text-slate-400 hover:text-primary-dark"><FiChevronRight aria-hidden="true" /></Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-4 md:hidden">
              {opportunities.map((opportunity) => (
                <Link key={opportunity._id} to={`/opportunities/${opportunity._id}`} className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-bold">{opportunity.problem.title}</h2>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500"><FiBriefcase aria-hidden="true" /> {opportunity.business.companyName}</p>
                    </div>
                    <ScoreBadge score={opportunity.opportunityScore} />
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <ValidationBadge status={opportunity.validationStatus} />
                    <span className="text-xs text-slate-500">{opportunity.difficulty} difficulty · {formatDate(opportunity.createdAt)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  )
}

export default OpportunityListPage
