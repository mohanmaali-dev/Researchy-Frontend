import { useCallback, useEffect, useMemo, useState } from 'react'
import { FiEdit2, FiEye, FiEyeOff, FiPlus, FiSave, FiStar, FiTrash2, FiX } from 'react-icons/fi'

import { ErrorState, LoadingState } from '../../components/businesses/PageState.jsx'
import PageHeader from '../../components/portfolio/PageHeader.jsx'
import BulkActions from '../../components/portfolio/BulkActions.jsx'
import ConfirmModal from '../../components/ui/ConfirmModal.jsx'
import { FORM_INPUT_CLASS, ServerError } from '../../components/ui/FormElements.jsx'
import { createPortfolioSkill, deletePortfolioSkill, getPortfolioSkills, updatePortfolioSkill } from '../../services/portfolio.service.js'
import { useBulkSelection } from '../../hooks/useBulkSelection.js'

const CATEGORIES = ['Frontend', 'Backend', 'Database', 'DevOps', 'AI & Automation', 'Tools', 'Other']
const EMPTY_SKILL = { name: '', category: 'Frontend', displayOrder: 0, visible: true }

function Skills() {
  const [skills, setSkills] = useState([])
  const [form, setForm] = useState(EMPTY_SKILL)
  const [editingId, setEditingId] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const bulk = useBulkSelection(skills)

  const loadSkills = useCallback(async () => { setLoading(true); setError(''); try { setSkills((await getPortfolioSkills()).data) } catch (requestError) { setError(requestError.message) } finally { setLoading(false) } }, [])
  useEffect(() => { loadSkills() }, [loadSkills])
  const groupedSkills = useMemo(() => CATEGORIES.map((category) => ({ category, items: skills.filter((skill) => skill.category === category) })).filter((group) => group.items.length), [skills])

  const openNew = () => { setEditingId(''); setForm(EMPTY_SKILL); setFormError(''); setShowForm(true) }
  const openEdit = (skill) => { setEditingId(skill._id); setForm({ name: skill.name, category: skill.category, displayOrder: skill.displayOrder || 0, visible: skill.visible !== false }); setFormError(''); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const closeForm = () => { setShowForm(false); setEditingId(''); setForm(EMPTY_SKILL); setFormError('') }
  const saveSkill = async (event) => {
    event.preventDefault()
    if (!form.name.trim()) { setFormError('Skill name is required'); return }
    setSaving(true); setFormError('')
    try { await (editingId ? updatePortfolioSkill(editingId, { ...form, displayOrder: Number(form.displayOrder) }) : createPortfolioSkill({ ...form, displayOrder: Number(form.displayOrder) })); closeForm(); await loadSkills() }
    catch (requestError) { setFormError(requestError.message) } finally { setSaving(false) }
  }
  const removeSkill = async () => { try { await deletePortfolioSkill(deleteTarget._id); setDeleteTarget(null); await loadSkills() } catch (requestError) { setError(requestError.message); setDeleteTarget(null) } }
  const toggleVisibility = async (skill) => { try { await updatePortfolioSkill(skill._id, { visible: skill.visible === false }); await loadSkills() } catch (requestError) { setError(requestError.message) } }

  if (loading) return <LoadingState label="Loading portfolio skills" />
  if (error && !skills.length) return <ErrorState message={error} onRetry={loadSkills} backTo="/portfolio" backLabel="Portfolio overview" />

  return (
    <div className="space-y-3">
      <PageHeader title="Skills" description="Organise the technologies shown in your portfolio."><button type="button" onClick={openNew} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"><FiPlus /> Add skill</button></PageHeader>
      {showForm && <form onSubmit={saveSkill} className="rounded-lg bg-white p-4 sm:p-6"><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold text-[#292929]">{editingId ? 'Edit skill' : 'Add skill'}</h2><p className="mt-1 text-xs text-[#888]">Keep the name short and choose the closest category.</p></div><button type="button" onClick={closeForm} className="grid size-9 place-items-center rounded-md bg-[#f5f5f5] text-[#777]" aria-label="Close skill form"><FiX /></button></div><div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_13rem_8rem_auto] sm:items-end"><label className="text-sm font-semibold text-[#555]">Skill name<input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className={FORM_INPUT_CLASS} placeholder="Enter technology or skill" autoFocus /></label><label className="text-sm font-semibold text-[#555]">Category<select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} className={FORM_INPUT_CLASS}>{CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></label><label className="text-sm font-semibold text-[#555]">Order<input type="number" min="0" max="9999" value={form.displayOrder} onChange={(event) => setForm((current) => ({ ...current, displayOrder: event.target.value }))} className={FORM_INPUT_CLASS} /></label><button type="submit" disabled={saving} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"><FiSave /> {saving ? 'Saving...' : 'Save skill'}</button></div><label className="mt-3 flex w-fit items-center gap-2 text-sm font-medium text-[#555]"><input type="checkbox" checked={form.visible} onChange={(event) => setForm((current) => ({ ...current, visible: event.target.checked }))} className="size-4 accent-[#f36b4c]" /> Show this skill publicly</label><ServerError message={formError} /></form>}

      <section className="rounded-lg bg-white p-4 sm:p-6">
        {skills.length > 0 && <div className="mb-4"><BulkActions entity="skills" label="skills" items={skills} getItemLabel={(item) => item.name} selected={bulk.selected} selectedIds={bulk.selectedIds} allSelected={bulk.allSelected} visibleCount={bulk.visibleCount} onToggle={bulk.toggle} onToggleAll={bulk.toggleAll} onClear={bulk.clear} onDeleted={loadSkills} /></div>}
        {error && <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        {!skills.length ? <div className="py-14 text-center"><span className="mx-auto grid size-12 place-items-center rounded-md bg-[#edf3f9] text-xl text-[#315f91]"><FiStar /></span><h2 className="mt-4 font-semibold">No skills yet</h2><p className="mt-1 text-sm text-[#888]">Add the technologies you want visitors to see.</p><button type="button" onClick={openNew} className="mt-4 text-sm font-semibold text-primary-dark">Add your first skill</button></div> : <div className="space-y-6">{groupedSkills.map(({ category, items }) => <div key={category}><div className="flex items-center justify-between border-b border-[#eceae7] pb-2"><h2 className="text-sm font-semibold text-[#444]">{category}</h2><span className="text-xs text-[#999]">{items.length}</span></div><div className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{items.map((skill) => <div key={skill._id} className={`group flex items-center gap-2 rounded-md px-3.5 py-3 ${skill.visible === false ? 'bg-[#f2f1ef] text-[#888]' : 'bg-[#f7f7f7]'}`}><span className="grid size-8 shrink-0 place-items-center rounded-md bg-white text-primary-dark"><FiStar /></span><span className="min-w-0 flex-1 truncate text-sm font-semibold">{skill.name}</span>{skill.visible === false && <span className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-[#777]">Hidden</span>}<span className="text-[10px] text-[#999]">#{skill.displayOrder || 0}</span><button type="button" onClick={() => toggleVisibility(skill)} className="grid size-8 place-items-center rounded-md text-[#777] hover:bg-white hover:text-[#222]" aria-label={`${skill.visible === false ? 'Show' : 'Hide'} ${skill.name}`} title={skill.visible === false ? 'Show publicly' : 'Hide publicly'}>{skill.visible === false ? <FiEye /> : <FiEyeOff />}</button><button type="button" onClick={() => openEdit(skill)} className="grid size-8 place-items-center rounded-md text-[#777] hover:bg-white hover:text-[#222]" aria-label={`Edit ${skill.name}`}><FiEdit2 /></button><button type="button" onClick={() => setDeleteTarget(skill)} className="grid size-8 place-items-center rounded-md text-[#999] hover:bg-red-50 hover:text-red-600" aria-label={`Delete ${skill.name}`}><FiTrash2 /></button></div>)}</div></div>)}</div>}
      </section>
      <ConfirmModal open={Boolean(deleteTarget)} title="Delete this skill?" message={`“${deleteTarget?.name || 'This skill'}” will be permanently removed.`} confirmLabel="Delete skill" onConfirm={removeSkill} onCancel={() => setDeleteTarget(null)} />
    </div>
  )
}

export default Skills
