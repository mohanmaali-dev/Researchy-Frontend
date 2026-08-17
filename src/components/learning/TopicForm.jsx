import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { FiSave } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { z } from 'zod'

import DateInput from '../ui/DateInput.jsx'
import DraftStatus from '../ui/DraftStatus.jsx'
import { FieldError as ErrorText, FORM_INPUT_CLASS, ServerError } from '../ui/FormElements.jsx'
import FormSelect from '../ui/FormSelect.jsx'
import { useFormDraft } from '../../hooks/useFormDraft.js'
import { parseTags, todayValue, TOPIC_PRIORITIES, TOPIC_STATUSES } from './learning.constants.js'

const schema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(150, 'Title is too long'),
  category: z.string().trim().min(1, 'Category is required').max(100, 'Category is too long'),
  description: z.string().trim().max(2000, 'Description is too long'),
  learningReason: z.string().trim().max(3000, 'Learning reason is too long'),
  priority: z.enum(TOPIC_PRIORITIES),
  status: z.enum(TOPIC_STATUSES),
  startDate: z.string().min(1, 'Start date is required'),
  targetDate: z.string(),
  tags: z.string(),
})

const emptyTopic = { title: '', category: '', description: '', learningReason: '', priority: 'Medium', status: 'Want to Learn', startDate: todayValue(), targetDate: '', tags: '' }
const inputClass = FORM_INPUT_CLASS

function TopicForm({ initialValues = emptyTopic, categorySuggestions = [], tagSuggestions = [], onSubmit, submitting, serverError, cancelTo = '/learning/topics' }) {
  const { register, control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: initialValues })
  useEffect(() => reset(initialValues), [initialValues, reset])
  const draft = useFormDraft({ watch, reset, initialValues })
  const submit = draft.submitWithDraft((values) => onSubmit({ ...values, targetDate: values.targetDate || null, tags: parseTags(values.tags) }))
  const currentTags = watch('tags') || ''
  const addSuggestedTag = (tag) => {
    const next = [...new Set([...parseTags(currentTags), tag])]
    setValue('tags', next.join(', '), { shouldDirty: true, shouldValidate: true })
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-3">
      <DraftStatus {...draft} />
      <section className="rounded-lg bg-white p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-[#292929]">Topic information</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold text-[#555] sm:col-span-2">Title <span className="text-red-500">*</span><input {...register('title')} className={inputClass} placeholder="Enter topic title" /><ErrorText message={errors.title?.message} /></label>
          <label className="text-sm font-semibold text-[#555]">Category <span className="text-red-500">*</span><input {...register('category')} list="learning-category-suggestions" className={inputClass} placeholder="Select or enter a category" /><datalist id="learning-category-suggestions">{categorySuggestions.map((category) => <option key={category} value={category} />)}</datalist><p className="mt-1 text-[11px] font-normal text-[#999]">Choose an existing category or type a new one.</p><ErrorText message={errors.category?.message} /></label>
          <label className="text-sm font-semibold text-[#555]">Tags<input {...register('tags')} className={inputClass} placeholder="Enter tags separated by commas" /><ErrorText message={errors.tags?.message} /></label>
          {tagSuggestions.length > 0 && <div className="sm:col-span-2"><p className="text-xs font-medium text-[#777]">Suggested tags</p><div className="mt-2 flex flex-wrap gap-2">{tagSuggestions.slice(0, 10).map((tag) => <button key={tag} type="button" onClick={() => addSuggestedTag(tag)} className="rounded-full bg-[#f2f2f1] px-2.5 py-1 text-xs text-[#555] transition hover:bg-[#edf3f9] hover:text-[#315f91]">+ {tag}</button>)}</div></div>}
          <label className="text-sm font-semibold text-[#555] sm:col-span-2">Short description<textarea {...register('description')} rows="3" className={`${inputClass} resize-y`} placeholder="Briefly describe this topic" /><ErrorText message={errors.description?.message} /></label>
          <label className="text-sm font-semibold text-[#555] sm:col-span-2">Why do you want to learn this?<textarea {...register('learningReason')} rows="3" className={`${inputClass} resize-y`} placeholder="Write the reason this topic matters" /><ErrorText message={errors.learningReason?.message} /></label>
        </div>
      </section>
      <section className="rounded-lg bg-white p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-[#292929]">Plan</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm font-semibold text-[#555]">Priority<FormSelect name="priority" control={control} options={TOPIC_PRIORITIES} className="mt-1.5" /></label>
          <label className="text-sm font-semibold text-[#555]">Status<FormSelect name="status" control={control} options={TOPIC_STATUSES} className="mt-1.5" /></label>
          <label className="text-sm font-semibold text-[#555]">Start date <span className="text-red-500">*</span><DateInput {...register('startDate')} className={inputClass} /><ErrorText message={errors.startDate?.message} /></label>
          <label className="text-sm font-semibold text-[#555]">Target date <span className="font-normal text-[#999]">(optional)</span><DateInput {...register('targetDate')} className={inputClass} /></label>
        </div>
      </section>
      <ServerError message={serverError} />
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Link to={cancelTo} className="rounded-md bg-white px-5 py-2.5 text-center text-sm font-semibold text-[#555] hover:bg-[#f5f5f5]">Cancel</Link><button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"><FiSave aria-hidden="true" /> {submitting ? 'Saving...' : 'Save topic'}</button></div>
    </form>
  )
}

export default TopicForm
