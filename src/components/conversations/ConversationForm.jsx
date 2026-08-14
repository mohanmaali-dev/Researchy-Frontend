import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { FiBriefcase, FiSave } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { z } from 'zod'

import DateInput from '../ui/DateInput.jsx'

const requiredText = (label, maximumLength) =>
  z.string().trim().min(1, `${label} is required`).max(maximumLength, `${label} is too long`)

const conversationSchema = z.object({
  conversationDate: z.string().min(1, 'Conversation/visit date is required'),
  personName: requiredText('Person name', 120),
  personRole: requiredText('Person role/designation', 120),
  rawConversationNotes: requiredText('Raw conversation notes', 15000),
  importantObservations: z
    .string()
    .trim()
    .max(10000, 'Important observations cannot exceed 10000 characters'),
  followUpNotes: z.string().trim().max(10000, 'Follow-up notes cannot exceed 10000 characters'),
})

const EMPTY_CONVERSATION = {
  conversationDate: '',
  personName: '',
  personRole: '',
  rawConversationNotes: '',
  importantObservations: '',
  followUpNotes: '',
}

const inputClassName =
  'mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-3 focus:ring-primary/10'

function FieldError({ message }) {
  return message ? <p className="mt-1.5 text-xs font-normal leading-5 text-red-500">{message}</p> : null
}

function ConversationForm({
  businessName,
  initialValues = EMPTY_CONVERSATION,
  onSubmit,
  submitting,
  serverError,
  cancelTo,
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(conversationSchema),
    defaultValues: initialValues,
  })

  useEffect(() => {
    reset(initialValues)
  }, [initialValues, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-center gap-3 rounded-xl bg-primary-light p-4 text-primary-dark">
          <FiBriefcase className="shrink-0" aria-hidden="true" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide opacity-70">Business</p>
            <p className="mt-0.5 font-bold">{businessName}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700">
            Conversation/visit date <span className="text-red-500">*</span>
            <DateInput {...register('conversationDate')} className={inputClassName} />
            <FieldError message={errors.conversationDate?.message} />
          </label>

          <div className="hidden sm:block" />

          <label className="text-sm font-semibold text-slate-700">
            Person name <span className="text-red-500">*</span>
            <input
              {...register('personName')}
              className={inputClassName}
              placeholder="Full name"
            />
            <FieldError message={errors.personName?.message} />
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Person role/designation <span className="text-red-500">*</span>
            <input
              {...register('personRole')}
              className={inputClassName}
              placeholder="e.g. Operations Manager"
            />
            <FieldError message={errors.personRole?.message} />
          </label>
        </div>
      </section>

      <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <label className="block text-sm font-semibold text-slate-700">
          Raw conversation notes <span className="text-red-500">*</span>
          <textarea
            {...register('rawConversationNotes')}
            rows="9"
            className={`${inputClassName} resize-y`}
            placeholder="Record the conversation as accurately as possible..."
          />
          <FieldError message={errors.rawConversationNotes?.message} />
        </label>

        <label className="block text-sm font-semibold text-slate-700">
          Important observations
          <textarea
            {...register('importantObservations')}
            rows="5"
            className={`${inputClassName} resize-y`}
            placeholder="Note useful context or observations..."
          />
          <FieldError message={errors.importantObservations?.message} />
        </label>

        <label className="block text-sm font-semibold text-slate-700">
          Follow-up notes
          <textarea
            {...register('followUpNotes')}
            rows="5"
            className={`${inputClassName} resize-y`}
            placeholder="Record any manual follow-up notes..."
          />
          <FieldError message={errors.followUpNotes?.message} />
        </label>
      </section>

      {serverError && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverError}
        </p>
      )}

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
          {submitting ? 'Saving...' : 'Save conversation'}
        </button>
      </div>
    </form>
  )
}

export default ConversationForm
