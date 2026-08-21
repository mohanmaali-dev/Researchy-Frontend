import { useCallback, useEffect, useState } from 'react'
import { FiAward, FiBookOpen, FiEdit2, FiExternalLink, FiHash, FiMapPin, FiPlus, FiSave, FiTrash2, FiX } from 'react-icons/fi'
import { useSearchParams } from 'react-router-dom'

import { ErrorState, LoadingState } from '../../components/businesses/PageState.jsx'
import PageHeader from '../../components/portfolio/PageHeader.jsx'
import BulkActions from '../../components/portfolio/BulkActions.jsx'
import ConfirmModal from '../../components/ui/ConfirmModal.jsx'
import CopyButton from '../../components/ui/CopyButton.jsx'
import { FORM_INPUT_CLASS, ServerError } from '../../components/ui/FormElements.jsx'
import TruncatedText from '../../components/ui/TruncatedText.jsx'
import { useBulkSelection } from '../../hooks/useBulkSelection.js'
import {
  createPortfolioCertification,
  createPortfolioEducation,
  deletePortfolioCertification,
  deletePortfolioEducation,
  getPortfolioCertifications,
  getPortfolioEducations,
  updatePortfolioCertification,
  updatePortfolioEducation,
} from '../../services/portfolio.service.js'

const EMPTY_EDUCATION = { institution: '', degree: '', fieldOfStudy: '', location: '', startDate: '', endDate: '', currentlyStudying: false, description: '', achievementsText: '', status: 'Published', displayOrder: 0 }
const EMPTY_CERTIFICATION = { name: '', issuingOrganization: '', issueDate: '', expirationDate: '', doesNotExpire: false, credentialId: '', credentialUrl: '', description: '', status: 'Published', displayOrder: 0 }
const statusClass = (status) => status === 'Published' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
const formatMonth = (value) => value ? new Date(`${value}-01T00:00:00Z`).toLocaleDateString(undefined, { month: 'short', year: 'numeric', timeZone: 'UTC' }) : ''

function Education() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') === 'certifications' ? 'certifications' : 'education'
  const [educations, setEducations] = useState([])
  const [certifications, setCertifications] = useState([])
  const [educationForm, setEducationForm] = useState(EMPTY_EDUCATION)
  const [certificationForm, setCertificationForm] = useState(EMPTY_CERTIFICATION)
  const [editingId, setEditingId] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const activeItems = activeTab === 'education' ? educations : certifications
  const bulk = useBulkSelection(activeItems)

  const loadRecords = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const [educationResult, certificationResult] = await Promise.all([getPortfolioEducations(), getPortfolioCertifications()])
      setEducations(educationResult.data || [])
      setCertifications(certificationResult.data || [])
    } catch (requestError) { setError(requestError.message) } finally { setLoading(false) }
  }, [])
  useEffect(() => { loadRecords() }, [loadRecords])

  const changeTab = (tab) => { setSearchParams(tab === 'certifications' ? { tab } : {}, { replace: true }); setShowForm(false); setEditingId(''); setFormError('') }
  const closeForm = () => { setShowForm(false); setEditingId(''); setFormError(''); setEducationForm(EMPTY_EDUCATION); setCertificationForm(EMPTY_CERTIFICATION) }
  const openNew = () => { setEditingId(''); setFormError(''); setEducationForm(EMPTY_EDUCATION); setCertificationForm(EMPTY_CERTIFICATION); setShowForm(true) }
  const editEducation = (item) => { setEditingId(item._id); setEducationForm({ ...EMPTY_EDUCATION, ...item, achievementsText: (item.achievements || []).join('\n') }); setFormError(''); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const editCertification = (item) => { setEditingId(item._id); setCertificationForm({ ...EMPTY_CERTIFICATION, ...item }); setFormError(''); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  const saveEducation = async (event) => {
    event.preventDefault()
    if (!educationForm.institution.trim() || !educationForm.degree.trim() || !educationForm.startDate) { setFormError('Institution, qualification, and start date are required'); return }
    setSaving(true); setFormError('')
    const data = { ...educationForm, achievements: educationForm.achievementsText.split('\n').map((item) => item.trim()).filter(Boolean), endDate: educationForm.currentlyStudying ? '' : educationForm.endDate, displayOrder: Number(educationForm.displayOrder) }
    delete data.achievementsText
    try { await (editingId ? updatePortfolioEducation(editingId, data) : createPortfolioEducation(data)); closeForm(); await loadRecords() } catch (requestError) { setFormError(requestError.message) } finally { setSaving(false) }
  }

  const saveCertification = async (event) => {
    event.preventDefault()
    if (!certificationForm.name.trim() || !certificationForm.issuingOrganization.trim() || !certificationForm.issueDate) { setFormError('Certification name, issuing organization, and issue date are required'); return }
    setSaving(true); setFormError('')
    const data = { ...certificationForm, expirationDate: certificationForm.doesNotExpire ? '' : certificationForm.expirationDate, displayOrder: Number(certificationForm.displayOrder) }
    try { await (editingId ? updatePortfolioCertification(editingId, data) : createPortfolioCertification(data)); closeForm(); await loadRecords() } catch (requestError) { setFormError(requestError.message) } finally { setSaving(false) }
  }

  const removeRecord = async () => {
    try {
      if (deleteTarget.type === 'education') await deletePortfolioEducation(deleteTarget.item._id)
      else await deletePortfolioCertification(deleteTarget.item._id)
      setDeleteTarget(null)
      await loadRecords()
    } catch (requestError) { setError(requestError.message); setDeleteTarget(null) }
  }

  if (loading) return <LoadingState label="Loading education and certifications" />
  if (error && !educations.length && !certifications.length) return <ErrorState message={error} onRetry={loadRecords} backTo="/portfolio" backLabel="Portfolio overview" />

  return <div className="space-y-3">
    <PageHeader title="Education & certifications" description="Manage qualifications and credentials shown on your portfolio."><button type="button" onClick={openNew} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"><FiPlus /> Add {activeTab === 'education' ? 'education' : 'certification'}</button></PageHeader>

    <section className="rounded-lg bg-white p-2 sm:p-3"><div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => changeTab('education')} className={`flex min-h-11 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold transition ${activeTab === 'education' ? 'bg-[#fff0ec] text-primary-dark' : 'text-[#666] hover:bg-[#f7f7f7]'}`}><FiBookOpen /> Education <span className="rounded-full bg-white px-2 py-0.5 text-[10px] text-[#777]">{educations.length}</span></button><button type="button" onClick={() => changeTab('certifications')} className={`flex min-h-11 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold transition ${activeTab === 'certifications' ? 'bg-[#fff0ec] text-primary-dark' : 'text-[#666] hover:bg-[#f7f7f7]'}`}><FiAward /> Certifications <span className="rounded-full bg-white px-2 py-0.5 text-[10px] text-[#777]">{certifications.length}</span></button></div></section>

    {showForm && activeTab === 'education' && <form onSubmit={saveEducation} className="rounded-lg bg-white p-4 sm:p-6"><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold text-[#292929]">{editingId ? 'Edit education' : 'Add education'}</h2><p className="mt-1 text-xs text-[#888]">Add one qualification or study record at a time.</p></div><button type="button" onClick={closeForm} className="grid size-9 place-items-center rounded-md bg-[#f5f5f5] text-[#777]" aria-label="Close education form"><FiX /></button></div><div className="mt-4 grid gap-4 sm:grid-cols-2">
      <label className="text-sm font-semibold text-[#555]">Institution <span className="text-red-500">*</span><input value={educationForm.institution} onChange={(event) => setEducationForm((current) => ({ ...current, institution: event.target.value }))} className={FORM_INPUT_CLASS} placeholder="Enter school, college, or university" /></label>
      <label className="text-sm font-semibold text-[#555]">Degree or qualification <span className="text-red-500">*</span><input value={educationForm.degree} onChange={(event) => setEducationForm((current) => ({ ...current, degree: event.target.value }))} className={FORM_INPUT_CLASS} placeholder="Enter degree or qualification" /></label>
      <label className="text-sm font-semibold text-[#555]">Field of study<input value={educationForm.fieldOfStudy} onChange={(event) => setEducationForm((current) => ({ ...current, fieldOfStudy: event.target.value }))} className={FORM_INPUT_CLASS} placeholder="Enter subject or specialisation" /></label>
      <label className="text-sm font-semibold text-[#555]">Location<input value={educationForm.location} onChange={(event) => setEducationForm((current) => ({ ...current, location: event.target.value }))} className={FORM_INPUT_CLASS} placeholder="City, state, country" /></label>
      <label className="text-sm font-semibold text-[#555]">Start date <span className="text-red-500">*</span><input type="month" value={educationForm.startDate} onClick={(event) => event.currentTarget.showPicker?.()} onChange={(event) => setEducationForm((current) => ({ ...current, startDate: event.target.value }))} className={FORM_INPUT_CLASS} /></label>
      <label className="text-sm font-semibold text-[#555]">End date<input type="month" value={educationForm.endDate} onClick={(event) => event.currentTarget.showPicker?.()} onChange={(event) => setEducationForm((current) => ({ ...current, endDate: event.target.value }))} disabled={educationForm.currentlyStudying} className={FORM_INPUT_CLASS} /></label>
      <label className="flex items-start gap-3 rounded-md bg-[#faf9f7] p-3 sm:col-span-2"><input type="checkbox" checked={educationForm.currentlyStudying} onChange={(event) => setEducationForm((current) => ({ ...current, currentlyStudying: event.target.checked }))} className="mt-0.5 size-4 accent-[#f36b4c]" /><span><span className="block text-sm font-semibold text-[#444]">I currently study here</span><span className="block text-xs text-[#888]">The public timeline will show “Present”.</span></span></label>
      <label className="text-sm font-semibold text-[#555]">Status<select value={educationForm.status} onChange={(event) => setEducationForm((current) => ({ ...current, status: event.target.value }))} className={FORM_INPUT_CLASS}><option>Published</option><option>Draft</option></select></label>
      <label className="text-sm font-semibold text-[#555]">Display order<input type="number" min="0" max="9999" value={educationForm.displayOrder} onChange={(event) => setEducationForm((current) => ({ ...current, displayOrder: event.target.value }))} className={FORM_INPUT_CLASS} /></label>
      <label className="text-sm font-semibold text-[#555] sm:col-span-2">Description<textarea rows="4" value={educationForm.description} onChange={(event) => setEducationForm((current) => ({ ...current, description: event.target.value }))} className={`${FORM_INPUT_CLASS} resize-y`} placeholder="Add relevant subjects or study details" /></label>
      <label className="text-sm font-semibold text-[#555] sm:col-span-2">Achievements<textarea rows="4" value={educationForm.achievementsText} onChange={(event) => setEducationForm((current) => ({ ...current, achievementsText: event.target.value }))} className={`${FORM_INPUT_CLASS} resize-y`} placeholder={'Add one achievement per line\nFor example: Graduated with distinction'} /><span className="mt-1 block text-xs font-normal text-[#999]">Add awards, strong results, leadership, or other important achievements.</span></label>
    </div><ServerError message={formError} /><div className="mt-5 flex justify-end"><button type="submit" disabled={saving} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60 sm:w-auto"><FiSave /> {saving ? 'Saving...' : 'Save education'}</button></div></form>}

    {showForm && activeTab === 'certifications' && <form onSubmit={saveCertification} className="rounded-lg bg-white p-4 sm:p-6"><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold text-[#292929]">{editingId ? 'Edit certification' : 'Add certification'}</h2><p className="mt-1 text-xs text-[#888]">Add one professional credential at a time.</p></div><button type="button" onClick={closeForm} className="grid size-9 place-items-center rounded-md bg-[#f5f5f5] text-[#777]" aria-label="Close certification form"><FiX /></button></div><div className="mt-4 grid gap-4 sm:grid-cols-2">
      <label className="text-sm font-semibold text-[#555]">Certification name <span className="text-red-500">*</span><input value={certificationForm.name} onChange={(event) => setCertificationForm((current) => ({ ...current, name: event.target.value }))} className={FORM_INPUT_CLASS} placeholder="Enter certification name" /></label>
      <label className="text-sm font-semibold text-[#555]">Issuing organization <span className="text-red-500">*</span><input value={certificationForm.issuingOrganization} onChange={(event) => setCertificationForm((current) => ({ ...current, issuingOrganization: event.target.value }))} className={FORM_INPUT_CLASS} placeholder="Enter issuing organization" /></label>
      <label className="text-sm font-semibold text-[#555]">Issue date <span className="text-red-500">*</span><input type="month" value={certificationForm.issueDate} onClick={(event) => event.currentTarget.showPicker?.()} onChange={(event) => setCertificationForm((current) => ({ ...current, issueDate: event.target.value }))} className={FORM_INPUT_CLASS} /></label>
      <label className="text-sm font-semibold text-[#555]">Expiration date<input type="month" value={certificationForm.expirationDate} onClick={(event) => event.currentTarget.showPicker?.()} onChange={(event) => setCertificationForm((current) => ({ ...current, expirationDate: event.target.value }))} disabled={certificationForm.doesNotExpire} className={FORM_INPUT_CLASS} /></label>
      <label className="flex items-start gap-3 rounded-md bg-[#faf9f7] p-3 sm:col-span-2"><input type="checkbox" checked={certificationForm.doesNotExpire} onChange={(event) => setCertificationForm((current) => ({ ...current, doesNotExpire: event.target.checked }))} className="mt-0.5 size-4 accent-[#f36b4c]" /><span><span className="block text-sm font-semibold text-[#444]">This certification does not expire</span><span className="block text-xs text-[#888]">No expiration date will be shown publicly.</span></span></label>
      <label className="text-sm font-semibold text-[#555]">Credential ID<input value={certificationForm.credentialId} onChange={(event) => setCertificationForm((current) => ({ ...current, credentialId: event.target.value }))} className={FORM_INPUT_CLASS} placeholder="Enter credential ID" /></label>
      <label className="text-sm font-semibold text-[#555]">Credential URL<input type="url" value={certificationForm.credentialUrl} onChange={(event) => setCertificationForm((current) => ({ ...current, credentialUrl: event.target.value }))} className={FORM_INPUT_CLASS} placeholder="Enter verification web address" /></label>
      <label className="text-sm font-semibold text-[#555]">Status<select value={certificationForm.status} onChange={(event) => setCertificationForm((current) => ({ ...current, status: event.target.value }))} className={FORM_INPUT_CLASS}><option>Published</option><option>Draft</option></select></label>
      <label className="text-sm font-semibold text-[#555]">Display order<input type="number" min="0" max="9999" value={certificationForm.displayOrder} onChange={(event) => setCertificationForm((current) => ({ ...current, displayOrder: event.target.value }))} className={FORM_INPUT_CLASS} /></label>
      <label className="text-sm font-semibold text-[#555] sm:col-span-2">Description<textarea rows="4" value={certificationForm.description} onChange={(event) => setCertificationForm((current) => ({ ...current, description: event.target.value }))} className={`${FORM_INPUT_CLASS} resize-y`} placeholder="Add useful details about this certification" /></label>
    </div><ServerError message={formError} /><div className="mt-5 flex justify-end"><button type="submit" disabled={saving} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60 sm:w-auto"><FiSave /> {saving ? 'Saving...' : 'Save certification'}</button></div></form>}

    {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
    {activeItems.length > 0 && <section className="rounded-lg bg-white p-3 sm:px-6 sm:pt-4"><BulkActions entity={activeTab === 'education' ? 'educations' : 'certifications'} label={activeTab === 'education' ? 'education records' : 'certifications'} items={activeItems} getItemLabel={(item) => activeTab === 'education' ? `${item.degree} at ${item.institution}` : item.name} selected={bulk.selected} selectedIds={bulk.selectedIds} allSelected={bulk.allSelected} visibleCount={bulk.visibleCount} onToggle={bulk.toggle} onToggleAll={bulk.toggleAll} onClear={bulk.clear} onDeleted={loadRecords} /></section>}
    {activeTab === 'education' ? <EducationList items={educations} onAdd={openNew} onEdit={editEducation} onDelete={(item) => setDeleteTarget({ type: 'education', item })} /> : <CertificationList items={certifications} onAdd={openNew} onEdit={editCertification} onDelete={(item) => setDeleteTarget({ type: 'certification', item })} />}

    <ConfirmModal open={Boolean(deleteTarget)} title={`Delete this ${deleteTarget?.type || 'record'}?`} message={deleteTarget?.type === 'education' ? `“${deleteTarget.item.degree}” at ${deleteTarget.item.institution} will be permanently removed.` : `“${deleteTarget?.item?.name || 'This certification'}” will be permanently removed.`} confirmLabel={`Delete ${deleteTarget?.type || 'record'}`} onConfirm={removeRecord} onCancel={() => setDeleteTarget(null)} />
  </div>
}

function EducationList({ items, onAdd, onEdit, onDelete }) {
  return <section className="overflow-hidden rounded-lg bg-white">{!items.length ? <EmptyState icon={FiBookOpen} title="No education added" description="Add a qualification when you want it shown on your portfolio." action="Add education" onAdd={onAdd} /> : <>
    <div className="px-4 py-4 sm:px-6"><h2 className="text-sm font-semibold text-[#292929]">Education history</h2><p className="mt-0.5 text-xs text-[#888]">{items.length} {items.length === 1 ? 'record' : 'records'}</p></div>
    <div className="hidden overflow-x-auto md:block"><div className="min-w-[1000px]"><div className="grid grid-cols-[minmax(14rem,1.4fr)_minmax(11rem,1fr)_9rem_minmax(10rem,1fr)_6.5rem_4rem_5rem] gap-4 bg-[#faf9f7] px-6 py-3 text-[11px] font-medium uppercase tracking-wider text-[#999]"><span>Qualification</span><span>Institution</span><span>Timeline</span><span>Location</span><span>Status</span><span>Order</span><span className="text-right">Actions</span></div><div className="divide-y divide-[#eceae7]">{items.map((item) => <article key={item._id} className="grid min-h-20 grid-cols-[minmax(14rem,1.4fr)_minmax(11rem,1fr)_9rem_minmax(10rem,1fr)_6.5rem_4rem_5rem] items-center gap-4 px-6 py-4"><button type="button" onClick={() => onEdit(item)} className="min-w-0 text-left"><TruncatedText value={item.degree} className="text-sm font-semibold text-[#292929] hover:text-primary-dark" /><TruncatedText value={item.fieldOfStudy} className="mt-1 text-xs text-[#777]" emptyLabel="No field added" />{item.achievements?.length > 0 && <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-amber-700"><FiAward /> {item.achievements.length} {item.achievements.length === 1 ? 'achievement' : 'achievements'}</span>}</button><TruncatedText value={item.institution} className="text-sm text-[#555]" /><span className="text-xs leading-5 text-[#666]">{formatMonth(item.startDate)}<br />to {item.currentlyStudying ? 'Present' : formatMonth(item.endDate) || 'Not set'}</span><span className="inline-flex min-w-0 items-center gap-1.5 text-xs text-[#666]">{item.location ? <><FiMapPin className="shrink-0" /><TruncatedText value={item.location} /></> : 'Not added'}</span><span className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(item.status)}`}>{item.status}</span><span className="text-center text-xs text-[#777]">{item.displayOrder || 0}</span><Actions item={item} onEdit={onEdit} onDelete={onDelete} /></article>)}</div></div></div>
    <div className="space-y-2 px-3 pb-3 md:hidden">{items.map((item) => <article key={item._id} className="rounded-md bg-[#f7f7f7] p-3.5"><div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-md bg-white text-primary-dark"><FiBookOpen /></span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><button type="button" onClick={() => onEdit(item)} className="min-w-0 text-left"><h2 className="truncate text-sm font-semibold">{item.degree}</h2></button><span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${statusClass(item.status)}`}>{item.status}</span></div><p className="mt-1 truncate text-xs text-[#666]">{item.institution}</p></div></div><p className="mt-3 text-xs text-[#777]">{formatMonth(item.startDate)} — {item.currentlyStudying ? 'Present' : formatMonth(item.endDate) || 'Not set'}</p>{item.fieldOfStudy && <p className="mt-2 text-xs text-[#666]">{item.fieldOfStudy}</p>}{item.achievements?.length > 0 && <div className="mt-3 rounded-md bg-white p-2.5"><p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-amber-700"><FiAward /> Achievements</p>{item.achievements.slice(0, 2).map((achievement) => <p key={achievement} className="mt-1.5 line-clamp-2 text-xs leading-5 text-[#666]">• {achievement}</p>)}{item.achievements.length > 2 && <p className="mt-1 text-[11px] text-[#999]">+{item.achievements.length - 2} more</p>}</div>}<div className="mt-3 flex justify-end"><Actions item={item} onEdit={onEdit} onDelete={onDelete} /></div></article>)}</div>
  </>}</section>
}

function CertificationList({ items, onAdd, onEdit, onDelete }) {
  return <section className="overflow-hidden rounded-lg bg-white">{!items.length ? <EmptyState icon={FiAward} title="No certifications added" description="Add professional credentials and verification details." action="Add certification" onAdd={onAdd} /> : <><div className="px-4 py-4 sm:px-6"><h2 className="text-sm font-semibold text-[#292929]">Certifications</h2><p className="mt-0.5 text-xs text-[#888]">{items.length} {items.length === 1 ? 'credential' : 'credentials'}</p></div><div className="hidden overflow-x-auto md:block"><div className="min-w-[1060px]"><div className="grid grid-cols-[minmax(14rem,1.4fr)_minmax(11rem,1fr)_8rem_9rem_minmax(10rem,1fr)_6.5rem_4rem_5rem] gap-4 bg-[#faf9f7] px-6 py-3 text-[11px] font-medium uppercase tracking-wider text-[#999]"><span>Certification</span><span>Organization</span><span>Issued</span><span>Expiration</span><span>Credential</span><span>Status</span><span>Order</span><span className="text-right">Actions</span></div><div className="divide-y divide-[#eceae7]">{items.map((item) => <article key={item._id} className="grid min-h-20 grid-cols-[minmax(14rem,1.4fr)_minmax(11rem,1fr)_8rem_9rem_minmax(10rem,1fr)_6.5rem_4rem_5rem] items-center gap-4 px-6 py-4"><button type="button" onClick={() => onEdit(item)} className="min-w-0 text-left"><TruncatedText value={item.name} className="text-sm font-semibold text-[#292929] hover:text-primary-dark" /><TruncatedText value={item.description} className="mt-1 text-xs text-[#777]" emptyLabel="No description" /></button><TruncatedText value={item.issuingOrganization} className="text-sm text-[#555]" /><span className="text-xs text-[#666]">{formatMonth(item.issueDate)}</span><span className="text-xs text-[#666]">{item.doesNotExpire ? 'No expiry' : formatMonth(item.expirationDate) || 'Not set'}</span><div className="min-w-0">{item.credentialId && <span className="flex min-w-0 items-center gap-1 text-xs text-[#666]"><FiHash /><TruncatedText value={item.credentialId} /></span>}{item.credentialUrl && <span className="mt-1 flex items-center gap-1"><a href={item.credentialUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-primary-dark"><FiExternalLink /> Open</a><CopyButton value={item.credentialUrl} label="Copy credential URL" className="size-7" /></span>}{!item.credentialId && !item.credentialUrl && <span className="text-xs text-[#aaa]">Not added</span>}</div><span className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(item.status)}`}>{item.status}</span><span className="text-center text-xs text-[#777]">{item.displayOrder || 0}</span><Actions item={item} onEdit={onEdit} onDelete={onDelete} /></article>)}</div></div></div><div className="space-y-2 px-3 pb-3 md:hidden">{items.map((item) => <article key={item._id} className="rounded-md bg-[#f7f7f7] p-3.5"><div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-md bg-white text-amber-600"><FiAward /></span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><button type="button" onClick={() => onEdit(item)} className="min-w-0 text-left"><h2 className="truncate text-sm font-semibold">{item.name}</h2></button><span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${statusClass(item.status)}`}>{item.status}</span></div><p className="mt-1 truncate text-xs text-[#666]">{item.issuingOrganization}</p></div></div><p className="mt-3 text-xs text-[#777]">Issued {formatMonth(item.issueDate)} · {item.doesNotExpire ? 'No expiry' : `Expires ${formatMonth(item.expirationDate) || 'not set'}`}</p>{item.credentialUrl && <div className="mt-2 flex items-center gap-1"><a href={item.credentialUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-8 items-center gap-1 rounded-md bg-white px-2 text-xs font-semibold text-primary-dark"><FiExternalLink /> Open credential</a><CopyButton value={item.credentialUrl} label="Copy credential URL" className="size-8" /></div>}<div className="mt-3 flex justify-end"><Actions item={item} onEdit={onEdit} onDelete={onDelete} /></div></article>)}</div></>}</section>
}

function EmptyState({ icon: Icon, title, description, action, onAdd }) {
  return <div className="px-4 py-14 text-center"><span className="mx-auto grid size-12 place-items-center rounded-md bg-[#fff0ec] text-xl text-primary-dark"><Icon /></span><h2 className="mt-4 font-semibold">{title}</h2><p className="mt-1 text-sm text-[#888]">{description}</p><button type="button" onClick={onAdd} className="mt-4 text-sm font-semibold text-primary-dark">{action}</button></div>
}

function Actions({ item, onEdit, onDelete }) {
  return <div className="flex justify-end gap-1"><button type="button" onClick={() => onEdit(item)} className="grid size-9 place-items-center rounded-md text-[#777] hover:bg-[#f2f1ef] hover:text-[#222]" aria-label="Edit record"><FiEdit2 /></button><button type="button" onClick={() => onDelete(item)} className="grid size-9 place-items-center rounded-md text-[#999] hover:bg-red-50 hover:text-red-600" aria-label="Delete record"><FiTrash2 /></button></div>
}

export default Education
