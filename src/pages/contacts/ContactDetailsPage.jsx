import { useCallback, useEffect, useState } from 'react'
import { FiBriefcase, FiCalendar, FiEdit2, FiMail, FiMapPin, FiPhone, FiTrash2, FiUser } from 'react-icons/fi'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'

import { ErrorState, LoadingState } from '../../components/businesses/PageState.jsx'
import ContactStatusBadge from '../../components/contacts/ContactStatusBadge.jsx'
import BackButton from '../../components/ui/BackButton.jsx'
import ConfirmModal from '../../components/ui/ConfirmModal.jsx'
import CopyButton from '../../components/ui/CopyButton.jsx'
import * as contactService from '../../services/contact.service.js'

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      })
    : 'Not recorded'

function DetailItem({ label, children }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-medium uppercase tracking-wide text-[#999] sm:text-xs">{label}</dt>
      <dd className="mt-1 break-words text-sm leading-6 text-[#444]">{children || '—'}</dd>
    </div>
  )
}

function InformationCard({ icon, title, children, tone = 'neutral' }) {
  const iconStyle = tone === 'green' ? 'bg-[#edf5f0] text-[#2f684f]' : tone === 'blue' ? 'bg-[#edf3f9] text-[#315f91]' : 'bg-primary-light text-primary-dark'
  return (
    <section className="rounded-lg bg-white p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <span className={`grid size-9 place-items-center rounded-md ${iconStyle}`}>{icon}</span>
        <h2 className="text-lg font-semibold text-[#292929]">{title}</h2>
      </div>
      <dl className="mt-5 space-y-4">{children}</dl>
    </section>
  )
}

function ContactDetailsPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [contact, setContact] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState('')

  const loadContact = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await contactService.getContactById(id)
      setContact(result.data)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { loadContact() }, [loadContact])

  const handleDelete = async () => {
    setDeleting(true)
    setError('')
    try {
      await contactService.deleteContact(id)
      setConfirmDelete(false)
      navigate('/contacts', { replace: true })
    } catch (requestError) {
      setError(requestError.message)
      setDeleting(false)
    }
  }

  return (
    <main className="w-full px-1 pb-3 pt-1 sm:px-2">
      {loading ? (
        <div className="rounded-lg bg-white p-5"><LoadingState label="Loading contact..." /></div>
      ) : !contact ? (
        <ErrorState message={error} onRetry={loadContact} backTo="/contacts" backLabel="Go to Contacts" />
      ) : (
        <>
          <section className="rounded-lg bg-white p-4 sm:p-7">
            <BackButton fallback="/contacts" />
            {location.state?.notice && <p className="mt-4 rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{location.state.notice}</p>}
            {error && <p role="alert" className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="break-words text-3xl tracking-[-0.035em] text-[#171717] sm:text-4xl">{contact.fullName}</h1>
                  <ContactStatusBadge status={contact.status} />
                </div>
                <p className="mt-2 text-sm text-[#777]">{contact.role || 'No role recorded'}{(contact.companyName || contact.business?.companyName) ? ` · ${contact.companyName || contact.business.companyName}` : ''}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:flex">
                <Link to={`/contacts/${id}/edit`} className="inline-flex items-center justify-center gap-2 rounded-md bg-[#ebe9e6] px-4 py-2.5 text-sm font-semibold text-[#333] transition hover:bg-[#dfdcd8]"><FiEdit2 aria-hidden="true" /> Edit</Link>
                <button type="button" onClick={() => setConfirmDelete(true)} disabled={deleting} className="inline-flex items-center justify-center gap-2 rounded-md bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"><FiTrash2 aria-hidden="true" /> Delete</button>
              </div>
            </div>
          </section>

          <div className="mt-3 grid gap-3 lg:grid-cols-3">
            <InformationCard icon={<FiUser aria-hidden="true" />} title="Basic information">
              <DetailItem label="Name"><span className="flex flex-wrap items-center gap-2"><span>{contact.fullName}</span><CopyButton value={contact.fullName} label="Copy contact name" showLabel className="px-2 py-1" /></span></DetailItem>
              <DetailItem label="Phone">{contact.phoneNumber ? <span className="flex flex-wrap items-center gap-2"><a href={`tel:${contact.phoneNumber}`} className="inline-flex items-center gap-2 hover:text-primary-dark"><FiPhone aria-hidden="true" /> {contact.phoneNumber}</a><CopyButton value={contact.phoneNumber} label="Copy phone number" showLabel className="px-2 py-1" /></span> : null}</DetailItem>
              <DetailItem label="Email">{contact.email ? <span className="flex flex-wrap items-center gap-2"><a href={`mailto:${contact.email}`} className="inline-flex items-center gap-2 break-all hover:text-primary-dark"><FiMail aria-hidden="true" /> {contact.email}</a><CopyButton value={contact.email} label="Copy email" showLabel className="px-2 py-1" /></span> : null}</DetailItem>
              <DetailItem label="Location">{contact.location ? <span className="inline-flex items-start gap-2"><FiMapPin className="mt-1 shrink-0" aria-hidden="true" /> {contact.location}</span> : null}</DetailItem>
            </InformationCard>

            <InformationCard icon={<FiBriefcase aria-hidden="true" />} title="Work information" tone="blue">
              <DetailItem label="Company / business">{contact.business ? <Link to={`/businesses/${contact.business._id}`} className="font-medium text-[#315f91] hover:underline">{contact.companyName || contact.business.companyName}</Link> : contact.companyName}</DetailItem>
              <DetailItem label="Role / designation">{contact.role}</DetailItem>
              <DetailItem label="Contact type"><span className="inline-flex rounded-full bg-[#f2f1ef] px-2.5 py-1 text-xs font-medium text-[#555]">{contact.contactType}</span></DetailItem>
              <DetailItem label="Linked Business">{contact.business ? 'Linked' : 'Not linked'}</DetailItem>
            </InformationCard>

            <InformationCard icon={<FiCalendar aria-hidden="true" />} title="Relationship information" tone="green">
              <DetailItem label="Last contacted">{formatDate(contact.lastContactedDate)}</DetailItem>
              <DetailItem label="Next follow-up">{formatDate(contact.nextFollowUpDate)}</DetailItem>
              <DetailItem label="Status"><ContactStatusBadge status={contact.status} /></DetailItem>
            </InformationCard>
          </div>

          <section className="mt-3 rounded-lg bg-white p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-[#292929]">Notes</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#5f5f5f]">{contact.notes || 'No notes added.'}</p>
          </section>

          <ConfirmModal open={confirmDelete} title="Delete contact?" message={`“${contact.fullName}” will be permanently deleted. This action cannot be undone.`} confirmLabel="Delete contact" loading={deleting} onConfirm={handleDelete} onCancel={() => setConfirmDelete(false)} />
        </>
      )}
    </main>
  )
}

export default ContactDetailsPage
