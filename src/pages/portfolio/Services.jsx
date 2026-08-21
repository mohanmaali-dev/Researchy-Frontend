import { useCallback, useEffect, useState } from 'react'
import { FiBriefcase, FiCheck, FiClock, FiEdit2, FiLayers, FiPlus, FiSave, FiTrash2, FiX, FiZap } from 'react-icons/fi'

import { ErrorState, LoadingState } from '../../components/businesses/PageState.jsx'
import PageHeader from '../../components/portfolio/PageHeader.jsx'
import BulkActions from '../../components/portfolio/BulkActions.jsx'
import ConfirmModal from '../../components/ui/ConfirmModal.jsx'
import { FORM_INPUT_CLASS, ServerError } from '../../components/ui/FormElements.jsx'
import TruncatedText from '../../components/ui/TruncatedText.jsx'
import { useBulkSelection } from '../../hooks/useBulkSelection.js'
import {
  createPortfolioService,
  deletePortfolioService,
  getPortfolioServices,
  updatePortfolioService,
} from '../../services/portfolio.service.js'

const SERVICE_TYPES = ['Web Development', 'Frontend', 'Backend & API', 'Full Stack', 'Consulting', 'Automation', 'Other']
const EMPTY_SERVICE = { title: '', shortDescription: '', description: '', serviceType: 'Web Development', featuresText: '', priceLabel: '', deliveryTime: '', featured: false, status: 'Published', displayOrder: 0 }
const statusClass = (status) => status === 'Published' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'

const toForm = (item = EMPTY_SERVICE) => ({ ...EMPTY_SERVICE, ...item, featuresText: (item.features || []).join('\n') })

function Services() {
  const [services, setServices] = useState([])
  const [form, setForm] = useState(EMPTY_SERVICE)
  const [editingId, setEditingId] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const bulk = useBulkSelection(services)

  const loadServices = useCallback(async () => {
    setLoading(true); setError('')
    try { setServices((await getPortfolioServices()).data || []) } catch (requestError) { setError(requestError.message) } finally { setLoading(false) }
  }, [])
  useEffect(() => { loadServices() }, [loadServices])

  const closeForm = () => { setShowForm(false); setEditingId(''); setForm(EMPTY_SERVICE); setFormError('') }
  const openNew = () => { setEditingId(''); setForm(EMPTY_SERVICE); setFormError(''); setShowForm(true) }
  const openEdit = (item) => { setEditingId(item._id); setForm(toForm(item)); setFormError(''); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const updateField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }))

  const saveService = async (event) => {
    event.preventDefault()
    if (!form.title.trim() || !form.shortDescription.trim()) { setFormError('Service title and short description are required'); return }
    setSaving(true); setFormError('')
    const payload = {
      ...form,
      title: form.title.trim(),
      shortDescription: form.shortDescription.trim(),
      features: form.featuresText.split('\n').map((feature) => feature.trim()).filter(Boolean),
      displayOrder: Number(form.displayOrder) || 0,
    }
    delete payload.featuresText
    try { await (editingId ? updatePortfolioService(editingId, payload) : createPortfolioService(payload)); closeForm(); await loadServices() } catch (requestError) { setFormError(requestError.message) } finally { setSaving(false) }
  }

  const removeService = async () => {
    try { await deletePortfolioService(deleteTarget._id); setDeleteTarget(null); await loadServices() } catch (requestError) { setError(requestError.message); setDeleteTarget(null) }
  }

  if (loading) return <LoadingState label="Loading services" />
  if (error && !services.length) return <ErrorState message={error} onRetry={loadServices} backTo="/portfolio" backLabel="Portfolio overview" />

  return <div className="space-y-3">
    <PageHeader title="Services" description="Manage the professional services available on your portfolio."><button type="button" onClick={openNew} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"><FiPlus /> Add service</button></PageHeader>

    {showForm && <form onSubmit={saveService} className="rounded-lg bg-white p-4 sm:p-6">
      <div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold text-[#292929]">{editingId ? 'Edit service' : 'Add service'}</h2><p className="mt-1 text-xs text-[#888]">Describe one clear service clients can understand quickly.</p></div><button type="button" onClick={closeForm} className="grid size-9 place-items-center rounded-md bg-[#f5f5f5] text-[#777]" aria-label="Close service form"><FiX /></button></div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-[#555]">Service title <span className="text-red-500">*</span><input value={form.title} onChange={updateField('title')} className={FORM_INPUT_CLASS} placeholder="Enter a clear service title" maxLength="180" /></label>
        <label className="text-sm font-semibold text-[#555]">Service type<select value={form.serviceType} onChange={updateField('serviceType')} className={FORM_INPUT_CLASS}>{SERVICE_TYPES.map((type) => <option key={type}>{type}</option>)}</select></label>
        <label className="text-sm font-semibold text-[#555] sm:col-span-2">Short description <span className="text-red-500">*</span><input value={form.shortDescription} onChange={updateField('shortDescription')} className={FORM_INPUT_CLASS} placeholder="Explain the service in one sentence" maxLength="400" /></label>
        <label className="text-sm font-semibold text-[#555] sm:col-span-2">Full description<textarea rows="4" value={form.description} onChange={updateField('description')} className={`${FORM_INPUT_CLASS} resize-y`} placeholder="Explain what you provide and how it helps" /></label>
        <label className="text-sm font-semibold text-[#555] sm:col-span-2">What is included<textarea rows="4" value={form.featuresText} onChange={updateField('featuresText')} className={`${FORM_INPUT_CLASS} resize-y`} placeholder={'Add one item per line\nFor example: Responsive development'} /><span className="mt-1 block text-xs font-normal text-[#999]">One item per line. Duplicate items are removed automatically.</span></label>
        <label className="text-sm font-semibold text-[#555]">Price label<input value={form.priceLabel} onChange={updateField('priceLabel')} className={FORM_INPUT_CLASS} placeholder="For example: Starting from ₹20,000" maxLength="120" /></label>
        <label className="text-sm font-semibold text-[#555]">Delivery time<input value={form.deliveryTime} onChange={updateField('deliveryTime')} className={FORM_INPUT_CLASS} placeholder="For example: 2–4 weeks" maxLength="120" /></label>
        <label className="text-sm font-semibold text-[#555]">Status<select value={form.status} onChange={updateField('status')} className={FORM_INPUT_CLASS}><option>Published</option><option>Draft</option></select></label>
        <label className="text-sm font-semibold text-[#555]">Display order<input type="number" min="0" max="9999" value={form.displayOrder} onChange={updateField('displayOrder')} className={FORM_INPUT_CLASS} /></label>
        <label className="flex items-start gap-3 rounded-md bg-[#faf9f7] p-3 sm:col-span-2"><input type="checkbox" checked={form.featured} onChange={updateField('featured')} className="mt-0.5 size-4 accent-[#f36b4c]" /><span><span className="block text-sm font-semibold text-[#444]">Featured service</span><span className="block text-xs text-[#888]">Highlight this service on the public portfolio.</span></span></label>
      </div>
      <ServerError message={formError} /><div className="mt-5 flex justify-end"><button type="submit" disabled={saving} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60 sm:w-auto"><FiSave /> {saving ? 'Saving...' : 'Save service'}</button></div>
    </form>}

    {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
    {services.length > 0 && <section className="rounded-lg bg-white p-3 sm:px-6 sm:pt-4"><BulkActions entity="services" label="services" items={services} selected={bulk.selected} selectedIds={bulk.selectedIds} allSelected={bulk.allSelected} visibleCount={bulk.visibleCount} onToggle={bulk.toggle} onToggleAll={bulk.toggleAll} onClear={bulk.clear} onDeleted={loadServices} /></section>}
    <ServiceList services={services} onAdd={openNew} onEdit={openEdit} onDelete={setDeleteTarget} />
    <ConfirmModal open={Boolean(deleteTarget)} title="Delete this service?" message={`“${deleteTarget?.title || 'This service'}” will be permanently removed.`} confirmLabel="Delete service" onConfirm={removeService} onCancel={() => setDeleteTarget(null)} />
  </div>
}

function ServiceList({ services, onAdd, onEdit, onDelete }) {
  if (!services.length) return <section className="rounded-lg bg-white px-4 py-14 text-center"><span className="mx-auto grid size-12 place-items-center rounded-md bg-[#fff0ec] text-xl text-primary-dark"><FiLayers /></span><h2 className="mt-4 font-semibold">No services added</h2><p className="mt-1 text-sm text-[#888]">Add the first service you want to offer through your portfolio.</p><button type="button" onClick={onAdd} className="mt-4 text-sm font-semibold text-primary-dark">Add service</button></section>
  return <section className="overflow-hidden rounded-lg bg-white">
    <div className="px-4 py-4 sm:px-6"><h2 className="text-sm font-semibold text-[#292929]">Service list</h2><p className="mt-0.5 text-xs text-[#888]">{services.length} {services.length === 1 ? 'service' : 'services'}</p></div>
    <div className="hidden overflow-x-auto md:block"><div className="min-w-[1050px]"><div className="grid grid-cols-[minmax(13rem,1.2fr)_9rem_minmax(14rem,1.4fr)_8rem_8rem_6.5rem_4rem_5rem] gap-4 bg-[#faf9f7] px-6 py-3 text-[11px] font-medium uppercase tracking-wider text-[#999]"><span>Service</span><span>Type</span><span>What is included</span><span>Price</span><span>Delivery</span><span>Status</span><span>Order</span><span className="text-right">Actions</span></div><div className="divide-y divide-[#eceae7]">{services.map((service) => <article key={service._id} className="grid min-h-20 grid-cols-[minmax(13rem,1.2fr)_9rem_minmax(14rem,1.4fr)_8rem_8rem_6.5rem_4rem_5rem] items-center gap-4 px-6 py-4"><button type="button" onClick={() => onEdit(service)} className="min-w-0 text-left"><span className="flex items-center gap-2"><TruncatedText value={service.title} className="text-sm font-semibold text-[#292929] hover:text-primary-dark" />{service.featured && <FiZap className="shrink-0 text-amber-600" title="Featured" />}</span><TruncatedText value={service.shortDescription} className="mt-1 text-xs text-[#777]" /></button><span className="text-xs text-[#666]">{service.serviceType}</span><TruncatedText value={(service.features || []).join(' · ')} className="text-xs text-[#666]" emptyLabel="No items added" /><TruncatedText value={service.priceLabel} className="text-xs text-[#666]" emptyLabel="Not added" /><span className="inline-flex items-center gap-1.5 text-xs text-[#666]">{service.deliveryTime ? <><FiClock /> <TruncatedText value={service.deliveryTime} /></> : 'Not added'}</span><span className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(service.status)}`}>{service.status}</span><span className="text-center text-xs text-[#777]">{service.displayOrder || 0}</span><Actions service={service} onEdit={onEdit} onDelete={onDelete} /></article>)}</div></div></div>
    <div className="space-y-2 px-3 pb-3 md:hidden">{services.map((service) => <article key={service._id} className="rounded-md bg-[#f7f7f7] p-3.5"><div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-md bg-white text-primary-dark"><FiBriefcase /></span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><button type="button" onClick={() => onEdit(service)} className="min-w-0 text-left"><h2 className="truncate text-sm font-semibold">{service.title}</h2></button><span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${statusClass(service.status)}`}>{service.status}</span></div><p className="mt-1 line-clamp-2 text-xs leading-5 text-[#666]">{service.shortDescription}</p></div></div><div className="mt-3 flex flex-wrap gap-1.5"><span className="rounded bg-white px-2 py-1 text-[10px] text-[#666]">{service.serviceType}</span>{service.featured && <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-1 text-[10px] font-medium text-amber-700"><FiZap /> Featured</span>}</div>{(service.priceLabel || service.deliveryTime) && <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#666]">{service.priceLabel && <span>{service.priceLabel}</span>}{service.deliveryTime && <span className="inline-flex items-center gap-1"><FiClock /> {service.deliveryTime}</span>}</div>}{service.features?.length > 0 && <div className="mt-3 space-y-1">{service.features.slice(0, 3).map((feature) => <p key={feature} className="flex items-start gap-1.5 text-xs text-[#777]"><FiCheck className="mt-0.5 shrink-0 text-emerald-600" /> <span>{feature}</span></p>)}</div>}<div className="mt-3 flex justify-end"><Actions service={service} onEdit={onEdit} onDelete={onDelete} /></div></article>)}</div>
  </section>
}

function Actions({ service, onEdit, onDelete }) {
  return <div className="flex justify-end gap-1"><button type="button" onClick={() => onEdit(service)} className="grid size-9 place-items-center rounded-md text-[#777] hover:bg-[#f2f1ef] hover:text-[#222]" aria-label={`Edit ${service.title}`}><FiEdit2 /></button><button type="button" onClick={() => onDelete(service)} className="grid size-9 place-items-center rounded-md text-[#999] hover:bg-red-50 hover:text-red-600" aria-label={`Delete ${service.title}`}><FiTrash2 /></button></div>
}

export default Services
