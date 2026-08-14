import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { FiSave } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { z } from 'zod'

import * as conversationService from '../../services/conversation.service.js'
import DateInput from '../ui/DateInput.jsx'
import FormSelect from '../ui/FormSelect.jsx'

const STATUSES = ['Pending', 'Completed', 'Cancelled']

const followUpSchema = z.object({
  business: z.string().min(1, 'Business is required'),
  conversation: z.string(),
  opportunity: z.string(),
  followUpDate: z.string().min(1, 'Follow-up date is required'),
  reason: z.string().trim().min(1, 'Reason/title is required').max(250, 'Reason/title is too long'),
  notes: z.string().trim().max(5000, 'Notes cannot exceed 5000 characters'),
  status: z.enum(STATUSES),
})

const inputClassName =
  'mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-3 focus:ring-primary/10'

function FieldError({ message }) {
  return message ? <p className="mt-1.5 text-xs font-normal leading-5 text-red-500">{message}</p> : null
}

function FollowUpForm({
  businesses,
  opportunities,
  initialValues,
  onSubmit,
  submitting,
  serverError,
  cancelTo,
}) {
  const [conversations, setConversations] = useState([])
  const [relationshipError, setRelationshipError] = useState('')
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(followUpSchema), defaultValues: initialValues })
  const businessId = watch('business')

  useEffect(() => {
    reset(initialValues)
  }, [initialValues, reset])

  useEffect(() => {
    let active = true
    setRelationshipError('')

    if (!businessId) {
      setConversations([])
      return () => {
        active = false
      }
    }

    conversationService
      .getConversationsByBusiness(businessId)
      .then((result) => {
        if (active) setConversations(result.data)
      })
      .catch((requestError) => {
        if (active) setRelationshipError(requestError.message)
      })

    return () => {
      active = false
    }
  }, [businessId])

  const relatedOpportunities = useMemo(
    () => opportunities.filter((item) => item.business?._id === businessId),
    [businessId, opportunities],
  )

  const handleBusinessChange = () => {
    setValue('conversation', '')
    setValue('opportunity', '')
  }

  const submitValues = (values) =>
    onSubmit({
      ...values,
      conversation: values.conversation || null,
      opportunity: values.opportunity || null,
    })

  return (
    <form onSubmit={handleSubmit(submitValues)} noValidate className="space-y-8">
      <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700">
            Business <span className="text-red-500">*</span>
            <FormSelect
              name="business"
              control={control}
              options={[
                { value: '', label: 'Select a business' },
                ...businesses.map((business) => ({
                  value: business._id,
                  label: business.companyName,
                })),
              ]}
              onValueChange={handleBusinessChange}
              className="mt-1.5"
            />
            <FieldError message={errors.business?.message} />
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Follow-up date <span className="text-red-500">*</span>
            <DateInput {...register('followUpDate')} className={inputClassName} />
            <FieldError message={errors.followUpDate?.message} />
          </label>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700">
            Conversation <span className="font-normal text-slate-400">(optional)</span>
            <FormSelect
              name="conversation"
              control={control}
              disabled={!businessId}
              options={[
                { value: '', label: 'No related conversation' },
                ...conversations.map((conversation) => ({
                  value: conversation._id,
                  label: `${conversation.personName} · ${conversation.personRole}`,
                })),
              ]}
              className="mt-1.5"
            />
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Opportunity <span className="font-normal text-slate-400">(optional)</span>
            <FormSelect
              name="opportunity"
              control={control}
              disabled={!businessId}
              options={[
                { value: '', label: 'No related opportunity' },
                ...relatedOpportunities.map((opportunity) => ({
                  value: opportunity._id,
                  label: opportunity.problem?.title || 'Opportunity',
                })),
              ]}
              className="mt-1.5"
            />
          </label>
        </div>

        {relationshipError && <p className="text-xs font-normal leading-5 text-red-500">{relationshipError}</p>}

        <label className="block text-sm font-semibold text-slate-700">
          Reason / title <span className="text-red-500">*</span>
          <input
            {...register('reason')}
            className={inputClassName}
            placeholder="e.g. Confirm whether they would pay"
          />
          <FieldError message={errors.reason?.message} />
        </label>

        <label className="block text-sm font-semibold text-slate-700">
          Notes
          <textarea
            {...register('notes')}
            rows="6"
            className={`${inputClassName} resize-y`}
            placeholder="What should you ask or remember?"
          />
          <FieldError message={errors.notes?.message} />
        </label>

        <label className="block max-w-sm text-sm font-semibold text-slate-700">
          Status <span className="text-red-500">*</span>
          <FormSelect name="status" control={control} options={STATUSES} className="mt-1.5" />
          <FieldError message={errors.status?.message} />
        </label>
      </section>

      {serverError && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</p>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link to={cancelTo} className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</Link>
        <button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60">
          <FiSave aria-hidden="true" /> {submitting ? 'Saving...' : 'Save follow-up'}
        </button>
      </div>
    </form>
  )
}

export default FollowUpForm
