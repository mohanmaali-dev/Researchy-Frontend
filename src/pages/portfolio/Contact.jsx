import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { FiChevronDown, FiChevronLeft, FiChevronRight, FiEye, FiInbox, FiMail, FiPhone, FiSearch, FiTrash2, FiX } from 'react-icons/fi'
import { useSearchParams } from 'react-router-dom'

import { ErrorState, TableLoadingState } from '../../components/businesses/PageState.jsx'
import PageHeader from '../../components/portfolio/PageHeader.jsx'
import BulkActions from '../../components/portfolio/BulkActions.jsx'
import ConfirmModal from '../../components/ui/ConfirmModal.jsx'
import CopyButton from '../../components/ui/CopyButton.jsx'
import TruncatedText from '../../components/ui/TruncatedText.jsx'
import { useBulkSelection } from '../../hooks/useBulkSelection.js'
import { deletePortfolioContactMessage, getPortfolioContactMessages, updatePortfolioContactMessage } from '../../services/portfolio.service.js'

const desktopColumns = 'minmax(10rem,1.1fr) minmax(13rem,1.3fr) minmax(10rem,1fr) minmax(15rem,1.8fr) 7rem 6rem 4.5rem'
const statusStyle = { New: 'bg-[#fff0ec] text-primary-dark', Read: 'bg-[#f2f1ef] text-[#666]' }
const formatDate = (date, includeTime = false) => new Date(date).toLocaleString(undefined, includeTime
  ? { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }
  : { day: 'numeric', month: 'short', year: 'numeric' })

function MessageViewer({ message, onClose, onToggleStatus, onDelete }) {
  useEffect(() => {
    if (!message) return undefined
    const close = (event) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', close)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', close); document.body.style.overflow = '' }
  }, [message, onClose])

  if (!message) return null
  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end justify-center p-2 sm:grid sm:place-items-center sm:p-5">
      <button type="button" className="absolute inset-0 bg-black/35 backdrop-blur-[2px]" onClick={onClose} aria-label="Close message" />
      <section role="dialog" aria-modal="true" aria-labelledby="contact-message-title" className="relative z-10 max-h-[calc(100dvh-1rem)] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-4 shadow-[0_24px_80px_rgba(0,0,0,.2)] sm:max-h-[calc(100dvh-3rem)] sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0"><span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyle[message.status]}`}>{message.status}</span><h2 id="contact-message-title" className="mt-3 text-xl font-semibold text-[#292929]">{message.subject || 'Portfolio enquiry'}</h2><p className="mt-1 text-xs text-[#888]">Received {formatDate(message.createdAt, true)}</p></div>
          <button type="button" onClick={onClose} className="grid size-10 shrink-0 place-items-center rounded-md bg-[#f4f3f1] text-[#666] hover:text-[#222]" aria-label="Close"><FiX /></button>
        </div>
        <div className="mt-5 grid gap-3 rounded-md bg-[#faf9f7] p-4 sm:grid-cols-2">
          <div><p className="text-[11px] font-medium uppercase tracking-wider text-[#999]">From</p><p className="mt-1 text-sm font-semibold text-[#333]">{message.fullName}</p></div>
          <div><p className="text-[11px] font-medium uppercase tracking-wider text-[#999]">Contact</p><span className="mt-1 flex min-w-0 items-center gap-1"><a href={`mailto:${message.email}`} className="truncate text-sm text-primary-dark hover:underline">{message.email}</a><CopyButton value={message.email} label="Copy email" className="size-8" /></span>{message.phone && <span className="mt-1 flex items-center gap-1"><a href={`tel:${message.phone}`} className="text-sm text-[#666] hover:text-primary-dark">{message.phone}</a><CopyButton value={message.phone} label="Copy phone number" className="size-8" /></span>}</div>
        </div>
        <div className="mt-5"><p className="text-xs font-semibold uppercase tracking-wider text-[#999]">Message</p><p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#4f4f4f]">{message.message}</p></div>
        <div className="mt-6 flex flex-col-reverse gap-2 border-t border-[#eceae7] pt-4 sm:flex-row sm:justify-between">
          <button type="button" onClick={onDelete} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium text-red-600 hover:bg-red-50"><FiTrash2 /> Delete</button>
          <button type="button" onClick={onToggleStatus} className="min-h-10 rounded-md bg-[#f2f1ef] px-4 text-sm font-semibold text-[#555] hover:bg-[#e9e7e4]">Mark as {message.status === 'New' ? 'read' : 'new'}</button>
        </div>
      </section>
    </div>,
    document.body,
  )
}

function Contact() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [messages, setMessages] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || 'All'
  const rawPage = Number(searchParams.get('page'))
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1
  const bulk = useBulkSelection(messages)

  const loadMessages = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const result = await getPortfolioContactMessages({ page, limit: 10, search, status })
      setMessages(result.data || [])
      setPagination(result.pagination)
    } catch (requestError) { setError(requestError.message) } finally { setLoading(false) }
  }, [page, search, status])

  useEffect(() => { const timer = window.setTimeout(loadMessages, search ? 250 : 0); return () => window.clearTimeout(timer) }, [loadMessages, search])

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (!value || value === 'All' || (key === 'page' && Number(value) === 1)) next.delete(key); else next.set(key, value)
    if (key !== 'page') next.delete('page')
    setSearchParams(next, { replace: true })
  }

  const openMessage = async (message) => {
    setSelected(message)
    if (message.status !== 'New') return
    try {
      const result = await updatePortfolioContactMessage(message._id, 'Read')
      setSelected(result.data)
      setMessages((items) => items.map((item) => item._id === message._id ? result.data : item))
      window.dispatchEvent(new Event('portfolio:messages-changed'))
    } catch (requestError) { setError(requestError.message) }
  }

  const toggleStatus = async () => {
    if (!selected) return
    try {
      const result = await updatePortfolioContactMessage(selected._id, selected.status === 'New' ? 'Read' : 'New')
      setSelected(result.data)
      setMessages((items) => items.map((item) => item._id === selected._id ? result.data : item))
      window.dispatchEvent(new Event('portfolio:messages-changed'))
    } catch (requestError) { setError(requestError.message) }
  }

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      await deletePortfolioContactMessage(deleteTarget._id)
      setDeleteTarget(null); setSelected(null)
      await loadMessages()
      window.dispatchEvent(new Event('portfolio:messages-changed'))
    } catch (requestError) { setError(requestError.message); setDeleteTarget(null) } finally { setDeleting(false) }
  }

  return (
    <div className="space-y-3">
      <PageHeader title="Contact messages" description="Read enquiries sent from your public portfolio." />
      <section className="rounded-lg bg-white p-4 sm:p-6">
        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_10rem]">
          <label className="flex h-10 items-center gap-3 rounded-md border border-[#d9d6d2] bg-white px-3 text-[#777] transition-colors focus-within:border-primary/60 focus-within:text-primary-dark"><FiSearch /><input value={search} onChange={(event) => updateParam('search', event.target.value)} className="global-search-input min-w-0 flex-1 border-0 bg-transparent text-sm text-[#222] outline-none placeholder:text-[#999]" placeholder="Search messages" /></label>
          <label className="relative"><span className="sr-only">Message status</span><select value={status} onChange={(event) => updateParam('status', event.target.value)} className="h-10 w-full appearance-none rounded-md border border-[#d9d6d2] bg-white px-3 pr-9 text-sm text-[#333] outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/5"><option>All</option><option>New</option><option>Read</option></select><FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#777]" /></label>
        </div>
        {messages.length > 0 && <div className="mt-3"><BulkActions entity="contactMessages" label="contact messages" items={messages} getItemLabel={(item) => `${item.fullName}: ${item.subject || 'Portfolio enquiry'}`} selected={bulk.selected} selectedIds={bulk.selectedIds} allSelected={bulk.allSelected} visibleCount={bulk.visibleCount} onToggle={bulk.toggle} onToggleAll={bulk.toggleAll} onClear={bulk.clear} onDeleted={async () => { await loadMessages(); window.dispatchEvent(new Event('portfolio:messages-changed')) }} /></div>}

        <div className="mt-4">
          {loading ? <TableLoadingState label="Loading contact messages" headers={['Visitor', 'Contact', 'Subject', 'Message', 'Received', 'Status', '']} template={desktopColumns} minWidth="1060px" /> : error && !messages.length ? <ErrorState message={error} onRetry={loadMessages} backTo="/portfolio" backLabel="Portfolio overview" /> : !messages.length ? (
            <div className="py-14 text-center"><span className="mx-auto grid size-12 place-items-center rounded-md bg-[#fff0ec] text-xl text-primary-dark"><FiInbox /></span><h2 className="mt-4 text-base font-semibold">{search || status !== 'All' ? 'No matching messages' : 'No contact messages yet'}</h2><p className="mt-1 text-sm text-[#888]">{search || status !== 'All' ? 'Try changing the search or status.' : 'Messages from your public portfolio will appear here.'}</p></div>
          ) : <>
            {error && <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            <div className="hidden overflow-x-auto md:block"><div className="min-w-[1060px]">
              <div className="grid items-center gap-4 bg-[#faf9f7] px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-[#999]" style={{ gridTemplateColumns: desktopColumns }}>{['Visitor', 'Contact', 'Subject', 'Message', 'Received', 'Status', ''].map((heading) => <span key={heading}>{heading}</span>)}</div>
              <div className="divide-y divide-[#eceae7]">{messages.map((message) => <div key={message._id} role="button" tabIndex="0" onClick={() => openMessage(message)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') openMessage(message) }} className={`grid min-h-20 w-full cursor-pointer items-center gap-4 px-4 py-3 text-left transition hover:bg-[#faf9f7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary/40 ${message.status === 'New' ? 'bg-[#fffdfa]' : ''}`} style={{ gridTemplateColumns: desktopColumns }}>
                <span className="min-w-0"><span className={`block truncate text-sm text-[#292929] ${message.status === 'New' ? 'font-semibold' : 'font-medium'}`}>{message.fullName}</span></span>
                <span className="min-w-0"><span className="flex items-center gap-1"><FiMail className="shrink-0 text-[#999]" /><span className="truncate text-xs text-[#666]">{message.email}</span><CopyButton value={message.email} label="Copy email" className="size-7" /></span>{message.phone && <span className="mt-1 flex items-center gap-1"><FiPhone className="shrink-0 text-[#999]" /><span className="truncate text-xs text-[#777]">{message.phone}</span><CopyButton value={message.phone} label="Copy phone number" className="size-7" /></span>}</span>
                <TruncatedText value={message.subject} className="text-sm text-[#555]" emptyLabel="Portfolio enquiry" />
                <TruncatedText value={message.message} className="text-sm text-[#666]" />
                <span className="text-xs text-[#777]">{formatDate(message.createdAt)}</span>
                <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle[message.status]}`}>{message.status}</span>
                <span className="grid size-9 place-items-center rounded-md text-[#888]"><FiEye /></span>
              </div>)}</div>
            </div></div>

            <div className="space-y-2 md:hidden">{messages.map((message) => <button type="button" key={message._id} onClick={() => openMessage(message)} className={`w-full rounded-md p-3.5 text-left ${message.status === 'New' ? 'bg-[#fff8f5]' : 'bg-[#f7f7f7]'}`}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className={`truncate text-sm text-[#292929] ${message.status === 'New' ? 'font-semibold' : 'font-medium'}`}>{message.fullName}</p><p className="mt-0.5 truncate text-xs text-[#777]">{message.email}</p></div><span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${statusStyle[message.status]}`}>{message.status}</span></div><p className="mt-3 truncate text-sm font-medium text-[#444]">{message.subject || 'Portfolio enquiry'}</p><p className="mt-1 line-clamp-2 text-xs leading-5 text-[#777]">{message.message}</p><div className="mt-3 flex items-center justify-between text-xs text-[#999]"><span>{formatDate(message.createdAt)}</span><span className="inline-flex items-center gap-1 font-semibold text-primary-dark">View <FiEye /></span></div></button>)}</div>

            {pagination.totalPages > 1 && <div className="mt-5 flex items-center justify-between border-t border-[#eceae7] pt-4"><p className="text-xs text-[#888]">Page {pagination.page} of {pagination.totalPages} · {pagination.totalItems} messages</p><div className="flex gap-2"><button type="button" disabled={!pagination.hasPreviousPage} onClick={() => updateParam('page', page - 1)} className="grid size-9 place-items-center rounded-md border border-[#ddd9d5] disabled:opacity-40" aria-label="Previous page"><FiChevronLeft /></button><button type="button" disabled={!pagination.hasNextPage} onClick={() => updateParam('page', page + 1)} className="grid size-9 place-items-center rounded-md border border-[#ddd9d5] disabled:opacity-40" aria-label="Next page"><FiChevronRight /></button></div></div>}
          </>}
        </div>
      </section>
      <MessageViewer message={selected} onClose={() => setSelected(null)} onToggleStatus={toggleStatus} onDelete={() => { setDeleteTarget(selected); setSelected(null) }} />
      <ConfirmModal open={Boolean(deleteTarget)} title="Delete this message?" message={`The message from ${deleteTarget?.fullName || 'this visitor'} will be permanently removed.`} confirmLabel="Delete message" loading={deleting} onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  )
}

export default Contact
