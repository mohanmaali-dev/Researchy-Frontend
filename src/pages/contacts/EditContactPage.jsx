import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { ErrorState, LoadingState } from '../../components/businesses/PageState.jsx'
import ContactForm from '../../components/contacts/ContactForm.jsx'
import BackButton from '../../components/ui/BackButton.jsx'
import * as businessService from '../../services/business.service.js'
import * as contactService from '../../services/contact.service.js'

const dateValue = (date) => (date ? date.slice(0, 10) : '')

function EditContactPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [contact, setContact] = useState(null)
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const loadContact = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [contactResult, businessResult] = await Promise.all([
        contactService.getContactById(id),
        businessService.getBusinesses().catch(() => ({ data: [] })),
      ])
      setContact(contactResult.data)
      setBusinesses(businessResult.data)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { loadContact() }, [loadContact])

  const initialValues = useMemo(() => contact ? {
    fullName: contact.fullName,
    phoneNumber: (contact.phoneNumber || '').replace(/\D/g, ''),
    email: contact.email || '',
    business: contact.business?._id || '',
    companyName: contact.companyName || contact.business?.companyName || '',
    role: contact.role || '',
    contactType: contact.contactType,
    location: contact.location || '',
    notes: contact.notes || '',
    lastContactedDate: dateValue(contact.lastContactedDate),
    nextFollowUpDate: dateValue(contact.nextFollowUpDate),
    status: contact.status,
  } : undefined, [contact])

  const handleSubmit = async (data) => {
    setSubmitting(true)
    setError('')
    try {
      await contactService.updateContact(id, data)
      navigate(`/contacts/${id}`, { state: { notice: 'Contact updated successfully.' } })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-1 pb-3 pt-1 sm:px-2">
      {loading ? <LoadingState label="Loading contact..." /> : !contact ? (
        <ErrorState message={error} onRetry={loadContact} backTo="/contacts" backLabel="Go to Contacts" />
      ) : (
        <>
          <section className="mb-3 rounded-lg bg-white p-5 sm:p-7">
            <BackButton fallback={`/contacts/${id}`} />
            <p className="mt-5 text-xs font-medium uppercase tracking-wider text-primary-dark">Update contact</p>
            <h1 className="mt-1 text-3xl tracking-[-0.035em] text-[#171717]">Edit {contact.fullName}</h1>
            <p className="mt-2 text-sm text-[#777]">Change only the details that need updating.</p>
          </section>
          <ContactForm businesses={businesses} initialValues={initialValues} onSubmit={handleSubmit} submitting={submitting} serverError={error} cancelTo={`/contacts/${id}`} />
        </>
      )}
    </main>
  )
}

export default EditContactPage
