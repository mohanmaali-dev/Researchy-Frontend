import { useCallback, useEffect, useState } from 'react'
import {
  FiBriefcase,
  FiChevronRight,
  FiRepeat,
  FiTag,
} from 'react-icons/fi'
import { Link, useParams, useSearchParams } from 'react-router-dom'

import { ErrorState, LoadingState } from '../../components/businesses/PageState.jsx'
import ProblemStatusBadge from '../../components/problems/ProblemStatusBadge.jsx'
import ProblemTags from '../../components/problems/ProblemTags.jsx'
import BackButton from '../../components/ui/BackButton.jsx'
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

  if (loading) {
    return <main className="w-full p-3"><LoadingState label="Loading pattern details..." /></main>
  }

  if (error || !details) {
    return <main className="w-full p-3"><ErrorState message={error} onRetry={loadDetails} /></main>
  }

  const isTag = details.pattern.type === 'tag'
  const PatternIcon = isTag ? FiTag : FiRepeat

  return (
    <main className="w-full px-1 pb-3 pt-1 sm:px-2">
      <BackButton fallback="/problem-patterns" className="mb-3 min-h-10 px-1" />

      <section className="rounded-lg bg-white p-4 shadow-[0_2px_10px_rgba(44,38,34,0.045)] sm:p-5">
        <div className="sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div className="flex min-w-0 items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-md bg-primary-light text-primary-dark">
              <PatternIcon aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <span className="rounded bg-[#efeeec] px-2 py-1 text-[9px] font-medium uppercase tracking-wide text-[#666]">
                {isTag ? 'Tag pattern' : 'Similar title'}
              </span>
              <h1 className="mt-2 break-words text-xl font-semibold tracking-[-0.025em] text-[#202020] sm:text-2xl">
                {formatTag(details.pattern.name)}
              </h1>
              <p className="mt-1 text-xs leading-5 text-[#777] sm:text-sm">
                Appears across multiple businesses.
              </p>
            </div>
          </div>

          <div className="mt-3 grid shrink-0 grid-cols-2 gap-2 sm:mt-0 sm:w-[17rem]">
            <div className="flex items-baseline gap-2 rounded-md bg-[#f6f5f3] px-3 py-2.5">
              <p className="text-xl font-semibold leading-none text-[#252525]">{details.pattern.problemCount}</p>
              <p className="text-xs text-[#777]">Problems</p>
            </div>
            <div className="flex items-baseline gap-2 rounded-md bg-primary-light px-3 py-2.5">
              <p className="text-xl font-semibold leading-none text-primary-dark">{details.pattern.uniqueBusinessCount}</p>
              <p className="text-xs text-[#805447]">Businesses</p>
            </div>
          </div>
        </div>
      </section>

      <div className="pattern-details-columns mt-3">
        <section className="rounded-lg bg-white p-4 shadow-[0_2px_10px_rgba(44,38,34,0.045)] sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-[#292929] sm:text-lg">Related problems</h2>
              <p className="mt-0.5 text-xs text-[#808080]">Open a problem to see the full conversation context.</p>
            </div>
            <span className="shrink-0 text-sm font-medium text-[#777]">{details.problems.length}</span>
          </div>

          {details.problems.length === 0 ? (
            <p className="mt-4 rounded-md bg-[#f7f6f4] px-4 py-10 text-center text-sm text-[#777]">
              No related problems found.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {details.problems.map((problem) => (
                <Link
                  key={problem._id}
                  to={`/problems/${problem._id}`}
                  className="group block rounded-md bg-[#f7f6f4] p-3.5 transition hover:bg-[#f2efec] hover:shadow-[0_4px_12px_rgba(44,38,34,0.055)] focus:outline-none focus:ring-2 focus:ring-primary/20 sm:p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-[#292929] group-hover:text-primary-dark sm:text-base">
                          {problem.title}
                        </h3>
                        <FiChevronRight className="mt-0.5 shrink-0 text-[#aaa] transition group-hover:translate-x-0.5 group-hover:text-primary-dark" aria-hidden="true" />
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#707070]">
                        <span className="inline-flex min-w-0 items-center gap-1.5">
                          <FiBriefcase className="shrink-0 text-[#999]" aria-hidden="true" />
                          <span className="max-w-48 truncate">{problem.business?.companyName || 'Unknown business'}</span>
                        </span>
                        <span className="font-medium text-[#555]">Pain {problem.painLevel}/10</span>
                      </div>

                      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                        <ProblemStatusBadge status={problem.status} />
                        <div className="hidden sm:block">
                          <ProblemTags tags={problem.tags} compact />
                        </div>
                        <div className="flex flex-wrap gap-1.5 sm:hidden">
                          {problem.tags?.slice(0, 2).map((tag) => (
                            <span key={tag} className="rounded-full bg-primary-light px-2 py-0.5 text-xs font-medium text-primary-dark">
                              {formatTag(tag)}
                            </span>
                          ))}
                          {problem.tags?.length > 2 && (
                            <span className="px-1 py-0.5 text-[10px] font-medium text-[#777]">+{problem.tags.length - 2}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="h-fit rounded-lg bg-white p-4 shadow-[0_2px_10px_rgba(44,38,34,0.045)] md:sticky md:top-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-[#292929]">Related businesses</h2>
              <p className="mt-0.5 text-xs text-[#808080]">Businesses reporting this pattern.</p>
            </div>
            <span className="text-sm font-medium text-[#777]">{details.businesses.length}</span>
          </div>

          {details.businesses.length === 0 ? (
            <p className="mt-4 rounded-md bg-[#f7f6f4] px-4 py-8 text-center text-sm text-[#777]">
              No related businesses found.
            </p>
          ) : (
            <div className="mt-4 space-y-2">
              {details.businesses.map((business) => (
                <Link
                  key={business._id}
                  to={`/businesses/${business._id}`}
                  className="group flex min-h-12 items-center gap-3 rounded-md bg-[#f7f6f4] px-3 py-2.5 text-sm font-medium text-[#555] transition hover:bg-[#f2efec] hover:text-primary-dark"
                >
                  <FiBriefcase className="shrink-0 text-primary-dark" aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate">{business.companyName}</span>
                  <FiChevronRight className="shrink-0 text-[#aaa] transition group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default ProblemPatternDetailsPage
