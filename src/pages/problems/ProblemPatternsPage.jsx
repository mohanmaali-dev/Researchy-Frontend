import { useCallback, useEffect, useState } from 'react'
import { FiChevronRight, FiRepeat, FiTag, FiUsers } from 'react-icons/fi'
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
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-primary-dark">Cross-business insights</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Problem patterns</h1>
        <p className="mt-2 max-w-2xl text-slate-500">
          Tags and matching normalized titles reported by at least two different businesses.
        </p>
      </div>

      <section className="mt-8">
        {loading ? (
          <LoadingState label="Finding repeated problem patterns..." />
        ) : error ? (
          <ErrorState message={error} onRetry={loadPatterns} />
        ) : patterns.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary-light text-2xl text-primary-dark">
              <FiRepeat aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-xl font-bold">No repeated patterns yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Patterns appear when the same tag or normalized problem title is reported by at least two businesses.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="divide-y divide-slate-100">
              {patterns.map((pattern) => (
                <Link
                  key={`${pattern.type}:${pattern.key}`}
                  to={`/problem-patterns/details/${pattern.type}?key=${encodeURIComponent(pattern.key)}`}
                  className="flex flex-col gap-4 p-5 transition hover:bg-slate-50/70 sm:flex-row sm:items-center sm:p-6"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-light text-primary-dark">
                    {pattern.type === 'tag' ? <FiTag aria-hidden="true" /> : <FiRepeat aria-hidden="true" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold">{formatTag(pattern.name)}</h2>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {pattern.type}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                      <span>{pattern.problemCount} {pattern.problemCount === 1 ? 'problem' : 'problems'}</span>
                      <span className="flex items-center gap-1.5">
                        <FiUsers aria-hidden="true" /> {pattern.uniqueBusinessCount} businesses
                      </span>
                    </div>
                  </div>
                  <FiChevronRight className="self-end text-slate-400 sm:self-auto" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  )
}

export default ProblemPatternsPage
