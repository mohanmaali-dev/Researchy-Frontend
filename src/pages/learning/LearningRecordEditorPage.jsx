import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { ErrorState, LoadingState } from '../../components/businesses/PageState.jsx'
import { EntryForm, PracticeForm, QuestionForm, ResourceForm } from '../../components/learning/LearningRecordForms.jsx'
import { todayValue } from '../../components/learning/learning.constants.js'
import BackButton from '../../components/ui/BackButton.jsx'
import * as service from '../../services/learning.service.js'

const configs = {
  entry: { title: 'Learning Entry', plural: 'entries', Form: EntryForm, get: service.getEntry, create: service.createEntry, update: service.updateEntry },
  resource: { title: 'Resource', plural: 'resources', Form: ResourceForm, get: service.getResource, create: service.createResource, update: service.updateResource },
  practice: { title: 'Practice', plural: 'practice', Form: PracticeForm, get: service.getPractice, create: service.createPractice, update: service.updatePractice },
  question: { title: 'Question', plural: 'questions', Form: QuestionForm, get: service.getQuestion, create: service.createQuestion, update: service.updateQuestion },
}

const dateValue = (value) => value ? value.slice(0, 10) : ''

function formValues(type, record, selectedTopic) {
  if (!record) {
    if (type === 'entry') return { topic: selectedTopic, title: '', notes: '', keyTakeaway: '', entryDate: todayValue(), tags: '' }
    if (type === 'resource') return { topic: selectedTopic, title: '', type: 'Article', url: '', notes: '', status: 'Saved' }
    if (type === 'practice') return { topic: selectedTopic, title: '', practiceGoal: '', practiceDate: todayValue(), whatHappened: '', wentWell: '', wentWrong: '', improveNext: '', status: 'Planned' }
    return { topic: selectedTopic, question: '', context: '', answer: '', status: 'Unanswered' }
  }
  const topic = record.topic?._id || record.topic
  if (type === 'entry') return { topic, title: record.title, notes: record.notes || '', keyTakeaway: record.keyTakeaway, entryDate: dateValue(record.entryDate), tags: (record.tags || []).join(', ') }
  if (type === 'resource') return { topic, title: record.title, type: record.type, url: record.url || '', notes: record.notes || '', status: record.status }
  if (type === 'practice') return { topic, title: record.title, practiceGoal: record.practiceGoal, practiceDate: dateValue(record.practiceDate), whatHappened: record.whatHappened || '', wentWell: record.wentWell || '', wentWrong: record.wentWrong || '', improveNext: record.improveNext || '', status: record.status }
  return { topic, question: record.question, context: record.context || '', answer: record.answer || '', status: record.status }
}

function LearningRecordEditorPage({ type, mode }) {
  const config = configs[type]
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [topics, setTopics] = useState([])
  const [record, setRecord] = useState(null)
  const [tagSuggestions, setTagSuggestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [topicResult, recordResult, optionResult] = await Promise.all([
        service.getTopics({ limit: 50 }),
        mode === 'edit' ? config.get(id) : Promise.resolve(null),
        service.getTopicOptions(),
      ])
      const loadedRecord = recordResult?.data || null
      const loadedTopics = [...topicResult.data]
      if (loadedRecord?.topic && !loadedTopics.some((topic) => topic._id === loadedRecord.topic._id)) loadedTopics.push(loadedRecord.topic)
      setTopics(loadedTopics)
      setRecord(loadedRecord)
      setTagSuggestions(optionResult.data.tags || [])
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [config, id, mode])

  useEffect(() => { load() }, [load])

  const initialValues = useMemo(() => formValues(type, record, searchParams.get('topicId') || ''), [record, searchParams, type])
  const cancelTo = record?.topic?._id ? `/learning/topics/${record.topic._id}` : searchParams.get('topicId') ? `/learning/topics/${searchParams.get('topicId')}` : '/learning'

  const submit = async (data) => {
    setSubmitting(true)
    setError('')
    try {
      const result = mode === 'edit' ? await config.update(id, data) : await config.create(data)
      navigate(`/learning/${config.plural}/${result.data._id}`)
      return true
    } catch (requestError) {
      setError(requestError.message)
      return false
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <main className="p-2"><LoadingState label={`Loading ${config.title.toLowerCase()}...`} /></main>
  if (mode === 'edit' && !record) return <main className="p-2"><ErrorState message={error} onRetry={load} backTo="/learning" backLabel="Learning home" /></main>

  return (
    <main className="mx-auto w-full max-w-4xl px-1 pb-3 pt-1 sm:px-2">
      <section className="mb-3 rounded-lg bg-white p-5 sm:p-7">
        <BackButton fallback={cancelTo} />
        <p className="mt-5 text-xs font-medium uppercase tracking-wider text-[#315f91]">{mode === 'edit' ? `Edit ${config.title}` : `New ${config.title}`}</p>
        <h1 className="mt-1 text-3xl tracking-[-0.035em]">{mode === 'edit' ? `Update ${config.title}` : `Add ${config.title}`}</h1>
        <p className="mt-2 text-sm text-[#777]">Keep it useful, clear, and easy to review later.</p>
      </section>
      {!topics.length ? <section className="rounded-lg bg-white p-8 text-center"><h2 className="text-lg font-semibold">Create a Learning Topic first</h2><p className="mt-2 text-sm text-[#777]">Every {config.title.toLowerCase()} needs a topic.</p><button type="button" onClick={() => navigate('/learning/topics/new')} className="mt-5 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white">Create topic</button></section> : <config.Form topics={topics} tagSuggestions={tagSuggestions} initialValues={initialValues} onSubmit={submit} submitting={submitting} serverError={error} cancelTo={cancelTo} />}
    </main>
  )
}

export default LearningRecordEditorPage
