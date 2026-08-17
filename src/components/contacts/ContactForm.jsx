import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { FiSave } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { z } from 'zod'

import DateInput from '../ui/DateInput.jsx'
import FormSelect from '../ui/FormSelect.jsx'
import { CONTACT_TYPES } from './contact.constants.js'

const CONTACT_STATUSES = ['Active', 'Inactive']

const optionalText = (maximumLength, message) =>
  z.string().trim().max(maximumLength, message)

const contactSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required').max(120, 'Full name is too long'),
  phoneNumber: optionalText(50, 'Phone number is too long').refine(
    (value) => !value || /^\d+$/.test(value),
    'Phone number can contain digits only',
  ),
  email: z
    .string()
    .trim()
    .max(254, 'Email is too long')
    .refine((value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), {
      message: 'Enter a valid email address',
    }),
  business: z.string(),
  companyName: optionalText(150, 'Company name is too long'),
  role: optionalText(120, 'Role is too long'),
  contactType: z.enum(CONTACT_TYPES),
  location: optionalText(200, 'Location is too long'),
  notes: optionalText(5000, 'Notes cannot exceed 5000 characters'),
  lastContactedDate: z.string(),
  nextFollowUpDate: z.string(),
  status: z.enum(CONTACT_STATUSES),
})

const EMPTY_CONTACT = {
  fullName: '',
  phoneNumber: '',
  email: '',
  business: '',
  companyName: '',
  role: '',
  contactType: 'Other',
  location: '',
  notes: '',
  lastContactedDate: '',
  nextFollowUpDate: '',
  status: 'Active',
}

const inputClassName =
  'mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-3 focus:ring-primary/10'

function FieldError({ message }) {
  return message ? <p className="mt-1.5 text-xs font-normal leading-5 text-red-500">{message}</p> : null
}

function SectionHeading({ title, description }) {
  return (
    <div className="pb-3">
      <h2 className="text-base font-semibold text-[#292929] sm:text-lg">{title}</h2>
      {description && <p className="mt-1 text-xs leading-5 text-[#777] sm:text-sm">{description}</p>}
    </div>
  )
}

function ContactForm({
  businesses = [],
  initialValues = EMPTY_CONTACT,
  onSubmit,
  submitting,
  serverError,
  cancelTo = '/contacts',
}) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({ resolver: zodResolver(contactSchema), defaultValues: initialValues })

  useEffect(() => {
    reset(initialValues)
  }, [initialValues, reset])

  const handleBusinessChange = (businessId) => {
    const selectedBusiness = businesses.find((business) => business._id === businessId)
    if (selectedBusiness) setValue('companyName', selectedBusiness.companyName, { shouldValidate: true })
  }

  const submitValues = (values) => onSubmit({ ...values, business: values.business || null })

  return (
    <form onSubmit={handleSubmit(submitValues)} noValidate className="space-y-3">
      <section className="rounded-lg bg-white p-4 sm:p-6">
        <SectionHeading title="Basic information" description="Only the contact name is required." />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
            Full name <span className="text-red-500">*</span>
            <input {...register('fullName')} className={inputClassName} placeholder="Enter full name" autoComplete="name" />
            <FieldError message={errors.fullName?.message} />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Phone number
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              {...register('phoneNumber')}
              onInput={(event) => {
                event.currentTarget.value = event.currentTarget.value.replace(/\D/g, '')
              }}
              className={inputClassName}
              placeholder="Enter phone number"
              autoComplete="tel"
            />
            <FieldError message={errors.phoneNumber?.message} />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Email
            <input type="email" {...register('email')} className={inputClassName} placeholder="Enter email address" autoComplete="email" />
            <FieldError message={errors.email?.message} />
          </label>
          <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
            Location
            <input {...register('location')} className={inputClassName} placeholder="Enter location" autoComplete="address-level2" />
            <FieldError message={errors.location?.message} />
          </label>
        </div>
      </section>

      <section className="rounded-lg bg-white p-4 sm:p-6">
        <SectionHeading title="Work information" description="Link an existing Business only when it is useful." />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700">
            Linked business <span className="font-normal text-slate-400">(optional)</span>
            <FormSelect
              name="business"
              control={control}
              options={[
                { value: '', label: 'No linked business' },
                ...businesses.map((business) => ({ value: business._id, label: business.companyName })),
              ]}
              onValueChange={handleBusinessChange}
              className="mt-1.5"
            />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Company / business name
            <input {...register('companyName')} className={inputClassName} placeholder="Enter company or business name" />
            <FieldError message={errors.companyName?.message} />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Role / designation
            <input {...register('role')} className={inputClassName} placeholder="Enter role or designation" />
            <FieldError message={errors.role?.message} />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Contact type
            <FormSelect name="contactType" control={control} options={CONTACT_TYPES} className="mt-1.5" />
            <FieldError message={errors.contactType?.message} />
          </label>
        </div>
      </section>

      <section className="rounded-lg bg-white p-4 sm:p-6">
        <SectionHeading title="Relationship information" />
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="text-sm font-semibold text-slate-700">
            Last contacted
            <DateInput {...register('lastContactedDate')} className={inputClassName} />
            <FieldError message={errors.lastContactedDate?.message} />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Next follow-up
            <DateInput {...register('nextFollowUpDate')} className={inputClassName} />
            <FieldError message={errors.nextFollowUpDate?.message} />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Status
            <FormSelect name="status" control={control} options={CONTACT_STATUSES} className="mt-1.5" />
            <FieldError message={errors.status?.message} />
          </label>
        </div>
      </section>

      <section className="rounded-lg bg-white p-4 sm:p-6">
        <label className="text-sm font-semibold text-slate-700">
          Notes
          <textarea {...register('notes')} rows="5" className={`${inputClassName} resize-y`} placeholder="Important context, preferences, or anything worth remembering..." />
          <FieldError message={errors.notes?.message} />
        </label>
      </section>

      {serverError && (
        <p role="alert" className="rounded-md bg-red-50 px-4 py-3 text-sm font-normal text-red-600">{serverError}</p>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Link to={cancelTo} className="rounded-md bg-white px-5 py-2.5 text-center text-sm font-semibold text-[#555] transition hover:bg-[#f5f5f5]">Cancel</Link>
        <button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60">
          <FiSave aria-hidden="true" /> {submitting ? 'Saving...' : 'Save contact'}
        </button>
      </div>
    </form>
  )
}

export default ContactForm
