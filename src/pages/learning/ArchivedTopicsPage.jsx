import { useCallback, useEffect, useState } from 'react'
import { FiArchive, FiRefreshCw, FiTrash2 } from 'react-icons/fi'

import { ErrorState, LoadingState } from '../../components/businesses/PageState.jsx'
import ConfirmModal from '../../components/ui/ConfirmModal.jsx'
import * as service from '../../services/learning.service.js'

const formatDate = (value) => new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })

function ArchivedTopicsPage() {
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionTopic, setActionTopic] = useState(null)
  const [permanentTopic, setPermanentTopic] = useState(null)
  const [working, setWorking] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try { const result = await service.getTopics({ archived: true, limit: 50 }); setTopics(result.data) } catch (requestError) { setError(requestError.message) } finally { setLoading(false) }
  }, [])
  useEffect(() => { load() }, [load])

  const restore = async (topic) => {
    setActionTopic(topic)
    setError('')
    try { await service.restoreTopic(topic._id); setTopics((items) => items.filter((item) => item._id !== topic._id)) } catch (requestError) { setError(requestError.message) } finally { setActionTopic(null) }
  }

  const removePermanently = async () => {
    setWorking(true)
    setError('')
    try { await service.permanentlyDeleteTopic(permanentTopic._id); setTopics((items) => items.filter((item) => item._id !== permanentTopic._id)); setPermanentTopic(null) } catch (requestError) { setError(requestError.message); setWorking(false) }
  }

  return (
    <main className="w-full px-1 pb-3 pt-1 sm:px-2">
      <section className="rounded-lg bg-white p-5 sm:p-7"><p className="text-sm text-[#888]">Learning workspace</p><h1 className="mt-1 text-3xl tracking-[-0.035em] sm:text-4xl">Archived Topics</h1><p className="mt-2 text-sm leading-6 text-[#777]">Restore a Topic or permanently delete it and everything saved inside it.</p>{error && <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}</section>
      <section className="mt-3 rounded-lg bg-white p-4 sm:p-6">
        {loading ? <LoadingState label="Loading archived topics..." /> : error && !topics.length ? <ErrorState message={error} onRetry={load} backTo="/learning/topics" backLabel="Go to Topics" /> : topics.length ? <div className="divide-y divide-[#ece9e5]">{topics.map((topic) => <article key={topic._id} className="flex flex-col gap-3 py-4 first:pt-1 last:pb-1 sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><h2 className="text-sm font-semibold text-[#292929]">{topic.title}</h2><p className="mt-1 text-xs text-[#777]">{topic.category} · Archived {formatDate(topic.archivedAt)}</p></div><div className="grid grid-cols-2 gap-2 sm:flex"><button type="button" onClick={() => restore(topic)} disabled={actionTopic?._id === topic._id} className="inline-flex items-center justify-center gap-2 rounded-md bg-[#edf3f9] px-3.5 py-2.5 text-xs font-semibold text-[#315f91] hover:bg-[#e1ebf5] disabled:opacity-50"><FiRefreshCw aria-hidden="true" /> {actionTopic?._id === topic._id ? 'Restoring...' : 'Restore'}</button><button type="button" onClick={() => setPermanentTopic(topic)} className="inline-flex items-center justify-center gap-2 rounded-md bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-100"><FiTrash2 aria-hidden="true" /> Delete permanently</button></div></article>)}</div> : <div className="py-14 text-center"><FiArchive className="mx-auto text-2xl text-[#999]" aria-hidden="true" /><h2 className="mt-3 text-lg">No archived Topics</h2><p className="mt-1 text-sm text-[#777]">Topics you archive will appear here.</p></div>}
      </section>
      <ConfirmModal open={Boolean(permanentTopic)} title="Delete Topic permanently?" message={permanentTopic ? `“${permanentTopic.title}” and all its Entries, Resources, Practice items, and Questions will be permanently deleted. This cannot be undone.` : ''} confirmLabel="Delete permanently" loading={working} onConfirm={removePermanently} onCancel={() => setPermanentTopic(null)} />
    </main>
  )
}

export default ArchivedTopicsPage
