import { useCallback, useEffect, useRef, useState } from 'react'
import { FiEdit2, FiImage, FiMessageSquare, FiPlus, FiSave, FiStar, FiTrash2, FiUploadCloud, FiX } from 'react-icons/fi'

import { ErrorState, LoadingState } from '../../components/businesses/PageState.jsx'
import PageHeader from '../../components/portfolio/PageHeader.jsx'
import BulkActions from '../../components/portfolio/BulkActions.jsx'
import ConfirmModal from '../../components/ui/ConfirmModal.jsx'
import { FORM_INPUT_CLASS, ServerError } from '../../components/ui/FormElements.jsx'
import TruncatedText from '../../components/ui/TruncatedText.jsx'
import { useBulkSelection } from '../../hooks/useBulkSelection.js'
import {
  createPortfolioTestimonial,
  deletePortfolioTestimonial,
  getPortfolioTestimonials,
  resolvePortfolioImageUrl,
  updatePortfolioTestimonial,
} from '../../services/portfolio.service.js'

const EMPTY_TESTIMONIAL = { personName: '', personRole: '', company: '', message: '', imageUrl: '', imageAction: 'keep', featured: false, status: 'Published', displayOrder: 0 }
const statusClass = (status) => status === 'Published' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'

function Testimonials() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState(EMPTY_TESTIMONIAL)
  const [editingId, setEditingId] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [imageError, setImageError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const imageInputRef = useRef(null)
  const bulk = useBulkSelection(items)

  const loadItems = useCallback(async () => {
    setLoading(true); setError('')
    try { setItems((await getPortfolioTestimonials()).data || []) } catch (requestError) { setError(requestError.message) } finally { setLoading(false) }
  }, [])
  useEffect(() => { loadItems() }, [loadItems])
  useEffect(() => () => { if (imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview) }, [imagePreview])

  const resetImage = () => { setImageFile(null); setImagePreview(''); setImageError(''); if (imageInputRef.current) imageInputRef.current.value = '' }
  const closeForm = () => { setShowForm(false); setEditingId(''); setForm(EMPTY_TESTIMONIAL); setFormError(''); resetImage() }
  const openNew = () => { setEditingId(''); setForm(EMPTY_TESTIMONIAL); setFormError(''); resetImage(); setShowForm(true) }
  const openEdit = (item) => { setEditingId(item._id); setForm({ ...EMPTY_TESTIMONIAL, ...item, imageAction: 'keep' }); setFormError(''); resetImage(); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const updateField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }))
  const chooseImage = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) { setImageError('Choose a JPG, PNG, WEBP, or GIF image'); event.target.value = ''; return }
    if (file.size > 5 * 1024 * 1024) { setImageError('Image cannot exceed 5 MB'); event.target.value = ''; return }
    setImageError(''); setImageFile(file); setImagePreview(URL.createObjectURL(file)); setForm((current) => ({ ...current, imageAction: 'replace' }))
  }
  const removeImage = () => { resetImage(); setForm((current) => ({ ...current, imageAction: current.imageUrl ? 'remove' : 'keep' })) }

  const saveItem = async (event) => {
    event.preventDefault()
    if (!form.personName.trim() || !form.message.trim()) { setFormError('Person name and testimonial message are required'); return }
    setSaving(true); setFormError('')
    try { await (editingId ? updatePortfolioTestimonial(editingId, { ...form, displayOrder: Number(form.displayOrder) || 0 }, imageFile) : createPortfolioTestimonial({ ...form, displayOrder: Number(form.displayOrder) || 0 }, imageFile)); closeForm(); await loadItems() } catch (requestError) { setFormError(requestError.message) } finally { setSaving(false) }
  }
  const removeItem = async () => {
    try { await deletePortfolioTestimonial(deleteTarget._id); setDeleteTarget(null); await loadItems() } catch (requestError) { setError(requestError.message); setDeleteTarget(null) }
  }

  if (loading) return <LoadingState label="Loading testimonials" />
  if (error && !items.length) return <ErrorState message={error} onRetry={loadItems} backTo="/portfolio" backLabel="Portfolio overview" />
  const previewUrl = imagePreview || (form.imageAction === 'keep' ? resolvePortfolioImageUrl(form.imageUrl) : '')

  return <div className="space-y-3">
    <PageHeader title="Testimonials" description="Manage recommendations and client feedback shown on your portfolio."><button type="button" onClick={openNew} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"><FiPlus /> Add testimonial</button></PageHeader>

    {showForm && <form onSubmit={saveItem} className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_18rem]">
      <section className="rounded-lg bg-white p-4 sm:p-6"><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold text-[#292929]">{editingId ? 'Edit testimonial' : 'Add testimonial'}</h2><p className="mt-1 text-xs text-[#888]">Add feedback exactly as you want visitors to read it.</p></div><button type="button" onClick={closeForm} className="grid size-9 place-items-center rounded-md bg-[#f5f5f5] text-[#777]" aria-label="Close testimonial form"><FiX /></button></div><div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-[#555]">Person name <span className="text-red-500">*</span><input value={form.personName} onChange={updateField('personName')} className={FORM_INPUT_CLASS} placeholder="Enter person name" maxLength="120" /></label>
        <label className="text-sm font-semibold text-[#555]">Role or designation<input value={form.personRole} onChange={updateField('personRole')} className={FORM_INPUT_CLASS} placeholder="Enter role or designation" maxLength="180" /></label>
        <label className="text-sm font-semibold text-[#555] sm:col-span-2">Company<input value={form.company} onChange={updateField('company')} className={FORM_INPUT_CLASS} placeholder="Enter company name" maxLength="180" /></label>
        <label className="text-sm font-semibold text-[#555] sm:col-span-2">Testimonial message <span className="text-red-500">*</span><textarea rows="7" value={form.message} onChange={updateField('message')} className={`${FORM_INPUT_CLASS} resize-y`} placeholder="Enter the testimonial message" maxLength="2000" /><span className="mt-1 block text-right text-xs font-normal text-[#999]">{form.message.length}/2000</span></label>
      </div><ServerError message={formError} /><div className="mt-5 flex justify-end"><button type="submit" disabled={saving} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60 sm:w-auto"><FiSave /> {saving ? 'Saving...' : 'Save testimonial'}</button></div></section>

      <aside className="space-y-3"><section className="rounded-lg bg-white p-4"><h2 className="text-sm font-semibold text-[#333]">Publishing</h2><div className="mt-4 space-y-4"><label className="block text-sm font-semibold text-[#555]">Status<select value={form.status} onChange={updateField('status')} className={FORM_INPUT_CLASS}><option>Published</option><option>Draft</option></select></label><label className="block text-sm font-semibold text-[#555]">Display order<input type="number" min="0" max="9999" value={form.displayOrder} onChange={updateField('displayOrder')} className={FORM_INPUT_CLASS} /></label><label className="flex items-start gap-3 rounded-md bg-[#faf9f7] p-3"><input type="checkbox" checked={form.featured} onChange={updateField('featured')} className="mt-0.5 size-4 accent-[#f36b4c]" /><span><span className="block text-sm font-semibold text-[#444]">Featured testimonial</span><span className="block text-xs leading-5 text-[#888]">Highlight this feedback publicly.</span></span></label></div></section>
      <section className="rounded-lg bg-white p-4"><h2 className="text-sm font-semibold text-[#333]">Person image</h2><p className="mt-1 text-xs text-[#888]">Optional · Maximum 5 MB</p>{previewUrl ? <div className="mt-3"><img src={previewUrl} alt="Person preview" className="mx-auto size-24 rounded-md border border-[#e4e1dd] object-cover" /><div className="mt-3 grid grid-cols-2 gap-2"><label className="inline-flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-[#ddd9d5] text-xs font-semibold text-[#555]"><FiUploadCloud /> Replace<input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={chooseImage} className="sr-only" /></label><button type="button" onClick={removeImage} className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-md bg-red-50 text-xs font-semibold text-red-600"><FiTrash2 /> Remove</button></div></div> : <label className="mt-3 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-[#d5d1cc] bg-[#faf9f7] text-center"><FiImage className="text-xl text-primary-dark" /><span className="mt-2 text-xs font-semibold text-[#555]">Choose image</span><input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={chooseImage} className="sr-only" /></label>}{imageError && <p className="mt-2 text-xs text-red-500">{imageError}</p>}</section></aside>
    </form>}

    {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
    {items.length > 0 && <section className="rounded-lg bg-white p-3 sm:px-6 sm:pt-4"><BulkActions entity="testimonials" label="testimonials" items={items} getItemLabel={(item) => item.personName} selected={bulk.selected} selectedIds={bulk.selectedIds} allSelected={bulk.allSelected} visibleCount={bulk.visibleCount} onToggle={bulk.toggle} onToggleAll={bulk.toggleAll} onClear={bulk.clear} onDeleted={loadItems} /></section>}
    <TestimonialList items={items} onAdd={openNew} onEdit={openEdit} onDelete={setDeleteTarget} />
    <ConfirmModal open={Boolean(deleteTarget)} title="Delete this testimonial?" message={`The testimonial from “${deleteTarget?.personName || 'this person'}” will be permanently removed.`} confirmLabel="Delete testimonial" onConfirm={removeItem} onCancel={() => setDeleteTarget(null)} />
  </div>
}

function TestimonialList({ items, onAdd, onEdit, onDelete }) {
  if (!items.length) return <section className="rounded-lg bg-white px-4 py-14 text-center"><span className="mx-auto grid size-12 place-items-center rounded-md bg-[#fff0ec] text-xl text-primary-dark"><FiMessageSquare /></span><h2 className="mt-4 font-semibold">No testimonials added</h2><p className="mt-1 text-sm text-[#888]">Add genuine feedback when it is ready for your portfolio.</p><button type="button" onClick={onAdd} className="mt-4 text-sm font-semibold text-primary-dark">Add testimonial</button></section>
  return <section className="overflow-hidden rounded-lg bg-white"><div className="px-4 py-4 sm:px-6"><h2 className="text-sm font-semibold text-[#292929]">Testimonial list</h2><p className="mt-0.5 text-xs text-[#888]">{items.length} {items.length === 1 ? 'testimonial' : 'testimonials'}</p></div><div className="hidden overflow-x-auto md:block"><div className="min-w-[960px]"><div className="grid grid-cols-[4rem_minmax(11rem,1fr)_minmax(10rem,1fr)_minmax(18rem,1.8fr)_6.5rem_6rem_4rem_5rem] gap-4 bg-[#faf9f7] px-6 py-3 text-[11px] font-medium uppercase tracking-wider text-[#999]"><span>Image</span><span>Person</span><span>Company</span><span>Message</span><span>Status</span><span>Featured</span><span>Order</span><span className="text-right">Actions</span></div><div className="divide-y divide-[#eceae7]">{items.map((item) => <article key={item._id} className="grid min-h-20 grid-cols-[4rem_minmax(11rem,1fr)_minmax(10rem,1fr)_minmax(18rem,1.8fr)_6.5rem_6rem_4rem_5rem] items-center gap-4 px-6 py-4">{item.imageUrl ? <img src={resolvePortfolioImageUrl(item.imageUrl)} alt="" className="size-11 rounded-md border border-[#e4e1dd] object-cover" /> : <span className="grid size-11 place-items-center rounded-md bg-[#f3f2f0] text-[#aaa]"><FiMessageSquare /></span>}<button type="button" onClick={() => onEdit(item)} className="min-w-0 text-left"><TruncatedText value={item.personName} className="text-sm font-semibold text-[#292929] hover:text-primary-dark" /><TruncatedText value={item.personRole} className="mt-1 text-xs text-[#777]" emptyLabel="No role added" /></button><TruncatedText value={item.company} className="text-sm text-[#666]" emptyLabel="Not added" /><TruncatedText value={item.message} className="text-sm text-[#666]" /><span className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(item.status)}`}>{item.status}</span>{item.featured ? <span className="inline-flex w-fit items-center gap-1 text-xs font-medium text-amber-700"><FiStar /> Yes</span> : <span className="text-xs text-[#999]">No</span>}<span className="text-center text-xs text-[#777]">{item.displayOrder || 0}</span><Actions item={item} onEdit={onEdit} onDelete={onDelete} /></article>)}</div></div></div><div className="space-y-2 px-3 pb-3 md:hidden">{items.map((item) => <article key={item._id} className="rounded-md bg-[#f7f7f7] p-3.5"><div className="flex items-start gap-3">{item.imageUrl ? <img src={resolvePortfolioImageUrl(item.imageUrl)} alt="" className="size-11 shrink-0 rounded-md border border-[#e4e1dd] object-cover" /> : <span className="grid size-11 shrink-0 place-items-center rounded-md bg-white text-primary-dark"><FiMessageSquare /></span>}<div className="min-w-0 flex-1"><div className="flex justify-between gap-2"><button type="button" onClick={() => onEdit(item)} className="min-w-0 text-left"><h2 className="truncate text-sm font-semibold">{item.personName}</h2></button><span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${statusClass(item.status)}`}>{item.status}</span></div><p className="mt-1 truncate text-xs text-[#777]">{[item.personRole, item.company].filter(Boolean).join(' · ') || 'No work information'}</p></div></div><p className="mt-3 line-clamp-4 text-xs leading-5 text-[#666]">“{item.message}”</p><div className="mt-3 flex items-center justify-between">{item.featured ? <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700"><FiStar /> Featured</span> : <span />}<Actions item={item} onEdit={onEdit} onDelete={onDelete} /></div></article>)}</div></section>
}

function Actions({ item, onEdit, onDelete }) {
  return <div className="flex justify-end gap-1"><button type="button" onClick={() => onEdit(item)} className="grid size-9 place-items-center rounded-md text-[#777] hover:bg-[#f2f1ef] hover:text-[#222]" aria-label={`Edit testimonial from ${item.personName}`}><FiEdit2 /></button><button type="button" onClick={() => onDelete(item)} className="grid size-9 place-items-center rounded-md text-[#999] hover:bg-red-50 hover:text-red-600" aria-label={`Delete testimonial from ${item.personName}`}><FiTrash2 /></button></div>
}

export default Testimonials
