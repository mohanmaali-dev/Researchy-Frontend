import { useCallback, useEffect, useState } from 'react'
import { FiArrowRight, FiBriefcase, FiRepeat, FiTag } from 'react-icons/fi'
import { Link } from 'react-router-dom'

import { ErrorState, LoadingState } from '../../components/businesses/PageState.jsx'
import { formatTag } from '../../components/problems/tag.utils.js'
import * as problemService from '../../services/problem.service.js'

function ProblemPatternsPage() {
  const [patterns, setPatterns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadPatterns = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const result = await problemService.getProblemPatterns()
      setPatterns(result.data)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPatterns()
  }, [loadPatterns])

  return (
    <main className="w-full px-1 pb-3 pt-1 sm:px-2">
      <section className="rounded-lg bg-white p-5 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-[#888]">Business workspace</p>
            <h1 className="mt-1 text-3xl tracking-[-0.035em] text-[#171717] sm:text-4xl">
              Problem patterns
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#707070]">
              See which problems are being reported by more than one business.
            </p>
          </div>

          {!loading && !error && patterns.length > 0 && (
            <div className="flex items-center gap-3 rounded-md bg-primary-light px-3.5 py-2.5 text-primary-dark">
              <FiRepeat aria-hidden="true" />
              <div>
                <p className="text-lg font-semibold leading-none">{patterns.length}</p>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-wide">Repeated patterns</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="mt-3 rounded-lg bg-white p-4 sm:p-6">
        {loading ? (
          <LoadingState label="Finding repeated problem patterns..." />
        ) : error ? (
          <ErrorState message={error} onRetry={loadPatterns} />
        ) : patterns.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <span className="mx-auto grid size-11 place-items-center rounded-md bg-primary-light text-primary-dark">
              <FiRepeat aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-lg font-semibold text-[#292929]">No repeated patterns yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#777]">
              A pattern will appear when at least two businesses report the same tag or a matching problem title.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-[#2a2a2a]">Repeated signals</h2>
                <p className="mt-1 text-xs text-[#808080]">Most reported patterns appear first.</p>
              </div>
              <span className="hidden text-xs text-[#777] sm:block">Select a pattern to view details</span>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3 xl:grid-cols-3">
              {patterns.map((pattern) => {
                const isTag = pattern.type === 'tag'
                const PatternIcon = isTag ? FiTag : FiRepeat

                return (
                  <Link
                    key={`${pattern.type}:${pattern.key}`}
                    to={`/problem-patterns/details/${pattern.type}?key=${encodeURIComponent(pattern.key)}`}
                    className="group flex min-h-[128px] flex-col rounded-lg border border-[#d8d4d0] bg-white p-3.5 shadow-[0_3px_12px_rgba(44,38,34,0.055)] transition hover:-translate-y-0.5 hover:border-[#e0a08f] hover:shadow-[0_8px_20px_rgba(65,48,41,0.09)] focus:outline-none focus:ring-2 focus:ring-primary/25 focus:ring-offset-2 sm:min-h-[164px] sm:p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="grid size-8 place-items-center rounded-md bg-primary-light text-sm text-primary-dark sm:size-9 sm:text-base">
                        <PatternIcon aria-hidden="true" />
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-[#efeeec] px-1.5 py-1 text-[9px] font-medium uppercase tracking-wide text-[#666] sm:px-2 sm:text-[10px]">
                          {isTag ? 'Tag' : 'Similar title'}
                        </span>
                        <FiArrowRight className="text-[#aaa] transition group-hover:translate-x-0.5 group-hover:text-primary-dark" aria-hidden="true" />
                      </div>
                    </div>

                    <h2 className="mt-2.5 line-clamp-2 text-sm font-semibold leading-5 text-[#252525] group-hover:text-primary-dark sm:mt-4 sm:text-base sm:leading-6">
                      {formatTag(pattern.name)}
                    </h2>

                    <div className="mt-auto flex items-end justify-between gap-3 pt-3 sm:gap-4 sm:pt-5">
                      <div className="flex items-center gap-2 text-[#555]">
                        <FiBriefcase className="text-primary-dark" aria-hidden="true" />
                        <span className="text-xs sm:text-sm">
                          <strong className="font-semibold text-[#252525]">{pattern.uniqueBusinessCount}</strong>{' '}
                          {pattern.uniqueBusinessCount === 1 ? 'business' : 'businesses'}
                        </span>
                      </div>
                      <p className="text-xs text-[#777]">
                        {pattern.problemCount} {pattern.problemCount === 1 ? 'problem' : 'problems'}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </section>
    </main>
  )
}

export default ProblemPatternsPage
