import { useCallback, useEffect, useState } from 'react'
import { FiArrowRight, FiBookOpen, FiClock, FiFileText, FiHelpCircle, FiMessageSquare, FiPlus } from 'react-icons/fi'
import { PiPushPinFill } from 'react-icons/pi'
import { Link } from 'react-router-dom'

import { ErrorState, LoadingState } from '../../components/businesses/PageState.jsx'
import { LearningStatusBadge, PriorityBadge } from '../../components/learning/LearningBadges.jsx'
import * as service from '../../services/learning.service.js'

const quickActions = [
  { label: 'New Topic', to: '/learning/topics/new', icon: FiPlus },
  { label: 'Add Learning Entry', to: '/learning/entries/new', icon: FiMessageSquare },
  { label: 'Save Resource', to: '/learning/resources/new', icon: FiFileText },
  { label: 'Add Question', to: '/learning/questions/new', icon: FiHelpCircle },
]

function TopicCard({ topic }) {
  return <Link to={`/learning/topics/${topic._id}`} className="group block rounded-md bg-[#f7f7f7] p-4 transition hover:bg-[#f0f4f8]"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate text-base font-semibold text-[#252525] group-hover:text-[#315f91]">{topic.title}</h3><p className="mt-1 truncate text-xs text-[#777]">{topic.category}</p></div><FiArrowRight className="mt-1 shrink-0 text-[#aaa]" aria-hidden="true" /></div><div className="mt-4 flex flex-wrap gap-2"><LearningStatusBadge status={topic.status} /><PriorityBadge priority={topic.priority} /></div></Link>
}

const relativeDate = (value) => {
  const days = Math.floor((Date.now() - new Date(value).getTime()) / 86400000)
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

function LearningDashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const load = useCallback(async () => { setLoading(true); setError(''); try { const result = await service.getDashboard(); setData(result.data) } catch (requestError) { setError(requestError.message) } finally { setLoading(false) } }, [])
  useEffect(() => { load() }, [load])

  if (loading) return <main className="p-2"><LoadingState label="Loading Learning workspace..." /></main>
  if (!data) return <main className="p-2"><ErrorState message={error} onRetry={load} backTo="/home" backLabel="Go to Home" /></main>

  const pinnedItems = [
    ...(data.pinnedTopics || []).map((item) => ({ ...item, kind: 'Topic', path: `/learning/topics/${item._id}`, text: item.category })),
    ...(data.pinnedTakeaways || []).map((item) => ({ ...item, kind: 'Takeaway', path: `/learning/entries/${item._id}`, text: item.keyTakeaway })),
    ...(data.pinnedResources || []).map((item) => ({ ...item, kind: 'Resource', path: `/learning/resources/${item._id}`, text: `${item.type} · ${item.topic?.title}` })),
  ].slice(0, 8)

  return <main className="w-full px-1 pb-3 pt-1 sm:px-2"><section className="rounded-lg bg-white p-5 sm:p-7"><p className="text-sm text-[#888]">Personal learning workspace</p><h1 className="mt-1 text-3xl tracking-[-0.035em] text-[#171717] sm:text-4xl">Learning</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#707070]">Choose what to learn, record what you understood, and apply it through practice.</p><div className="mt-5 grid grid-cols-2 gap-2 lg:grid-cols-4">{quickActions.map(({ label, to, icon: Icon }) => <Link key={to} to={to} className="flex items-center gap-2 rounded-md bg-[#edf3f9] px-3.5 py-3 text-sm font-medium text-[#315f91] transition hover:bg-[#e1ebf5]"><Icon aria-hidden="true" /> {label}</Link>)}</div></section><section className="mt-3 rounded-lg bg-white p-4 sm:p-6"><div className="flex items-center justify-between gap-4"><div><h2 className="text-lg font-semibold">Continue Learning</h2><p className="mt-1 text-xs text-[#777]">Topics currently in progress.</p></div><Link to="/learning/topics?status=Learning" className="text-xs font-medium text-[#315f91]">View all</Link></div>{data.continueLearning.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{data.continueLearning.map((topic) => <TopicCard key={topic._id} topic={topic} />)}</div> : <div className="mt-4 rounded-md bg-[#f7f7f7] p-8 text-center"><FiBookOpen className="mx-auto text-xl text-[#999]" /><p className="mt-3 text-sm font-medium">Nothing in progress yet</p><p className="mt-1 text-xs text-[#777]">Change a Topic status to Learning when you begin.</p></div>}</section><div className="mt-3 grid gap-3 xl:grid-cols-2"><section className="rounded-lg bg-white p-4 sm:p-6"><div className="flex items-center gap-2"><PiPushPinFill className="text-amber-600" aria-hidden="true" /><h2 className="text-lg font-semibold">Pinned</h2></div>{pinnedItems.length ? <div className="mt-4 divide-y divide-[#ece9e5]">{pinnedItems.map((item) => <Link key={`${item.kind}-${item._id}`} to={item.path} className="group block py-3 first:pt-0 last:pb-0"><div className="flex items-center justify-between gap-3"><p className="truncate text-sm font-semibold group-hover:text-[#315f91]">{item.title}</p><span className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-[#999]">{item.kind}</span></div><p className="mt-1 line-clamp-1 text-xs text-[#777]">{item.text}</p></Link>)}</div> : <p className="mt-4 rounded-md bg-[#f7f7f7] p-6 text-center text-sm text-[#777]">Pin an important Topic, Resource, or Takeaway for quick access.</p>}</section><section className="rounded-lg bg-white p-4 sm:p-6"><div className="flex items-center gap-2"><FiClock className="text-[#315f91]" aria-hidden="true" /><h2 className="text-lg font-semibold">Recent Learning</h2></div>{data.recentActivity?.length ? <div className="mt-4 divide-y divide-[#ece9e5]">{data.recentActivity.slice(0, 6).map((item) => <Link key={`${item.type}-${item.path}`} to={item.path} className="group flex items-center gap-3 py-3 first:pt-0 last:pb-0"><span className="grid size-8 shrink-0 place-items-center rounded-md bg-[#f2f2f1] text-[10px] font-semibold text-[#666]">{item.type.charAt(0)}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium group-hover:text-[#315f91]">{item.title}</span><span className="mt-0.5 block truncate text-[11px] text-[#999]">{item.topicTitle || item.type}</span></span><span className="shrink-0 text-[10px] text-[#999]">{relativeDate(item.updatedAt)}</span></Link>)}</div> : <p className="mt-4 rounded-md bg-[#f7f7f7] p-6 text-center text-sm text-[#777]">Your recent Learning activity will appear here.</p>}</section></div><section className="mt-3 rounded-lg bg-white p-4 sm:p-6"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold">My Topics</h2><Link to="/learning/topics" className="text-xs font-medium text-[#315f91]">All topics</Link></div>{data.topics.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{data.topics.map((topic) => <TopicCard key={topic._id} topic={topic} />)}</div> : <p className="mt-4 rounded-md bg-[#f7f7f7] p-8 text-center text-sm text-[#777]">Create your first Learning Topic to begin.</p>}</section></main>
}

export default LearningDashboardPage
