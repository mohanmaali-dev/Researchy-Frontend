import { useCallback, useEffect, useState } from 'react'
import { FiChevronDown, FiChevronLeft, FiChevronRight, FiFileText, FiHelpCircle, FiPlus } from 'react-icons/fi'
import { Link, useSearchParams } from 'react-router-dom'

import { ErrorState, LoadingState } from '../../components/businesses/PageState.jsx'
import { LearningStatusBadge } from '../../components/learning/LearningBadges.jsx'
import { QUESTION_STATUSES, RESOURCE_STATUSES, RESOURCE_TYPES } from '../../components/learning/learning.constants.js'
import * as service from '../../services/learning.service.js'

const configs = {
  resources: {
    title: 'Resources',
    description: 'Useful material saved across your Learning Topics.',
    addLabel: 'Save Resource',
    addPath: '/learning/resources/new',
    empty: 'No resources saved yet.',
    icon: FiFileText,
    load: service.getResources,
    statuses: RESOURCE_STATUSES,
    types: RESOURCE_TYPES,
    itemTitle: (item) => item.title,
    itemMeta: (item) => item.type,
  },
  questions: {
    title: 'Questions',
    description: 'Doubts and questions that still need an answer.',
    addLabel: 'Add Question',
    addPath: '/learning/questions/new',
    empty: 'No questions recorded yet.',
    icon: FiHelpCircle,
    load: service.getQuestions,
    statuses: QUESTION_STATUSES,
    itemTitle: (item) => item.question,
    itemMeta: (item) => item.context,
  },
}

function SelectFilter({ label, value, options, onChange }) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full appearance-none rounded-md border border-[#d9d6d2] bg-white px-3 pr-8 text-sm outline-none focus:border-primary">
        <option value="All">All {label.toLowerCase()}</option>
        {options.map((option) => {
          const value = typeof option === 'string' ? option : option.value
          const optionLabel = typeof option === 'string' ? option : option.label
          return <option key={value} value={value}>{optionLabel}</option>
        })}
      </select>
      <FiChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#777]" aria-hidden="true" />
    </label>
  )
}

function LearningCollectionPage({ type }) {
  const config = configs[type]
  const Icon = config.icon
  const [searchParams, setSearchParams] = useSearchParams()
  const [records, setRecords] = useState([])
  const [topics, setTopics] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, hasPreviousPage: false, hasNextPage: false })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const status = searchParams.get('status') || 'All'
  const resourceType = searchParams.get('type') || 'All'
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
      const result = await config.load({ status, type: resourceType, topicId: topicId === 'All' ? '' : topicId, page, limit: 10 })
      setRecords(result.data)
      setPagination(result.pagination)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [config, page, resourceType, status, topicId])

  useEffect(() => { load() }, [load])
  useEffect(() => { service.getTopics({ limit: 50 }).then((result) => setTopics(result.data)).catch(() => {}) }, [])

  return (
    <main className="w-full px-1 pb-3 pt-1 sm:px-2">
      <section className="rounded-lg bg-white p-5 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-sm text-[#888]">Learning workspace</p><h1 className="mt-1 text-3xl tracking-[-0.035em] sm:text-4xl">{config.title}</h1><p className="mt-2 text-sm text-[#777]">{config.description}</p></div>
          <Link to={config.addPath} className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-dark"><FiPlus aria-hidden="true" /> {config.addLabel}</Link>
        </div>
        <div className={`mt-5 grid gap-2 rounded-md bg-[#f7f7f7] p-3 ${config.types ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
          <SelectFilter label="Topics" value={topicId} options={topics.map((topic) => ({ value: topic._id, label: topic.title }))} onChange={(value) => update('topicId', value)} />
          {config.types && <SelectFilter label="Types" value={resourceType} options={config.types} onChange={(value) => update('type', value)} />}
          <SelectFilter label="Statuses" value={status} options={config.statuses} onChange={(value) => update('status', value)} />
        </div>
      </section>
      <section className="mt-3 rounded-lg bg-white p-4 sm:p-6">
        {loading ? <LoadingState label={`Loading ${config.title.toLowerCase()}...`} /> : error ? <ErrorState message={error} onRetry={load} backTo="/learning" backLabel="Learning home" /> : records.length ? (
          <>
            <div className="divide-y divide-[#ece9e5]">
              {records.map((record) => (
                <Link key={record._id} to={`/learning/${type}/${record._id}`} className="group flex items-start gap-3 py-4 first:pt-1 last:pb-1">
                  <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-md bg-[#f2f2f1] text-[#666]"><Icon aria-hidden="true" /></span>
                  <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-[#292929] group-hover:text-[#315f91]">{config.itemTitle(record)}</span><span className="mt-1 line-clamp-2 block text-xs leading-5 text-[#777]">{config.itemMeta(record) || 'No additional notes'}</span><span className="mt-1.5 block text-[11px] font-medium text-[#999]">{record.topic?.title}</span></span>
                  <LearningStatusBadge status={record.status} />
                </Link>
              ))}
            </div>
            {pagination.totalPages > 1 && <nav className="mt-5 flex items-center justify-between border-t border-[#ece9e5] pt-4"><button type="button" disabled={!pagination.hasPreviousPage} onClick={() => update('page', pagination.page - 1)} className="inline-flex items-center gap-1 rounded-md border border-[#dedbd7] px-3 py-2 text-xs disabled:opacity-40"><FiChevronLeft /> Previous</button><span className="text-xs text-[#777]">Page {pagination.page} of {pagination.totalPages}</span><button type="button" disabled={!pagination.hasNextPage} onClick={() => update('page', pagination.page + 1)} className="inline-flex items-center gap-1 rounded-md border border-[#dedbd7] px-3 py-2 text-xs disabled:opacity-40">Next <FiChevronRight /></button></nav>}
          </>
        ) : <div className="py-14 text-center"><Icon className="mx-auto text-2xl text-[#999]" aria-hidden="true" /><h2 className="mt-3 text-lg">{config.empty}</h2><p className="mt-1 text-sm text-[#777]">Add one when it becomes useful.</p></div>}
      </section>
    </main>
  )
}

export default LearningCollectionPage
