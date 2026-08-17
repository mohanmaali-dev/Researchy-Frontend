import { useCallback, useEffect, useState } from 'react'
import { FiChevronDown, FiChevronLeft, FiChevronRight, FiPhone, FiPlus, FiSearch, FiUsers } from 'react-icons/fi'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { CONTACT_TYPES } from '../../components/contacts/contact.constants.js'
import ContactStatusBadge from '../../components/contacts/ContactStatusBadge.jsx'
import { ErrorState, LoadingState } from '../../components/businesses/PageState.jsx'
import CopyButton from '../../components/ui/CopyButton.jsx'
import * as contactService from '../../services/contact.service.js'

const STATUS_OPTIONS = ['Active', 'Inactive']

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
      })
    : 'Not recorded'

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="block min-w-0">
      <span className="sr-only">{label}</span>
      <span className="relative block">
        <select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full appearance-none rounded-md border border-[#d9d6d2] bg-white py-2 pl-3 pr-9 text-xs text-[#333] outline-none transition hover:border-[#c9c4bf] focus:border-primary focus:ring-2 focus:ring-primary/10 sm:text-sm" aria-label={label}>
          {options.map((option) => {
            const optionValue = typeof option === 'object' ? option.value : option
            const optionLabel = typeof option === 'object' ? option.label : option
            return <option key={optionValue} value={optionValue}>{optionLabel}</option>
          })}
        </select>
        <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#777]" aria-hidden="true" />
      </span>
    </label>
  )
}

function ContactTypeBadge({ type }) {
  return <span className="inline-flex rounded-full bg-[#f2f1ef] px-2.5 py-1 text-xs font-medium text-[#555]">{type}</span>
}

function ContactListPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [contacts, setContacts] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalItems: 0, totalPages: 1, hasPreviousPage: false, hasNextPage: false })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const search = searchParams.get('search') || ''
  const contactType = searchParams.get('type') || 'All'
  const status = searchParams.get('status') || 'All'
  const pageValue = Number(searchParams.get('page'))
  const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1
  const hasFilters = Boolean(search || contactType !== 'All' || status !== 'All')

  const loadContacts = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await contactService.getContacts({ page, limit: 10, search, contactType, status })
      setContacts(result.data)
      setPagination(result.pagination)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [contactType, page, search, status])

  useEffect(() => {
    const timeout = window.setTimeout(loadContacts, search ? 300 : 0)
    return () => window.clearTimeout(timeout)
  }, [loadContacts, search])

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (!value || value === 'All' || (key === 'page' && Number(value) <= 1)) next.delete(key)
    else next.set(key, value)
    if (key !== 'page') next.delete('page')
    setSearchParams(next, { replace: true })
  }

  const clearFilters = () => setSearchParams({}, { replace: true })

  const openContact = (contactId) => navigate(`/contacts/${contactId}`)

  const handleContactKeyDown = (event, contactId) => {
    if (event.target !== event.currentTarget) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openContact(contactId)
    }
  }

  return (
    <main className="w-full px-1 pb-3 pt-1 sm:px-2">
      <section className="rounded-lg bg-white p-5 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-[#888]">Contacts workspace</p>
            <h1 className="mt-1 text-3xl tracking-[-0.035em] text-[#171717] sm:text-4xl">Contacts</h1>
            <p className="mt-2 text-sm leading-6 text-[#707070]">Keep important people and relationship details in one place.</p>
          </div>
          <Link to="/contacts/new" className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-white transition hover:bg-primary-dark"><FiPlus aria-hidden="true" /> Add contact</Link>
        </div>

        <div className="mt-5 rounded-md bg-[#f7f7f7] p-3">
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-[minmax(16rem,1fr)_12rem_10rem]">
            <label className="col-span-2 flex h-10 items-center gap-3 rounded-md border border-[#d9d6d2] bg-white px-3 text-[#777] transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 lg:col-span-1">
              <FiSearch className="shrink-0" aria-hidden="true" />
              <input value={search} onChange={(event) => updateFilter('search', event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm text-[#222] outline-none placeholder:text-[#999]" placeholder="Search name, company, phone, or email" aria-label="Search contacts" />
            </label>
            <FilterSelect label="Contact type" value={contactType} onChange={(value) => updateFilter('type', value)} options={[{ value: 'All', label: 'All contact types' }, ...CONTACT_TYPES]} />
            <FilterSelect label="Status" value={status} onChange={(value) => updateFilter('status', value)} options={[{ value: 'All', label: 'All statuses' }, ...STATUS_OPTIONS]} />
          </div>
        </div>
      </section>

      <section className="mt-3 rounded-lg bg-white p-4 sm:p-6">
        {error && contacts.length > 0 && <p role="alert" className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
        {loading ? (
          <LoadingState label="Loading contacts..." />
        ) : error && contacts.length === 0 ? (
          <ErrorState message={error} onRetry={loadContacts} backTo="/home" backLabel="Go to Home" />
        ) : contacts.length === 0 && !hasFilters ? (
          <div className="px-4 py-14 text-center">
            <span className="mx-auto grid size-11 place-items-center rounded-md bg-[#edf5f0] text-[#2f684f]"><FiUsers aria-hidden="true" /></span>
            <h2 className="mt-4 text-lg font-semibold text-[#292929]">No contacts yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#777]">Add the first person you want to remember or contact again.</p>
            <Link to="/contacts/new" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary-dark"><FiPlus aria-hidden="true" /> Add contact</Link>
          </div>
        ) : contacts.length === 0 ? (
          <div className="px-4 py-14 text-center">
            <FiSearch className="mx-auto text-2xl text-[#aaa]" aria-hidden="true" />
            <h2 className="mt-4 text-lg">No matching contacts</h2>
            <p className="mt-2 text-sm text-[#777]">Try another search or filter.</p>
            <button type="button" onClick={clearFilters} className="mt-4 text-sm font-medium text-primary-dark">Clear filters</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-1 pb-4">
              <p className="text-sm font-medium text-[#333]">{`${(pagination.page - 1) * pagination.limit + 1}–${Math.min(pagination.page * pagination.limit, pagination.totalItems)} of ${pagination.totalItems} contacts`}</p>
              {hasFilters && <button type="button" onClick={clearFilters} className="text-xs font-medium text-[#777] hover:text-primary-dark">Clear filters</button>}
            </div>

            <div className="hidden overflow-x-auto rounded-md bg-[#fafafa] lg:block">
              <div className="min-w-[1050px] overflow-hidden">
                <div className="grid grid-cols-12 items-center gap-3 px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-[#999]">
                  <span className="col-span-2">Name</span><span className="col-span-2">Email</span><span className="col-span-2">Company</span><span className="col-span-1">Role</span><span className="col-span-2">Contact type</span><span className="col-span-2">Phone</span><span className="col-span-1">Last contacted</span>
                </div>
                <div className="space-y-px bg-[#ededeb]">
                  {contacts.map((contact) => (
                    <div key={contact._id} role="link" tabIndex={0} onClick={() => openContact(contact._id)} onKeyDown={(event) => handleContactKeyDown(event, contact._id)} className="group grid cursor-pointer grid-cols-12 items-center gap-3 bg-white px-5 py-4 transition hover:bg-[#f8fbf9] focus:bg-[#f8fbf9] focus:outline-none">
                      <div className="col-span-2 flex min-w-0 items-center gap-1"><span className="truncate text-sm font-medium text-[#222] group-hover:text-[#2f684f]">{contact.fullName}</span><CopyButton value={contact.fullName} label="Copy contact name" className="size-7" /></div>
                      <span className="col-span-2 flex min-w-0 items-center gap-1 text-sm text-[#666]">{contact.email ? <><span className="truncate">{contact.email}</span><CopyButton value={contact.email} label="Copy email" className="size-7" /></> : '—'}</span>
                      <span className="col-span-2 truncate text-sm text-[#666]">{contact.companyName || contact.business?.companyName || '—'}</span>
                      <span className="col-span-1 truncate text-sm text-[#666]">{contact.role || '—'}</span>
                      <span className="col-span-2 min-w-0"><ContactTypeBadge type={contact.contactType} /></span>
                      <span className="col-span-2 flex min-w-0 items-center gap-1.5 text-sm text-[#666]">{contact.phoneNumber ? <><FiPhone className="shrink-0 text-[#999]" aria-hidden="true" /><span className="truncate">{contact.phoneNumber}</span><CopyButton value={contact.phoneNumber} label="Copy phone number" className="size-7" /></> : '—'}</span>
                      <span className="col-span-1 truncate text-xs text-[#666]">{formatDate(contact.lastContactedDate)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3 lg:hidden">
              {contacts.map((contact) => (
                <div key={contact._id} role="link" tabIndex={0} onClick={() => openContact(contact._id)} onKeyDown={(event) => handleContactKeyDown(event, contact._id)} className="block cursor-pointer rounded-md bg-[#f7f7f7] p-4 transition active:bg-[#f1f1ef] focus:outline-none focus:ring-2 focus:ring-[#5b8c73]/20">
                  <div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex items-center gap-1"><h2 className="truncate text-base font-semibold text-[#222]">{contact.fullName}</h2><CopyButton value={contact.fullName} label="Copy contact name" className="size-7" /></div><p className="mt-1 truncate text-sm text-[#666]">{contact.companyName || contact.business?.companyName || 'No company'}{contact.role ? ` · ${contact.role}` : ''}</p></div><ContactStatusBadge status={contact.status} /></div>
                  <div className="mt-3 space-y-2 text-xs text-[#666]">{contact.email && <div className="flex min-w-0 items-center gap-1.5"><span className="truncate">{contact.email}</span><CopyButton value={contact.email} label="Copy email" className="size-7" /></div>}<div className="flex flex-wrap items-center gap-x-4 gap-y-2"><ContactTypeBadge type={contact.contactType} />{contact.phoneNumber && <span className="inline-flex items-center gap-1.5"><FiPhone aria-hidden="true" /> {contact.phoneNumber}<CopyButton value={contact.phoneNumber} label="Copy phone number" className="size-7" /></span>}<span>Last contact: {formatDate(contact.lastContactedDate)}</span></div></div>
                </div>
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <nav className="mt-5 flex items-center justify-between border-t border-[#e8e5e1] pt-4" aria-label="Contact pages">
                <button type="button" onClick={() => updateFilter('page', String(pagination.page - 1))} disabled={!pagination.hasPreviousPage} className="inline-flex items-center gap-1.5 rounded-md border border-[#d8d4d0] bg-white px-3 py-2 text-xs font-medium text-[#444] transition hover:bg-[#f7f7f7] disabled:cursor-not-allowed disabled:opacity-40"><FiChevronLeft aria-hidden="true" /> Previous</button>
                <span className="text-xs text-[#777]">Page <strong className="font-medium text-[#333]">{pagination.page}</strong> of {pagination.totalPages}</span>
                <button type="button" onClick={() => updateFilter('page', String(pagination.page + 1))} disabled={!pagination.hasNextPage} className="inline-flex items-center gap-1.5 rounded-md border border-[#d8d4d0] bg-white px-3 py-2 text-xs font-medium text-[#444] transition hover:bg-[#f7f7f7] disabled:cursor-not-allowed disabled:opacity-40">Next <FiChevronRight aria-hidden="true" /></button>
              </nav>
            )}
          </>
        )}
      </section>
    </main>
  )
}

export default ContactListPage
