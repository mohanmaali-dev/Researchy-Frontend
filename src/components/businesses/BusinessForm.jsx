import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { FiSave } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { z } from 'zod'

import CreatableSelect from '../ui/CreatableSelect.jsx'
import DateInput from '../ui/DateInput.jsx'
import DraftStatus from '../ui/DraftStatus.jsx'
import { FieldError, FORM_INPUT_CLASS, ServerError } from '../ui/FormElements.jsx'
import FormSelect from '../ui/FormSelect.jsx'
import { useFormDraft } from '../../hooks/useFormDraft.js'

const BUSINESS_STATUSES = ['Prospect', 'Contacted', 'Visited', 'Active', 'Inactive']

const requiredText = (label, maximumLength) =>
  z.string().trim().min(1, `${label} is required`).max(maximumLength, `${label} is too long`)

const businessSchema = z.object({
  companyName: requiredText('Business/company name', 150),
  businessType: requiredText('Business type', 100),
  industry: requiredText('Industry', 100),
  location: requiredText('Location', 200),
  contactPerson: requiredText('Contact person', 120),
  contactNumber: requiredText('Contact number', 50),
  email: z
    .string()
    .trim()
    .max(254, 'Email is too long')
    .refine((value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), {
      message: 'Enter a valid email address',
    }),
  website: z.string().trim().max(300, 'Website is too long'),
  generalNotes: z.string().trim().max(5000, 'General notes cannot exceed 5000 characters'),
  dateVisitedOrResearched: z.string().min(1, 'Date visited/researched is required'),
  status: z.enum(BUSINESS_STATUSES),
})

const EMPTY_BUSINESS = {
  companyName: '',
  businessType: '',
  industry: '',
  location: '',
  contactPerson: '',
  contactNumber: '',
  email: '',
  website: '',
  generalNotes: '',
  dateVisitedOrResearched: '',
  status: 'Prospect',
}

const inputClassName = FORM_INPUT_CLASS

function BusinessForm({
  initialValues = EMPTY_BUSINESS,
  businessOptions = { businessTypes: [], industries: [] },
  onSubmit,
  submitting,
  serverError,
}) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(businessSchema),
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
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold">Business information</h2>
          <p className="mt-1 text-sm text-slate-500">
            Choose saved options or add a new business type or industry.
          </p>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
            Business/company name <span className="text-red-500">*</span>
            <input
              {...register('companyName')}
              className={inputClassName}
              placeholder="e.g. Northstar Traders"
            />
            <FieldError message={errors.companyName?.message} />
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Business type <span className="text-red-500">*</span>
            <CreatableSelect
              name="businessType"
              control={control}
              options={businessOptions.businessTypes}
              placeholder="Choose a business type"
              searchPlaceholder="Search or add a business type"
              className="mt-1.5"
            />
            <FieldError message={errors.businessType?.message} />
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Industry <span className="text-red-500">*</span>
            <CreatableSelect
              name="industry"
              control={control}
              options={businessOptions.industries}
              placeholder="Choose an industry"
              searchPlaceholder="Search or add an industry"
              className="mt-1.5"
            />
            <FieldError message={errors.industry?.message} />
          </label>

          <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
            Location <span className="text-red-500">*</span>
            <input
              {...register('location')}
              className={inputClassName}
              placeholder="City, state, or full address"
            />
            <FieldError message={errors.location?.message} />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold">Contact and visit</h2>
          <p className="mt-1 text-sm text-slate-500">Who you spoke with and when.</p>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 md:grid-cols-3">
          <label className="text-sm font-semibold text-slate-700">
            Contact person <span className="text-red-500">*</span>
            <input
              {...register('contactPerson')}
              className={inputClassName}
              placeholder="Full name"
            />
            <FieldError message={errors.contactPerson?.message} />
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Contact number <span className="text-red-500">*</span>
            <input
              type="tel"
              {...register('contactNumber')}
              className={inputClassName}
              placeholder="e.g. +91 98765 43210"
            />
            <FieldError message={errors.contactNumber?.message} />
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Email
            <input
              type="email"
              {...register('email')}
              className={inputClassName}
              placeholder="name@company.com"
            />
            <FieldError message={errors.email?.message} />
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Website
            <input
              type="text"
              inputMode="url"
              {...register('website')}
              className={inputClassName}
              placeholder="e.g. company.com"
            />
            <FieldError message={errors.website?.message} />
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Date visited/researched <span className="text-red-500">*</span>
            <DateInput
              {...register('dateVisitedOrResearched')}
              className={inputClassName}
            />
            <FieldError message={errors.dateVisitedOrResearched?.message} />
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Status <span className="text-red-500">*</span>
            <FormSelect
              name="status"
              control={control}
              options={BUSINESS_STATUSES}
              className="mt-1.5"
            />
            <FieldError message={errors.status?.message} />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <label className="text-sm font-semibold text-slate-700">
          General notes
          <textarea
            {...register('generalNotes')}
            rows="6"
            className={`${inputClassName} resize-y`}
            placeholder="Add useful context about this business..."
          />
          <FieldError message={errors.generalNotes?.message} />
        </label>
      </section>

      <ServerError message={serverError} />

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          to="/businesses"
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
          {submitting ? 'Saving...' : 'Save business'}
        </button>
      </div>
    </form>
  )
}

export default BusinessForm
