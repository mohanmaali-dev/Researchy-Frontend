import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { FiBriefcase, FiMessageSquare, FiSave } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { z } from 'zod'

import FormSelect from '../ui/FormSelect.jsx'
import DraftStatus from '../ui/DraftStatus.jsx'
import { FieldError, FORM_INPUT_CLASS, ServerError } from '../ui/FormElements.jsx'
import { useFormDraft } from '../../hooks/useFormDraft.js'
import TagInput from './TagInput.jsx'

const WILLINGNESS_OPTIONS = ['Yes', 'No', 'Unknown']
const PROBLEM_STATUSES = ['Open', 'In Review', 'Validated', 'Resolved', 'Dismissed']

const requiredText = (label, maximumLength) =>
  z.string().trim().min(1, `${label} is required`).max(maximumLength, `${label} is too long`)

const problemSchema = z.object({
  title: requiredText('Problem title', 200),
  description: requiredText('Description', 10000),
  currentProcess: requiredText('Current process/current solution', 5000),
  frequency: requiredText('Frequency', 200),
  painLevel: z.coerce.number().int().min(1).max(10),
  timeImpact: requiredText('Time impact', 500),
  financialImpact: z.string().trim().max(500, 'Financial impact is too long'),
  existingSoftware: z.string().trim().max(300, 'Existing software or tool is too long'),
  willingnessToPay: z.enum(WILLINGNESS_OPTIONS),
  notes: z.string().trim().max(5000, 'Notes cannot exceed 5000 characters'),
  status: z.enum(PROBLEM_STATUSES),
  tags: z.array(z.string().max(50)).max(20),
})

const EMPTY_PROBLEM = {
  title: '',
  description: '',
  currentProcess: '',
  frequency: '',
  painLevel: 5,
  timeImpact: '',
  financialImpact: '',
  existingSoftware: '',
  willingnessToPay: 'Unknown',
  notes: '',
  status: 'Open',
  tags: [],
}

const inputClassName = FORM_INPUT_CLASS

function ProblemForm({
  businessName,
  conversationLabel,
  initialValues = EMPTY_PROBLEM,
  onSubmit,
  submitting,
  serverError,
  cancelTo,
}) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: initialValues,
  })

  useEffect(() => {
    reset(initialValues)
  }, [initialValues, reset])
  const draft = useFormDraft({ watch, reset, initialValues })

  return (
    <form onSubmit={handleSubmit(draft.submitWithDraft(onSubmit))} noValidate className="space-y-8">
      <DraftStatus {...draft} />
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl bg-primary-light p-4 text-primary-dark">
            <FiBriefcase className="shrink-0" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide opacity-70">Business</p>
              <p className="mt-0.5 truncate font-bold">{businessName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-slate-100 p-4 text-slate-700">
            <FiMessageSquare className="shrink-0" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Conversation</p>
              <p className="mt-0.5 truncate font-bold">{conversationLabel}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          <label className="block text-sm font-semibold text-slate-700">
            Problem title <span className="text-red-500">*</span>
            <input
              {...register('title')}
              className={inputClassName}
              placeholder="Short, specific problem summary"
              autoFocus
            />
            <FieldError message={errors.title?.message} />
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Description <span className="text-red-500">*</span>
            <textarea
              {...register('description')}
              rows="5"
              className={`${inputClassName} resize-y`}
              placeholder="What is the problem and who does it affect?"
            />
            <FieldError message={errors.description?.message} />
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Current process / current solution <span className="text-red-500">*</span>
            <textarea
              {...register('currentProcess')}
              rows="4"
              className={`${inputClassName} resize-y`}
              placeholder="How is this handled today?"
            />
            <FieldError message={errors.currentProcess?.message} />
          </label>

          <div>
            <label className="block text-sm font-semibold text-slate-700">Tags</label>
            <Controller
              name="tags"
              control={control}
              render={({ field }) => <TagInput value={field.value} onChange={field.onChange} />}
            />
            <FieldError message={errors.tags?.message} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold">Impact</h2>
          <p className="mt-1 text-sm text-slate-500">Capture the size and regularity of this problem.</p>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700">
            Frequency <span className="text-red-500">*</span>
            <input
              {...register('frequency')}
              className={inputClassName}
              placeholder="e.g. Daily, 20 times per week"
            />
            <FieldError message={errors.frequency?.message} />
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Pain level <span className="text-red-500">*</span>
            <FormSelect
              name="painLevel"
              control={control}
              options={Array.from({ length: 10 }, (_, index) => ({
                value: index + 1,
                label: `${index + 1} / 10`,
              }))}
              className="mt-1.5"
            />
            <FieldError message={errors.painLevel?.message} />
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Time impact <span className="text-red-500">*</span>
            <input
              {...register('timeImpact')}
              className={inputClassName}
              placeholder="e.g. 8 staff-hours per week"
            />
            <FieldError message={errors.timeImpact?.message} />
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Financial impact, if known
            <input
              {...register('financialImpact')}
              className={inputClassName}
              placeholder="e.g. ₹25,000 per month"
            />
            <FieldError message={errors.financialImpact?.message} />
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Existing software or tool
            <input
              {...register('existingSoftware')}
              className={inputClassName}
              placeholder="e.g. Spreadsheets, legacy ERP"
            />
            <FieldError message={errors.existingSoftware?.message} />
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Willingness to pay <span className="text-red-500">*</span>
            <FormSelect name="willingnessToPay" control={control} options={WILLINGNESS_OPTIONS} className="mt-1.5" />
            <FieldError message={errors.willingnessToPay?.message} />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700">
            Status <span className="text-red-500">*</span>
            <FormSelect name="status" control={control} options={PROBLEM_STATUSES} className="mt-1.5" />
            <FieldError message={errors.status?.message} />
          </label>
          <div className="hidden sm:block" />
          <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
            Notes
            <textarea
              {...register('notes')}
              rows="5"
              className={`${inputClassName} resize-y`}
              placeholder="Add any other useful context..."
            />
            <FieldError message={errors.notes?.message} />
          </label>
        </div>
      </section>

      <ServerError message={serverError} />

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          to={cancelTo}
          className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FiSave aria-hidden="true" />
          {submitting ? 'Saving...' : 'Save problem'}
        </button>
      </div>
    </form>
  )
}

export default ProblemForm
