import { useCallback, useEffect, useState } from 'react'
import { FiBriefcase, FiEdit2, FiMapPin, FiPlus, FiSave, FiTrash2, FiX } from 'react-icons/fi'

import { ErrorState, LoadingState } from '../../components/businesses/PageState.jsx'
import PageHeader from '../../components/portfolio/PageHeader.jsx'
import ConfirmModal from '../../components/ui/ConfirmModal.jsx'
import { FORM_INPUT_CLASS, ServerError } from '../../components/ui/FormElements.jsx'
import TruncatedText from '../../components/ui/TruncatedText.jsx'
import { createPortfolioExperience, deletePortfolioExperience, getPortfolioExperiences, updatePortfolioExperience } from '../../services/portfolio.service.js'

const EMPTY_EXPERIENCE = { company: '', position: '', location: '', startDate: '', endDate: '', currentlyWorking: false, description: '', status: 'Published', displayOrder: 0 }
const formatMonth = (value) => value ? new Date(`${value}-01T00:00:00Z`).toLocaleDateString(undefined, { month: 'short', year: 'numeric', timeZone: 'UTC' }) : ''

function Experience() {
  const [experiences, setExperiences] = useState([])
  const [form, setForm] = useState(EMPTY_EXPERIENCE)
  const [editingId, setEditingId] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const loadExperiences = useCallback(async () => { setLoading(true); setError(''); try { setExperiences((await getPortfolioExperiences()).data) } catch (requestError) { setError(requestError.message) } finally { setLoading(false) } }, [])
  useEffect(() => { loadExperiences() }, [loadExperiences])
  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }))
  const openNew = () => { setEditingId(''); setForm(EMPTY_EXPERIENCE); setFormError(''); setShowForm(true) }
  const openEdit = (item) => { setEditingId(item._id); setForm({ ...EMPTY_EXPERIENCE, ...item }); setFormError(''); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const closeForm = () => { setShowForm(false); setEditingId(''); setForm(EMPTY_EXPERIENCE); setFormError('') }
  const saveExperience = async (event) => {
    event.preventDefault()
    if (!form.company.trim() || !form.position.trim() || !form.startDate) { setFormError('Company, position, and start date are required'); return }
    setSaving(true); setFormError('')
    const data = { ...form, endDate: form.currentlyWorking ? '' : form.endDate, displayOrder: Number(form.displayOrder) }
    try { await (editingId ? updatePortfolioExperience(editingId, data) : createPortfolioExperience(data)); closeForm(); await loadExperiences() }
    catch (requestError) { setFormError(requestError.message) } finally { setSaving(false) }
  }
  const removeExperience = async () => { try { await deletePortfolioExperience(deleteTarget._id); setDeleteTarget(null); await loadExperiences() } catch (requestError) { setError(requestError.message); setDeleteTarget(null) } }

  if (loading) return <LoadingState label="Loading portfolio experience" />
  if (error && !experiences.length) return <ErrorState message={error} onRetry={loadExperiences} backTo="/portfolio" backLabel="Portfolio overview" />

  return (
    <div className="space-y-3">
      <PageHeader title="Experience" description="Manage the work history shown on your portfolio."><button type="button" onClick={openNew} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"><FiPlus /> Add experience</button></PageHeader>
      {showForm && <form onSubmit={saveExperience} className="rounded-lg bg-white p-4 sm:p-6"><div className="flex items-start justify-between"><div><h2 className="font-semibold text-[#292929]">{editingId ? 'Edit experience' : 'Add experience'}</h2><p className="mt-1 text-xs text-[#888]">Add one role or company at a time.</p></div><button type="button" onClick={closeForm} className="grid size-9 place-items-center rounded-md bg-[#f5f5f5] text-[#777]" aria-label="Close experience form"><FiX /></button></div><div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-[#555]">Company <span className="text-red-500">*</span><input value={form.company} onChange={(event) => setField('company', event.target.value)} className={FORM_INPUT_CLASS} placeholder="Enter company name" /></label>
        <label className="text-sm font-semibold text-[#555]">Position <span className="text-red-500">*</span><input value={form.position} onChange={(event) => setField('position', event.target.value)} className={FORM_INPUT_CLASS} placeholder="Enter role or position" /></label>
        <label className="text-sm font-semibold text-[#555]">Location<input value={form.location} onChange={(event) => setField('location', event.target.value)} className={FORM_INPUT_CLASS} placeholder="Enter work location" /></label>
        <label className="text-sm font-semibold text-[#555]">Status<select value={form.status} onChange={(event) => setField('status', event.target.value)} className={FORM_INPUT_CLASS}><option>Published</option><option>Draft</option></select></label>
        <label className="text-sm font-semibold text-[#555]">Start date <span className="text-red-500">*</span><input type="month" value={form.startDate} onClick={(event) => event.currentTarget.showPicker?.()} onChange={(event) => setField('startDate', event.target.value)} className={FORM_INPUT_CLASS} /></label>
        <label className="text-sm font-semibold text-[#555]">End date<input type="month" value={form.endDate} onClick={(event) => event.currentTarget.showPicker?.()} onChange={(event) => setField('endDate', event.target.value)} disabled={form.currentlyWorking} className={FORM_INPUT_CLASS} /></label>
        <label className="flex items-start gap-3 rounded-md bg-[#faf9f7] p-3 sm:col-span-2"><input type="checkbox" checked={form.currentlyWorking} onChange={(event) => setField('currentlyWorking', event.target.checked)} className="mt-0.5 size-4 accent-[#f36b4c]" /><span><span className="block text-sm font-semibold text-[#444]">I currently work here</span><span className="block text-xs text-[#888]">The public timeline will show “Present”.</span></span></label>
        <label className="text-sm font-semibold text-[#555] sm:col-span-2">Description<textarea rows="5" value={form.description} onChange={(event) => setField('description', event.target.value)} className={`${FORM_INPUT_CLASS} resize-y`} placeholder="Describe your responsibilities, results, and important work" /></label>
        <label className="text-sm font-semibold text-[#555]">Display order<input type="number" min="0" max="9999" value={form.displayOrder} onChange={(event) => setField('displayOrder', event.target.value)} className={FORM_INPUT_CLASS} /></label>
      </div><ServerError message={formError} /><div className="mt-5 flex justify-end"><button type="submit" disabled={saving} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60 sm:w-auto"><FiSave /> {saving ? 'Saving...' : 'Save experience'}</button></div></form>}

      <section className="overflow-hidden rounded-lg bg-white">
        {error && <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        {!experiences.length ? <div className="px-4 py-14 text-center sm:px-6"><span className="mx-auto grid size-12 place-items-center rounded-md bg-[#edf5f0] text-xl text-[#2f684f]"><FiBriefcase /></span><h2 className="mt-4 font-semibold">No experience added</h2><p className="mt-1 text-sm text-[#888]">Add a role when you want it shown on your portfolio.</p><button type="button" onClick={openNew} className="mt-4 text-sm font-semibold text-primary-dark">Add your first experience</button></div> : <>
          <div className="flex items-center justify-between px-4 py-4 sm:px-6">
            <div>
              <h2 className="text-sm font-semibold text-[#292929]">Work history</h2>
              <p className="mt-0.5 text-xs text-[#888]">{experiences.length} {experiences.length === 1 ? 'experience' : 'experiences'} on your portfolio</p>
            </div>
          </div>

          <div className="hidden overflow-x-auto md:block">
            <div className="min-w-[1040px]">
              <div className="grid grid-cols-[minmax(12rem,1.45fr)_minmax(10rem,1fr)_minmax(8rem,.85fr)_minmax(13rem,1.5fr)_6.5rem_4rem_5rem] items-center gap-4 bg-[#faf9f7] px-6 py-3 text-[11px] font-medium uppercase tracking-wider text-[#999]">
                <span>Role and company</span>
                <span>Timeline</span>
                <span>Location</span>
                <span>Description</span>
                <span>Status</span>
                <span>Order</span>
                <span className="text-right">Actions</span>
              </div>
              <div className="divide-y divide-[#eceae7]">
                {experiences.map((item) => <article key={item._id} className="grid min-h-20 grid-cols-[minmax(12rem,1.45fr)_minmax(10rem,1fr)_minmax(8rem,.85fr)_minmax(13rem,1.5fr)_6.5rem_4rem_5rem] items-center gap-4 px-6 py-4 transition hover:bg-[#fdfcfb]">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-md bg-[#edf5f0] text-[#2f684f]"><FiBriefcase aria-hidden="true" /></span>
                    <div className="min-w-0">
                      <button type="button" onClick={() => openEdit(item)} className="block w-full min-w-0 text-left outline-none">
                        <TruncatedText value={item.position} className="text-sm font-semibold text-[#292929] transition hover:text-primary-dark focus-visible:text-primary-dark" />
                      </button>
                      <TruncatedText value={item.company} className="mt-1 text-xs font-medium text-[#666]" />
                    </div>
                  </div>
                  <div className="min-w-0 text-xs text-[#666]">
                    <p className="font-medium text-[#444]">{formatMonth(item.startDate)}</p>
                    <p className="mt-1 text-[#888]">to {item.currentlyWorking ? <span className="font-semibold text-emerald-700">Present</span> : formatMonth(item.endDate) || 'Not set'}</p>
                  </div>
                  <span className="inline-flex min-w-0 items-center gap-1.5 text-xs text-[#666]">{item.location ? <><FiMapPin className="shrink-0 text-[#999]" aria-hidden="true" /><TruncatedText value={item.location} /></> : <span className="text-[#aaa]">Not added</span>}</span>
                  <TruncatedText value={item.description} className="text-sm text-[#666]" emptyLabel="No description" />
                  <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${item.status === 'Published' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{item.status}</span>
                  <span className="text-center text-xs font-medium text-[#666]">{item.displayOrder ?? 0}</span>
                  <div className="flex justify-end gap-1">
                    <button type="button" onClick={() => openEdit(item)} className="grid size-9 place-items-center rounded-md text-[#777] transition hover:bg-[#f2f1ef] hover:text-[#222]" aria-label={`Edit ${item.position}`} title="Edit experience"><FiEdit2 /></button>
                    <button type="button" onClick={() => setDeleteTarget(item)} className="grid size-9 place-items-center rounded-md text-[#999] transition hover:bg-red-50 hover:text-red-600" aria-label={`Delete ${item.position}`} title="Delete experience"><FiTrash2 /></button>
                  </div>
                </article>)}
              </div>
            </div>
          </div>

          <div className="space-y-2 px-3 pb-3 md:hidden">
            {experiences.map((item) => <article key={item._id} className="rounded-md bg-[#f7f7f7] p-3.5">
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-md bg-white text-[#2f684f]"><FiBriefcase aria-hidden="true" /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <button type="button" onClick={() => openEdit(item)} className="min-w-0 text-left">
                      <h2 className="truncate text-sm font-semibold text-[#292929]">{item.position}</h2>
                    </button>
                    <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${item.status === 'Published' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{item.status}</span>
                  </div>
                  <p className="mt-1 truncate text-xs font-medium text-[#666]">{item.company}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#777]">
                <span>{formatMonth(item.startDate)} — {item.currentlyWorking ? <span className="font-semibold text-emerald-700">Present</span> : formatMonth(item.endDate) || 'Not set'}</span>
                {item.location && <span className="inline-flex min-w-0 items-center gap-1"><FiMapPin className="shrink-0" aria-hidden="true" /><span className="truncate">{item.location}</span></span>}
              </div>
              {item.description && <p className="mt-3 line-clamp-2 text-xs leading-5 text-[#666]">{item.description}</p>}
              <div className="mt-3 flex items-center justify-between border-t border-[#e8e5e1] pt-2">
                <span className="text-[11px] text-[#999]">Display order: {item.displayOrder ?? 0}</span>
                <div className="flex gap-1">
                  <button type="button" onClick={() => openEdit(item)} className="grid size-9 place-items-center rounded-md text-[#666] hover:bg-white" aria-label={`Edit ${item.position}`}><FiEdit2 /></button>
                  <button type="button" onClick={() => setDeleteTarget(item)} className="grid size-9 place-items-center rounded-md text-red-500 hover:bg-red-50" aria-label={`Delete ${item.position}`}><FiTrash2 /></button>
                </div>
              </div>
            </article>)}
          </div>
        </>}
      </section>
      <ConfirmModal open={Boolean(deleteTarget)} title="Delete this experience?" message={`The ${deleteTarget?.position || 'experience'} record will be permanently removed.`} confirmLabel="Delete experience" onConfirm={removeExperience} onCancel={() => setDeleteTarget(null)} />
    </div>
  )
}

export default Experience
