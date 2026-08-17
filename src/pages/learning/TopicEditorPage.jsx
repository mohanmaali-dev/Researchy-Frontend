import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { ErrorState, LoadingState } from '../../components/businesses/PageState.jsx'
import TopicForm from '../../components/learning/TopicForm.jsx'
import BackButton from '../../components/ui/BackButton.jsx'
import * as service from '../../services/learning.service.js'

function TopicEditorPage({ mode }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [topic, setTopic] = useState(null)
  const [options, setOptions] = useState({ categories: [], tags: [] })
  const [loading, setLoading] = useState(mode === 'edit')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const load = useCallback(async () => { if (mode !== 'edit') return; setLoading(true); try { const result = await service.getTopic(id); setTopic(result.data) } catch (requestError) { setError(requestError.message) } finally { setLoading(false) } }, [id, mode])
  useEffect(() => { load() }, [load])
  useEffect(() => { service.getTopicOptions().then((result) => setOptions(result.data)).catch(() => {}) }, [])
  const initialValues = useMemo(() => topic ? { ...topic, startDate: topic.startDate.slice(0, 10), targetDate: topic.targetDate?.slice(0, 10) || '', tags: (topic.tags || []).join(', ') } : undefined, [topic])
  const submit = async (data) => { setSubmitting(true); setError(''); try { const result = mode === 'edit' ? await service.updateTopic(id, data) : await service.createTopic(data); navigate(`/learning/topics/${result.data._id}`, { state: { notice: `Topic ${mode === 'edit' ? 'updated' : 'created'} successfully.` } }) } catch (requestError) { setError(requestError.message) } finally { setSubmitting(false) } }
  if (loading) return <main className="p-2"><LoadingState label="Loading topic..." /></main>
  if (mode === 'edit' && !topic) return <main className="p-2"><ErrorState message={error} onRetry={load} backTo="/learning/topics" backLabel="Go to Topics" /></main>
  return <main className="mx-auto w-full max-w-4xl px-1 pb-3 pt-1 sm:px-2"><section className="mb-3 rounded-lg bg-white p-5 sm:p-7"><BackButton fallback={mode === 'edit' ? `/learning/topics/${id}` : '/learning/topics'} /><p className="mt-5 text-xs font-medium uppercase tracking-wider text-[#315f91]">{mode === 'edit' ? 'Update topic' : 'New topic'}</p><h1 className="mt-1 text-3xl tracking-[-0.035em]">{mode === 'edit' ? `Edit ${topic.title}` : 'Create Learning Topic'}</h1><p className="mt-2 text-sm text-[#777]">Keep the plan clear and easy to review.</p></section><TopicForm initialValues={initialValues} categorySuggestions={options.categories} tagSuggestions={options.tags} onSubmit={submit} submitting={submitting} serverError={error} cancelTo={mode === 'edit' ? `/learning/topics/${id}` : '/learning/topics'} /></main>
}

export default TopicEditorPage
