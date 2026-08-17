import { useCallback, useEffect, useState } from 'react'
import { FiEdit2, FiExternalLink, FiTrash2 } from 'react-icons/fi'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'

import { ErrorState, LoadingState } from '../../components/businesses/PageState.jsx'
import { LearningStatusBadge } from '../../components/learning/LearningBadges.jsx'
import { formatTag, PRACTICE_STATUSES, QUESTION_STATUSES, RESOURCE_STATUSES } from '../../components/learning/learning.constants.js'
import PinButton from '../../components/learning/PinButton.jsx'
import QuickStatusSelect from '../../components/learning/QuickStatusSelect.jsx'
import BackButton from '../../components/ui/BackButton.jsx'
import ConfirmModal from '../../components/ui/ConfirmModal.jsx'
import * as service from '../../services/learning.service.js'

const configs = {
  entry: { title: 'Learning Entry', plural: 'entries', tab: 'entries', get: service.getEntry, update: service.updateEntry, remove: service.deleteEntry, pinnable: true },
  resource: { title: 'Resource', plural: 'resources', tab: 'resources', get: service.getResource, update: service.updateResource, remove: service.deleteResource, pinnable: true, statuses: RESOURCE_STATUSES },
  practice: { title: 'Practice', plural: 'practice', tab: 'practice', get: service.getPractice, update: service.updatePractice, remove: service.deletePractice, statuses: PRACTICE_STATUSES },
  question: { title: 'Question', plural: 'questions', tab: 'questions', get: service.getQuestion, update: service.updateQuestion, remove: service.deleteQuestion, statuses: QUESTION_STATUSES },
}

const formatDate = (value) => value ? new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }) : 'Not added'

function TextBlock({ title, children, tone = 'normal' }) {
  return <section className={`rounded-lg p-4 sm:p-6 ${tone === 'key' ? 'bg-[#edf3f9]' : 'bg-white'}`}><h2 className={`text-sm font-semibold ${tone === 'key' ? 'text-[#315f91]' : 'text-[#292929]'}`}>{title}</h2><div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#5f5f5f]">{children || 'Not added'}</div></section>
}

function renderContent(type, record) {
  if (type === 'entry') return <><TextBlock title="Key takeaway" tone="key">{record.keyTakeaway}</TextBlock><TextBlock title="Learning notes">{record.notes}</TextBlock>{record.tags?.length > 0 && <section className="rounded-lg bg-white p-4 sm:p-6"><h2 className="text-sm font-semibold">Tags</h2><div className="mt-3 flex flex-wrap gap-2">{record.tags.map((tag) => <span key={tag} className="rounded-full bg-[#f2f2f1] px-2.5 py-1 text-xs text-[#555]">{formatTag(tag)}</span>)}</div></section>}</>
  if (type === 'resource') return <><TextBlock title="Resource notes">{record.notes}</TextBlock>{record.url && <section className="rounded-lg bg-white p-4 sm:p-6"><a href={record.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-[#315f91] hover:underline">Open resource <FiExternalLink aria-hidden="true" /></a><p className="mt-2 break-all text-xs text-[#777]">{record.url}</p></section>}</>
  if (type === 'practice') return <><TextBlock title="Practice goal" tone="key">{record.practiceGoal}</TextBlock><div className="grid gap-3 sm:grid-cols-2"><TextBlock title="What happened">{record.whatHappened}</TextBlock><TextBlock title="What went well">{record.wentWell}</TextBlock><TextBlock title="What went wrong">{record.wentWrong}</TextBlock><TextBlock title="What should improve next time">{record.improveNext}</TextBlock></div></>
  return <><TextBlock title="Question" tone="key">{record.question}</TextBlock><TextBlock title="Notes / context">{record.context}</TextBlock><TextBlock title="Answer">{record.answer}</TextBlock></>
}

function LearningRecordDetailsPage({ type }) {
  const config = configs[type]
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [savingStatus, setSavingStatus] = useState(false)
  const [savingPin, setSavingPin] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try { const result = await config.get(id); setRecord(result.data) } catch (requestError) { setError(requestError.message) } finally { setLoading(false) }
  }, [config, id])
  useEffect(() => { load() }, [load])

  const title = record ? (type === 'question' ? record.question : record.title) : ''
  const topicPath = record?.topic?._id ? `/learning/topics/${record.topic._id}?tab=${config.tab}` : `/learning/${config.plural}`
  const remove = async () => {
    setDeleting(true)
    try { await config.remove(id); navigate(topicPath, { replace: true }) } catch (requestError) { setError(requestError.message); setConfirmDelete(false); setDeleting(false) }
  }

  const updateStatus = async (status) => {
    setSavingStatus(true)
    setError('')
    try { const result = await config.update(id, { status }); setRecord((current) => ({ ...current, status: result.data.status })) } catch (requestError) { setError(requestError.message) } finally { setSavingStatus(false) }
  }

  const togglePin = async () => {
    setSavingPin(true)
    setError('')
    try { const result = await config.update(id, { isPinned: !record.isPinned }); setRecord((current) => ({ ...current, isPinned: result.data.isPinned })) } catch (requestError) { setError(requestError.message) } finally { setSavingPin(false) }
  }

  if (loading) return <main className="p-2"><LoadingState label={`Loading ${config.title.toLowerCase()}...`} /></main>
  if (!record) return <main className="p-2"><ErrorState message={error} onRetry={load} backTo="/learning" backLabel="Learning home" /></main>

  return (
    <main className="w-full px-1 pb-3 pt-1 sm:px-2">
      <section className="rounded-lg bg-white p-4 sm:p-7">
        <BackButton fallback={topicPath} />
        {location.state?.notice && <p className="mt-4 rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{location.state.notice}</p>}
        {error && <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0"><p className="text-xs font-medium uppercase tracking-wider text-[#315f91]">{config.title}</p><h1 className="mt-2 break-words text-2xl tracking-[-0.025em] text-[#171717] sm:text-4xl">{title}</h1><div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#777]"><Link to={`/learning/topics/${record.topic._id}`} className="font-medium text-[#315f91] hover:underline">{record.topic.title}</Link>{record.status && <LearningStatusBadge status={record.status} />}{record.type && <span className="rounded-full bg-[#f2f2f1] px-2.5 py-1">{record.type}</span>}<span>{formatDate(record.entryDate || record.practiceDate || record.createdAt)}</span></div></div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">{config.statuses && <QuickStatusSelect value={record.status} options={config.statuses} onChange={updateStatus} saving={savingStatus} />}{config.pinnable && <PinButton pinned={record.isPinned} onClick={togglePin} saving={savingPin} />}<Link to={`/learning/${config.plural}/${id}/edit`} className="inline-flex items-center justify-center gap-2 rounded-md bg-[#ebe9e6] px-4 py-2.5 text-sm font-semibold hover:bg-[#dfdcd8]"><FiEdit2 aria-hidden="true" /> Edit</Link><button type="button" onClick={() => setConfirmDelete(true)} className="inline-flex items-center justify-center gap-2 rounded-md bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100"><FiTrash2 aria-hidden="true" /> Delete</button></div>
        </div>
      </section>
      <div className="mt-3 space-y-3">{renderContent(type, record)}</div>
      <ConfirmModal open={confirmDelete} title={`Delete ${config.title}?`} message={`“${title}” will be permanently deleted. This action cannot be undone.`} confirmLabel={`Delete ${config.title.toLowerCase()}`} loading={deleting} onConfirm={remove} onCancel={() => setConfirmDelete(false)} />
    </main>
  )
}

export default LearningRecordDetailsPage
