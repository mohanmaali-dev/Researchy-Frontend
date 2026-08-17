import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  FiArchive,
  FiBookOpen,
  FiChevronLeft,
  FiChevronRight,
  FiEdit2,
  FiExternalLink,
  FiFileText,
  FiHelpCircle,
  FiPlus,
  FiTarget,
} from 'react-icons/fi'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { ErrorState, LoadingState } from '../../components/businesses/PageState.jsx'
import { LearningStatusBadge, PriorityBadge } from '../../components/learning/LearningBadges.jsx'
import { formatTag, TOPIC_STATUSES } from '../../components/learning/learning.constants.js'
import PinButton from '../../components/learning/PinButton.jsx'
import QuickStatusSelect from '../../components/learning/QuickStatusSelect.jsx'
import BackButton from '../../components/ui/BackButton.jsx'
import ConfirmModal from '../../components/ui/ConfirmModal.jsx'
import * as service from '../../services/learning.service.js'

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'entries', label: 'Learning Entries' },
  { key: 'resources', label: 'Resources' },
  { key: 'practice', label: 'Practice' },
  { key: 'questions', label: 'Questions' },
]

const tabConfig = {
  entries: {
    title: 'Learning entries',
    empty: 'No learning entries yet.',
    addLabel: 'Add entry',
    addPath: '/learning/entries/new',
    detailPath: '/learning/entries',
    icon: FiBookOpen,
    load: (params) => service.getEntries(params),
    sorts: [['recent', 'Newest first'], ['oldest', 'Oldest first'], ['updated', 'Recently updated'], ['title', 'Title']],
    primary: (item) => item.title,
    secondary: (item) => item.keyTakeaway,
    meta: (item) => formatDate(item.entryDate),
  },
  resources: {
    title: 'Resources',
    empty: 'No resources saved for this topic.',
    addLabel: 'Save resource',
    addPath: '/learning/resources/new',
    detailPath: '/learning/resources',
    icon: FiFileText,
    load: (params) => service.getResources(params),
    primary: (item) => item.title,
    secondary: (item) => item.notes,
    meta: (item) => `${item.type} · ${item.status}`,
  },
  practice: {
    title: 'Practice',
    empty: 'No practice items yet.',
    addLabel: 'Add practice',
    addPath: '/learning/practice/new',
    detailPath: '/learning/practice',
    icon: FiTarget,
    load: (params) => service.getPracticeItems(params),
    sorts: [['recent', 'Newest first'], ['upcoming', 'Upcoming first'], ['updated', 'Recently updated'], ['title', 'Title']],
    primary: (item) => item.title,
    secondary: (item) => item.practiceGoal,
    meta: (item) => `${formatDate(item.practiceDate)} · ${item.status}`,
  },
  questions: {
    title: 'Questions',
    empty: 'No questions recorded for this topic.',
    addLabel: 'Add question',
    addPath: '/learning/questions/new',
    detailPath: '/learning/questions',
    icon: FiHelpCircle,
    load: (params) => service.getQuestions(params),
    primary: (item) => item.question,
    secondary: (item) => item.context,
    meta: (item) => item.status,
  },
}

function formatDate(value) {
  if (!value) return 'Not set'
  return new Date(value).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

function Detail({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-[#999]">{label}</dt>
      <dd className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-[#4f4f4f]">{value || 'Not added'}</dd>
    </div>
  )
}

function TopicOverview({ topic }) {
  return (
    <div className="grid gap-3 lg:grid-cols-[1.35fr_0.65fr]">
      <section className="rounded-lg bg-white p-4 sm:p-6">
        <h2 className="text-lg font-semibold">About this topic</h2>
        <dl className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2"><Detail label="Description" value={topic.description} /></div>
          <div className="sm:col-span-2"><Detail label="Why I want to learn this" value={topic.learningReason} /></div>
          <Detail label="Category" value={topic.category} />
          <Detail label="Status" value={topic.status} />
        </dl>
      </section>
      <section className="rounded-lg bg-white p-4 sm:p-6">
        <h2 className="text-lg font-semibold">Learning plan</h2>
        <dl className="mt-5 grid grid-cols-2 gap-5 lg:grid-cols-1">
          <Detail label="Priority" value={topic.priority} />
          <Detail label="Start date" value={formatDate(topic.startDate)} />
          <Detail label="Target date" value={formatDate(topic.targetDate)} />
        </dl>
        <div className="mt-5 border-t border-[#ece9e5] pt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[#999]">Tags</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {topic.tags?.length ? topic.tags.map((tag) => <span key={tag} className="rounded-full bg-[#edf3f9] px-2.5 py-1 text-xs font-medium text-[#315f91]">{formatTag(tag)}</span>) : <span className="text-sm text-[#777]">No tags added</span>}
          </div>
        </div>
      </section>
    </div>
  )
}

function targetAttention(topic) {
  if (!topic.targetDate || topic.status === 'Learned') return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(topic.targetDate)
  const days = Math.ceil((target - today) / 86400000)
  if (days < 0) return { label: `Target date passed ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} ago`, className: 'bg-red-50 text-red-600' }
  if (days <= 7) return { label: days === 0 ? 'Target date is today' : `Target date in ${days} day${days === 1 ? '' : 's'}`, className: 'bg-amber-50 text-amber-700' }
  return null
}

function TopicRecords({ topicId, type }) {
  const config = tabConfig[type]
  const Icon = config.icon
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState('recent')
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, hasPreviousPage: false, hasNextPage: false })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await config.load({ topicId, page, limit: 8, sort })
      setRecords(result.data)
      setPagination(result.pagination || { page: 1, totalPages: 1, hasPreviousPage: false, hasNextPage: false })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [config, page, sort, topicId])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1); setSort('recent') }, [type])

  return (
    <section className="rounded-lg bg-white p-4 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{config.title}</h2>
          <p className="mt-1 text-xs text-[#777]">Everything saved under this Learning Topic.</p>
        </div>
        <Link to={`${config.addPath}?topicId=${topicId}`} className="inline-flex shrink-0 items-center gap-2 rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark"><FiPlus aria-hidden="true" /> <span className="hidden sm:inline">{config.addLabel}</span><span className="sm:hidden">Add</span></Link>
      </div>
      {config.sorts && <div className="mt-3 flex justify-end"><label className="text-xs text-[#777]"><span className="mr-2">Sort</span><select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1) }} className="h-9 rounded-md border border-[#d9d6d2] bg-white px-3 text-xs font-medium outline-none focus:border-primary">{config.sorts.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div>}
      {loading ? <LoadingState label={`Loading ${config.title.toLowerCase()}...`} /> : error ? <ErrorState message={error} onRetry={load} /> : records.length ? (
        <><div className="mt-4 divide-y divide-[#ece9e5]">
          {records.map((item) => (
            <Link key={item._id} to={`${config.detailPath}/${item._id}`} className="group flex items-start gap-3 py-4 first:pt-1 last:pb-1">
              <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-md bg-[#f2f2f1] text-[#666]"><Icon aria-hidden="true" /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-[#292929] group-hover:text-[#315f91]">{config.primary(item)}</span>
                {config.secondary(item) && <span className="mt-1 line-clamp-2 block text-xs leading-5 text-[#777]">{config.secondary(item)}</span>}
                <span className="mt-1.5 block text-[11px] font-medium text-[#999]">{config.meta(item)}</span>
              </span>
              <FiExternalLink className="mt-2 shrink-0 text-[#aaa] group-hover:text-[#315f91]" aria-hidden="true" />
            </Link>
          ))}
        </div>{pagination.totalPages > 1 && <nav className="mt-5 flex items-center justify-between border-t border-[#ece9e5] pt-4"><button type="button" disabled={!pagination.hasPreviousPage} onClick={() => setPage((value) => value - 1)} className="inline-flex items-center gap-1 rounded-md border border-[#dedbd7] px-3 py-2 text-xs disabled:opacity-40"><FiChevronLeft aria-hidden="true" /> Previous</button><span className="text-xs text-[#777]">Page {pagination.page} of {pagination.totalPages}</span><button type="button" disabled={!pagination.hasNextPage} onClick={() => setPage((value) => value + 1)} className="inline-flex items-center gap-1 rounded-md border border-[#dedbd7] px-3 py-2 text-xs disabled:opacity-40">Next <FiChevronRight aria-hidden="true" /></button></nav>}</>
      ) : (
        <div className="mt-5 rounded-md bg-[#f7f7f7] px-4 py-10 text-center"><Icon className="mx-auto text-xl text-[#999]" aria-hidden="true" /><p className="mt-3 text-sm font-medium">{config.empty}</p><p className="mt-1 text-xs text-[#777]">Use the Add button when you are ready.</p></div>
      )}
    </section>
  )
}

function TopicDetailsPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [topic, setTopic] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [savingStatus, setSavingStatus] = useState(false)
  const [savingPin, setSavingPin] = useState(false)
  const requestedTab = searchParams.get('tab') || 'overview'
  const activeTab = useMemo(() => tabs.some((tab) => tab.key === requestedTab) ? requestedTab : 'overview', [requestedTab])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await service.getTopic(id)
      setTopic(result.data)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  const archive = async () => {
    setDeleting(true)
    try {
      await service.deleteTopic(id)
      navigate('/learning/topics', { replace: true })
    } catch (requestError) {
      setError(requestError.message)
      setConfirmDelete(false)
      setDeleting(false)
    }
  }

  const updateStatus = async (status) => {
    setSavingStatus(true)
    setError('')
    try { const result = await service.updateTopic(id, { status }); setTopic((current) => ({ ...current, status: result.data.status })) } catch (requestError) { setError(requestError.message) } finally { setSavingStatus(false) }
  }

  const togglePin = async () => {
    setSavingPin(true)
    setError('')
    try { const result = await service.updateTopic(id, { isPinned: !topic.isPinned }); setTopic((current) => ({ ...current, isPinned: result.data.isPinned })) } catch (requestError) { setError(requestError.message) } finally { setSavingPin(false) }
  }

  if (loading) return <main className="p-2"><LoadingState label="Loading topic..." /></main>
  if (!topic) return <main className="p-2"><ErrorState message={error} onRetry={load} backTo="/learning/topics" backLabel="Go to Topics" /></main>

  return (
    <main className="w-full px-1 pb-3 pt-1 sm:px-2">
      <section className="rounded-lg bg-white p-4 sm:p-7">
        <BackButton fallback="/learning/topics" />
        {location.state?.notice && <p className="mt-4 rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{location.state.notice}</p>}
        {error && <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2"><LearningStatusBadge status={topic.status} /><PriorityBadge priority={topic.priority} /></div>
            <h1 className="mt-3 break-words text-3xl tracking-[-0.035em] text-[#171717] sm:text-4xl">{topic.title}</h1>
            <p className="mt-2 text-sm text-[#777]">{topic.category}</p>
            {targetAttention(topic) && <p className={`mt-3 inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${targetAttention(topic).className}`}>{targetAttention(topic).label}</p>}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
            <QuickStatusSelect value={topic.status} options={TOPIC_STATUSES} onChange={updateStatus} saving={savingStatus} />
            <PinButton pinned={topic.isPinned} onClick={togglePin} saving={savingPin} />
            <Link to={`/learning/topics/${id}/edit`} className="inline-flex items-center justify-center gap-2 rounded-md bg-[#ebe9e6] px-4 py-2.5 text-sm font-semibold text-[#333] hover:bg-[#dfdcd8]"><FiEdit2 aria-hidden="true" /> Edit</Link>
            <button type="button" onClick={() => setConfirmDelete(true)} className="inline-flex items-center justify-center gap-2 rounded-md bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-100"><FiArchive aria-hidden="true" /> Archive</button>
          </div>
        </div>
        <nav className="-mx-4 mt-6 flex gap-1 overflow-x-auto border-t border-[#ece9e5] px-4 pt-3 sm:-mx-7 sm:px-7" aria-label="Topic sections">
          {tabs.map((tab) => <button key={tab.key} type="button" onClick={() => setSearchParams(tab.key === 'overview' ? {} : { tab: tab.key }, { replace: true })} className={`shrink-0 rounded-md px-3 py-2 text-sm font-medium transition ${activeTab === tab.key ? 'bg-[#edf3f9] text-[#315f91]' : 'text-[#666] hover:bg-[#f5f5f5]'}`}>{tab.label}{tab.key !== 'overview' && <span className="ml-1.5 text-[10px] opacity-70">{topic.contentCounts?.[tab.key] || 0}</span>}</button>)}
        </nav>
      </section>
      <div className="mt-3">{activeTab === 'overview' ? <TopicOverview topic={topic} /> : <TopicRecords topicId={id} type={activeTab} />}</div>
      <Link to={`${(activeTab === 'overview' ? tabConfig.entries : tabConfig[activeTab]).addPath}?topicId=${id}`} className="mobile-floating-action fixed right-4 z-20 inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 sm:hidden"><FiPlus aria-hidden="true" /> {activeTab === 'overview' ? 'Add entry' : tabConfig[activeTab].addLabel}</Link>
      <ConfirmModal open={confirmDelete} tone="warning" title="Archive Learning Topic?" message={`“${topic.title}” will move to Archived Topics. You can restore it or permanently delete it later.`} confirmLabel="Archive topic" loading={deleting} onConfirm={archive} onCancel={() => setConfirmDelete(false)} />
    </main>
  )
}

export default TopicDetailsPage
