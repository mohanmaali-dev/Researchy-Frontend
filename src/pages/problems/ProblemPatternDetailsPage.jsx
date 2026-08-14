import { useCallback, useEffect, useState } from 'react'
import { FiArrowLeft, FiBriefcase, FiChevronRight, FiRepeat, FiTag } from 'react-icons/fi'
import { Link, useParams, useSearchParams } from 'react-router-dom'

import { ErrorState, LoadingState } from '../../components/businesses/PageState.jsx'
import ProblemStatusBadge from '../../components/problems/ProblemStatusBadge.jsx'
import ProblemTags from '../../components/problems/ProblemTags.jsx'
import { formatTag } from '../../components/problems/tag.utils.js'
import * as problemService from '../../services/problem.service.js'

function ProblemPatternDetailsPage() {
  const { type } = useParams()
  const [searchParams] = useSearchParams()
  const key = searchParams.get('key') || ''
  const [details, setDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDetails = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const result = await problemService.getProblemPatternDetails(type, key)
      setDetails(result.data)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [key, type])

  useEffect(() => {
    loadDetails()
  }, [loadDetails])

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      {loading ? (
        <LoadingState label="Loading pattern details..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadDetails} />
      ) : (
        <>
          <Link to="/problem-patterns" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary-dark">
            <FiArrowLeft aria-hidden="true" /> Back to patterns
          </Link>

          <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary-light text-xl text-primary-dark">
                  {details.pattern.type === 'tag' ? <FiTag aria-hidden="true" /> : <FiRepeat aria-hidden="true" />}
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">{formatTag(details.pattern.name)}</h1>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {details.pattern.type} pattern
                    </span>
                  </div>
                  <p className="mt-2 text-slate-500">Repeated across the businesses you researched.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="rounded-xl bg-slate-50 px-5 py-3">
                  <p className="text-2xl font-bold text-primary-dark">{details.pattern.problemCount}</p>
                  <p className="text-xs font-semibold text-slate-500">Problems</p>
                </div>
                <div className="rounded-xl bg-slate-50 px-5 py-3">
                  <p className="text-2xl font-bold text-primary-dark">{details.pattern.uniqueBusinessCount}</p>
                  <p className="text-xs font-semibold text-slate-500">Businesses</p>
                </div>
              </div>
            </div>
          </section>

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-slate-50/60 p-5 sm:p-6">
                <h2 className="text-xl font-bold">Related problems</h2>
              </div>
              {details.problems.length === 0 ? (
                <p className="p-8 text-center text-sm text-slate-500">No related problems found.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {details.problems.map((problem) => (
                    <Link
                      key={problem._id}
                      to={`/problems/${problem._id}`}
                      className="flex items-center gap-4 p-5 transition hover:bg-slate-50/70"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-slate-900">{problem.title}</h3>
                          <ProblemStatusBadge status={problem.status} />
                        </div>
                        <p className="mt-1 text-sm text-slate-500">{problem.business?.companyName || 'Unknown business'} · Pain {problem.painLevel}/10</p>
                        {problem.tags?.length > 0 && (
                          <div className="mt-3">
                            <ProblemTags tags={problem.tags} compact />
                          </div>
                        )}
                      </div>
                      <FiChevronRight className="shrink-0 text-slate-400" aria-hidden="true" />
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section className="h-fit overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-slate-50/60 p-5">
                <h2 className="text-lg font-bold">Related businesses</h2>
              </div>
              {details.businesses.length === 0 ? (
                <p className="p-6 text-sm text-slate-500">No related businesses found.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {details.businesses.map((business) => (
                    <Link
                      key={business._id}
                      to={`/businesses/${business._id}`}
                      className="flex items-center gap-3 p-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-primary-dark"
                    >
                      <FiBriefcase className="shrink-0 text-primary-dark" aria-hidden="true" />
                      <span className="min-w-0 flex-1 truncate">{business.companyName}</span>
                      <FiChevronRight className="shrink-0 text-slate-400" aria-hidden="true" />
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </main>
  )
}

export default ProblemPatternDetailsPage
