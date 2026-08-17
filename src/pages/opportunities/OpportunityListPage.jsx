import { useCallback, useEffect, useState } from 'react'
import { FiArrowRight, FiBriefcase, FiStar, FiTrendingUp } from 'react-icons/fi'
import { Link } from 'react-router-dom'

import { ErrorState, TableLoadingState } from '../../components/businesses/PageState.jsx'
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
    <main className="w-full px-1 pb-3 pt-1 sm:px-2">
      <section className="rounded-lg bg-white p-5 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-[#888]">Business workspace</p>
            <h1 className="mt-1 text-3xl tracking-[-0.035em] text-[#171717] sm:text-4xl">Opportunities</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#707070]">
              Review promising problems and decide what deserves more research.
            </p>
          </div>

          {!loading && !error && opportunities.length > 0 && (
            <div className="flex w-fit items-center gap-3 rounded-md bg-primary-light px-3.5 py-2.5 text-primary-dark">
              <FiTrendingUp aria-hidden="true" />
              <div>
                <p className="text-lg font-semibold leading-none">{opportunities.length}</p>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-wide">Opportunities</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="mt-3 rounded-lg bg-white p-4 sm:p-6">
        {loading ? (
          <TableLoadingState
            label="Loading opportunities..."
            headers={['Opportunity / Problem', 'Business', 'Score', 'Validation', 'Difficulty', 'Created', '']}
            template="1.7fr 1.2fr .65fr 1.05fr .75fr 1fr 2rem"
            minWidth="850px"
            cellVariants={['line', 'line', 'pill', 'pill', 'line', 'line', 'icon']}
          />
        ) : error ? (
          <ErrorState message={error} onRetry={loadOpportunities} />
        ) : opportunities.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <span className="mx-auto grid size-11 place-items-center rounded-md bg-primary-light text-primary-dark">
              <FiStar aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-lg font-semibold text-[#292929]">No opportunities yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#777]">
              Open a promising Problem and select “Mark as Opportunity” to start evaluating it.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-[#2a2a2a]">Priority list</h2>
                <p className="mt-1 text-xs text-[#808080]">Highest opportunity scores appear first.</p>
              </div>
              <span className="hidden text-xs text-[#777] sm:block">Select an opportunity to open it</span>
            </div>

            <div className="hidden overflow-hidden rounded-[18px] bg-[#fafafa] md:block">
              <div className="grid grid-cols-12 items-center gap-4 px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-[#999]">
                <span className="col-span-3">Opportunity / Problem</span>
                <span className="col-span-2">Business</span>
                <span className="col-span-1">Score</span>
                <span className="col-span-2">Validation</span>
                <span className="col-span-1">Difficulty</span>
                <span className="col-span-2">Created</span>
                <span className="col-span-1" />
              </div>
              <div className="space-y-px bg-[#ededeb]">
                {opportunities.map((opportunity) => (
                  <Link
                    key={opportunity._id}
                    to={`/opportunities/${opportunity._id}`}
                    className="group grid grid-cols-12 items-center gap-4 bg-white px-5 py-4 transition hover:bg-[#fffaf8]"
                  >
                    <div className="col-span-3 min-w-0">
                      <p className="truncate text-sm font-medium text-[#222] group-hover:text-primary-dark">{opportunity.problem.title}</p>
                      <p className="mt-1 truncate text-xs text-[#888]">{opportunity.status}</p>
                    </div>
                    <span className="col-span-2 flex min-w-0 items-center gap-1.5 truncate text-sm text-[#666]">
                      <FiBriefcase className="shrink-0 text-[#999]" aria-hidden="true" /> {opportunity.business.companyName}
                    </span>
                    <span className="col-span-1 min-w-0"><ScoreBadge score={opportunity.opportunityScore} /></span>
                    <span className="col-span-2 min-w-0"><ValidationBadge status={opportunity.validationStatus} /></span>
                    <span className="col-span-1 truncate text-sm text-[#666]">{opportunity.difficulty}</span>
                    <span className="col-span-2 truncate text-sm text-[#666]">{formatDate(opportunity.createdAt)}</span>
                    <FiArrowRight className="col-span-1 justify-self-end text-[#aaa] transition group-hover:translate-x-0.5 group-hover:text-primary-dark" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-3 md:hidden">
              {opportunities.map((opportunity) => (
                <Link key={opportunity._id} to={`/opportunities/${opportunity._id}`} className="block rounded-[18px] bg-[#f7f7f7] p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="line-clamp-2 text-base font-medium leading-5 text-[#222]">{opportunity.problem.title}</h2>
                      <p className="mt-1 flex min-w-0 items-center gap-1.5 truncate text-sm text-[#777]">
                        <FiBriefcase className="shrink-0" aria-hidden="true" /> {opportunity.business.companyName}
                      </p>
                    </div>
                    <ScoreBadge score={opportunity.opportunityScore} />
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[#666]">
                    <ValidationBadge status={opportunity.validationStatus} />
                    <span>{opportunity.difficulty} difficulty</span>
                    <span>{formatDate(opportunity.createdAt)}</span>
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
