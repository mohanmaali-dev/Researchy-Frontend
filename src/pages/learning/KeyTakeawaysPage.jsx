import { useCallback, useEffect, useState } from 'react'
import { FiChevronDown, FiChevronLeft, FiChevronRight, FiMessageCircle } from 'react-icons/fi'
import { PiPushPin, PiPushPinFill } from 'react-icons/pi'
import { Link, useSearchParams } from 'react-router-dom'

import { ErrorState, LoadingState } from '../../components/businesses/PageState.jsx'
import * as service from '../../services/learning.service.js'

const formatDate = (value) => new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })

function KeyTakeawaysPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [takeaways, setTakeaways] = useState([])
  const [topics, setTopics] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, hasPreviousPage: false, hasNextPage: false })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingPin, setSavingPin] = useState('')
  const topicId = searchParams.get('topicId') || 'All'
  const page = Math.max(1, Number(searchParams.get('page')) || 1)

  const update = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (!value || value === 'All' || (key === 'page' && Number(value) <= 1)) next.delete(key)
    else next.set(key, value)
    if (key !== 'page') next.delete('page')
    setSearchParams(next, { replace: true })
  }

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await service.getTakeaways({ topicId: topicId === 'All' ? '' : topicId, page, limit: 10 })
      setTakeaways(result.data)
      setPagination(result.pagination)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [page, topicId])

  useEffect(() => { load() }, [load])
  useEffect(() => { service.getTopics({ limit: 50 }).then((result) => setTopics(result.data)).catch(() => {}) }, [])

  const togglePin = async (entry) => {
    setSavingPin(entry._id)
    setError('')
    try {
      const result = await service.updateEntry(entry._id, { isPinned: !entry.isPinned })
      setTakeaways((items) => items.map((item) => item._id === entry._id ? { ...item, isPinned: result.data.isPinned } : item))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSavingPin('')
    }
  }

  return (
    <main className="w-full px-1 pb-3 pt-1 sm:px-2">
      <section className="rounded-lg bg-white p-5 sm:p-7">
        <p className="text-sm text-[#888]">Learning workspace</p>
        <div className="mt-1 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-3xl tracking-[-0.035em] sm:text-4xl">Key Takeaways</h1><p className="mt-2 text-sm text-[#777]">The most important ideas from your Learning Entries.</p></div><label className="relative block w-full sm:w-64"><span className="sr-only">Filter by topic</span><select value={topicId} onChange={(event) => update('topicId', event.target.value)} className="h-10 w-full appearance-none rounded-md border border-[#d9d6d2] bg-white px-3 pr-8 text-sm outline-none focus:border-primary"><option value="All">All topics</option>{topics.map((topic) => <option key={topic._id} value={topic._id}>{topic.title}</option>)}</select><FiChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#777]" aria-hidden="true" /></label></div>
      </section>
      <section className="mt-3 rounded-lg bg-white p-4 sm:p-6">
        {loading ? <LoadingState label="Loading takeaways..." /> : error && !takeaways.length ? <ErrorState message={error} onRetry={load} backTo="/learning" backLabel="Learning home" /> : takeaways.length ? <>{error && <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}<div className="grid gap-3 lg:grid-cols-2">{takeaways.map((entry) => <article key={entry._id} className="relative rounded-md bg-[#edf3f9] transition hover:bg-[#e4edf6]"><Link to={`/learning/entries/${entry._id}`} className="group block p-4 pr-12"><div className="flex gap-3"><FiMessageCircle className="mt-1 shrink-0 text-[#315f91]" aria-hidden="true" /><div className="min-w-0"><blockquote className="text-sm font-medium leading-6 text-[#294e75]">“{entry.keyTakeaway}”</blockquote><p className="mt-3 text-xs font-semibold text-[#315f91]">{entry.title}</p><p className="mt-1 text-[11px] text-[#6f87a1]">{entry.topic?.title} · {formatDate(entry.entryDate)}</p></div></div></Link><button type="button" onClick={() => togglePin(entry)} disabled={savingPin === entry._id} className={`absolute right-3 top-3 grid size-8 place-items-center rounded-md transition disabled:opacity-50 ${entry.isPinned ? 'bg-amber-100 text-amber-700' : 'bg-white/70 text-[#6f87a1] hover:bg-white'}`} aria-label={entry.isPinned ? 'Unpin takeaway' : 'Pin takeaway'}>{entry.isPinned ? <PiPushPinFill aria-hidden="true" /> : <PiPushPin aria-hidden="true" />}</button></article>)}</div>{pagination.totalPages > 1 && <nav className="mt-5 flex items-center justify-between border-t border-[#ece9e5] pt-4"><button disabled={!pagination.hasPreviousPage} onClick={() => update('page', pagination.page - 1)} className="inline-flex items-center gap-1 rounded-md border border-[#dedbd7] px-3 py-2 text-xs disabled:opacity-40"><FiChevronLeft /> Previous</button><span className="text-xs text-[#777]">Page {pagination.page} of {pagination.totalPages}</span><button disabled={!pagination.hasNextPage} onClick={() => update('page', pagination.page + 1)} className="inline-flex items-center gap-1 rounded-md border border-[#dedbd7] px-3 py-2 text-xs disabled:opacity-40">Next <FiChevronRight /></button></nav>}</> : <div className="py-14 text-center"><FiMessageCircle className="mx-auto text-2xl text-[#999]" aria-hidden="true" /><h2 className="mt-3 text-lg">No takeaways yet</h2><p className="mt-1 text-sm text-[#777]">Key Takeaways appear here when you add Learning Entries.</p></div>}
      </section>
    </main>
  )
}

export default KeyTakeawaysPage
