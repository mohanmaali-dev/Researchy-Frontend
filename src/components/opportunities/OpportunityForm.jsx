import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { FiBriefcase, FiInfo, FiMessageSquare, FiSave } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { z } from 'zod'

import ProblemTags from '../problems/ProblemTags.jsx'
import FormSelect from '../ui/FormSelect.jsx'
import DraftStatus from '../ui/DraftStatus.jsx'
import { FieldError, FORM_INPUT_CLASS, ServerError } from '../ui/FormElements.jsx'
import { useFormDraft } from '../../hooks/useFormDraft.js'

const VALIDATION_STATUSES = ['Not Validated', 'Researching', 'Validated', 'Rejected']
const OPPORTUNITY_STATUSES = ['Active', 'On Hold', 'Closed']
const DIFFICULTIES = ['Low', 'Medium', 'High']

const requiredText = (label, maximumLength) =>
  z.string().trim().min(1, `${label} is required`).max(maximumLength, `${label} is too long`)

const opportunitySchema = z.object({
  whyValuable: requiredText('Why this opportunity looks valuable', 5000),
  marketPotential: requiredText('Market potential', 3000),
  difficulty: z.enum(DIFFICULTIES),
  validationStatus: z.enum(VALIDATION_STATUSES),
  notes: z.string().trim().max(5000, 'Notes cannot exceed 5000 characters'),
  status: z.enum(OPPORTUNITY_STATUSES),
})

const EMPTY_OPPORTUNITY = {
  whyValuable: '',
  marketPotential: '',
  difficulty: 'Medium',
  validationStatus: 'Not Validated',
  notes: '',
  status: 'Active',
}

const inputClassName = FORM_INPUT_CLASS

function OpportunityForm({
  problem,
  initialValues = EMPTY_OPPORTUNITY,
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
    resolver: zodResolver(opportunitySchema),
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
        <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">Linked Problem</p>
        <h2 className="mt-1 text-xl font-bold">{problem.title}</h2>
        <div className="mt-3"><ProblemTags tags={problem.tags || []} compact /></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl bg-primary-light p-4 text-primary-dark">
            <FiBriefcase aria-hidden="true" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide opacity-70">Business</p>
              <p className="mt-0.5 font-bold">{problem.business.companyName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-slate-100 p-4 text-slate-700">
            <FiMessageSquare aria-hidden="true" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Conversation</p>
              <p className="mt-0.5 font-bold">{problem.conversation.personName}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <label className="block text-sm font-semibold text-slate-700">
          Why this opportunity looks valuable <span className="text-red-500">*</span>
          <textarea
            {...register('whyValuable')}
            rows="6"
            className={`${inputClassName} resize-y`}
            placeholder="Explain why this problem may be worth researching further..."
          />
          <FieldError message={errors.whyValuable?.message} />
        </label>

        <label className="block text-sm font-semibold text-slate-700">
          Market potential <span className="text-red-500">*</span>
          <textarea
            {...register('marketPotential')}
            rows="4"
            className={`${inputClassName} resize-y`}
            placeholder="Describe the possible market, customer group, or reach..."
          />
          <FieldError message={errors.marketPotential?.message} />
        </label>

        <div className="grid gap-5 sm:grid-cols-3">
          <label className="text-sm font-semibold text-slate-700">
            Difficulty to solve <span className="text-red-500">*</span>
            <FormSelect name="difficulty" control={control} options={DIFFICULTIES} className="mt-1.5" />
            <FieldError message={errors.difficulty?.message} />
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Validation status <span className="text-red-500">*</span>
            <FormSelect name="validationStatus" control={control} options={VALIDATION_STATUSES} className="mt-1.5" />
            <FieldError message={errors.validationStatus?.message} />
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Status <span className="text-red-500">*</span>
            <FormSelect name="status" control={control} options={OPPORTUNITY_STATUSES} className="mt-1.5" />
            <FieldError message={errors.status?.message} />
          </label>
        </div>

        <label className="block text-sm font-semibold text-slate-700">
          Notes
          <textarea
            {...register('notes')}
            rows="5"
            className={`${inputClassName} resize-y`}
            placeholder="Add research notes or next questions..."
          />
          <FieldError message={errors.notes?.message} />
        </label>
      </section>

      <div className="flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-800">
        <FiInfo className="mt-1 shrink-0" aria-hidden="true" />
        <p>The 0–100 score is calculated automatically from the linked Problem, repeated demand, and selected difficulty. It is a prioritization aid only.</p>
      </div>

      <ServerError message={serverError} />

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link to={cancelTo} className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50">
          Cancel
        </Link>
        <button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60">
          <FiSave aria-hidden="true" /> {submitting ? 'Saving...' : 'Save opportunity'}
        </button>
      </div>
    </form>
  )
}

export default OpportunityForm
