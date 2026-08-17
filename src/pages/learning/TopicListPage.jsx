import { useCallback, useEffect, useState } from 'react'
import { FiBookOpen, FiChevronDown, FiChevronLeft, FiChevronRight, FiPlus, FiSearch } from 'react-icons/fi'
import { PiPushPinFill } from 'react-icons/pi'
import { Link, useSearchParams } from 'react-router-dom'

import { ErrorState, LoadingState } from '../../components/businesses/PageState.jsx'
import { LearningStatusBadge, PriorityBadge } from '../../components/learning/LearningBadges.jsx'
import { TOPIC_PRIORITIES, TOPIC_STATUSES } from '../../components/learning/learning.constants.js'
import * as service from '../../services/learning.service.js'

const SORT_OPTIONS = [
  { value: 'recent', label: 'Recently updated' },
  { value: 'priority', label: 'Priority' },
  { value: 'status', label: 'Status' },
  { value: 'startDate', label: 'Start date' },
  { value: 'targetDate', label: 'Target date' },
  { value: 'title', label: 'Title A–Z' },
]

function targetLabel(topic) {
  if (!topic.targetDate || topic.status === 'Learned') return null
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const days = Math.ceil((new Date(topic.targetDate) - today) / 86400000)
  if (days < 0) return { text: 'Target passed', style: 'text-red-600' }
  if (days <= 7) return { text: days === 0 ? 'Due today' : `Due in ${days}d`, style: 'text-amber-700' }
  return null
}

function Select({ label, value, onChange, options }) { return <label className="relative block"><span className="sr-only">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full appearance-none rounded-md border border-[#d9d6d2] bg-white px-3 pr-8 text-sm outline-none focus:border-primary"><option value="All">All {label.toLowerCase()}</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select><FiChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#777]" /></label> }

function TopicListPage() {
  const [params, setParams] = useSearchParams()
  const [topics, setTopics] = useState([])
  const [categories, setCategories] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0, limit: 10, hasPreviousPage: false, hasNextPage: false })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const search = params.get('search') || ''
  const status = params.get('status') || 'All'
  const category = params.get('category') || 'All'
  const priority = params.get('priority') || 'All'
  const sort = params.get('sort') || 'recent'
  const page = Math.max(1, Number(params.get('page')) || 1)
  const load = useCallback(async () => { setLoading(true); setError(''); try { const result = await service.getTopics({ search, status, category, priority, sort, page, limit: 10 }); setTopics(result.data); setPagination(result.pagination) } catch (requestError) { setError(requestError.message) } finally { setLoading(false) } }, [category, page, priority, search, sort, status])
  useEffect(() => { const timer = window.setTimeout(load, search ? 300 : 0); return () => window.clearTimeout(timer) }, [load, search])
  useEffect(() => { service.getTopicOptions().then((result) => setCategories(result.data.categories)).catch(() => {}) }, [])
  const update = (key, value) => { const next = new URLSearchParams(params); if (!value || value === 'All' || (key === 'page' && Number(value) <= 1)) next.delete(key); else next.set(key, value); if (key !== 'page') next.delete('page'); setParams(next, { replace: true }) }
  const hasFilters = Boolean(search || status !== 'All' || category !== 'All' || priority !== 'All')

  return <main className="w-full px-1 pb-3 pt-1 sm:px-2"><section className="rounded-lg bg-white p-5 sm:p-7"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm text-[#888]">Learning workspace</p><h1 className="mt-1 text-3xl tracking-[-0.035em] sm:text-4xl">Topics</h1><p className="mt-2 text-sm text-[#777]">Manage what you want to learn and what is in progress.</p></div><Link to="/learning/topics/new" className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-white"><FiPlus /> New Topic</Link></div><div className="mt-5 grid grid-cols-2 gap-2 rounded-md bg-[#f7f7f7] p-3 lg:grid-cols-[minmax(13rem,1fr)_repeat(4,minmax(8rem,10rem))]"><label className="col-span-2 flex h-10 items-center gap-2 rounded-md border border-[#d9d6d2] bg-white px-3 lg:col-span-1"><FiSearch className="text-[#888]" /><input value={search} onChange={(event) => update('search', event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Search topics" /></label><Select label="Statuses" value={status} onChange={(value) => update('status', value)} options={TOPIC_STATUSES} /><Select label="Categories" value={category} onChange={(value) => update('category', value)} options={categories} /><Select label="Priorities" value={priority} onChange={(value) => update('priority', value)} options={TOPIC_PRIORITIES} /><label className="relative block"><span className="sr-only">Sort topics</span><select value={sort} onChange={(event) => update('sort', event.target.value)} className="h-10 w-full appearance-none rounded-md border border-[#d9d6d2] bg-white px-3 pr-8 text-sm outline-none focus:border-primary">{SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><FiChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#777]" /></label></div></section><section className="mt-3 rounded-lg bg-white p-4 sm:p-6">{loading ? <LoadingState label="Loading topics..." /> : error ? <ErrorState message={error} onRetry={load} backTo="/learning" backLabel="Learning home" /> : !topics.length ? <div className="py-14 text-center"><FiBookOpen className="mx-auto text-2xl text-[#999]" /><h2 className="mt-3 text-lg">{hasFilters ? 'No matching topics' : 'No topics yet'}</h2><p className="mt-1 text-sm text-[#777]">{hasFilters ? 'Try another search or filter.' : 'Create a topic to start learning.'}</p></div> : <><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{topics.map((topic) => { const attention = targetLabel(topic); return <Link key={topic._id} to={`/learning/topics/${topic._id}`} className="group rounded-md bg-[#f7f7f7] p-4 transition hover:bg-[#f0f4f8]"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex items-center gap-2"><h2 className="truncate text-base font-semibold group-hover:text-[#315f91]">{topic.title}</h2>{topic.isPinned && <PiPushPinFill className="shrink-0 text-amber-600" aria-label="Pinned" />}</div><p className="mt-1 text-xs text-[#777]">{topic.category}</p></div><PriorityBadge priority={topic.priority} /></div><p className="mt-3 line-clamp-2 text-sm leading-6 text-[#666]">{topic.description || 'No description added.'}</p><div className="mt-4 flex items-center justify-between gap-2"><LearningStatusBadge status={topic.status} />{attention && <span className={`text-xs font-medium ${attention.style}`}>{attention.text}</span>}</div></Link>})}</div>{pagination.totalPages > 1 && <nav className="mt-5 flex items-center justify-between border-t border-[#e5e2de] pt-4"><button disabled={!pagination.hasPreviousPage} onClick={() => update('page', pagination.page - 1)} className="inline-flex items-center gap-1 rounded-md border px-3 py-2 text-xs disabled:opacity-40"><FiChevronLeft /> Previous</button><span className="text-xs text-[#777]">Page {pagination.page} of {pagination.totalPages}</span><button disabled={!pagination.hasNextPage} onClick={() => update('page', pagination.page + 1)} className="inline-flex items-center gap-1 rounded-md border px-3 py-2 text-xs disabled:opacity-40">Next <FiChevronRight /></button></nav>}</>}</section></main>
}

export default TopicListPage
