import { useState } from 'react'
import { FiCheckSquare, FiList, FiTrash2, FiX } from 'react-icons/fi'

import { bulkDeletePortfolio } from '../../services/portfolio.service.js'
import ConfirmModal from '../ui/ConfirmModal.jsx'

export function SelectionCheckbox({ checked, onChange, label }) {
  return <input type="checkbox" checked={checked} onChange={onChange} aria-label={label} className="size-4 shrink-0 cursor-pointer accent-[#f36b4c]" />
}

function BulkActions({ entity, label, items = [], getItemLabel = (item) => item.title || item.name || 'Record', selected, selectedIds, allSelected, visibleCount, onToggle, onToggleAll, onClear, onDeleted }) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [choosing, setChoosing] = useState(false)
  const count = selectedIds.length

  const removeSelected = async () => {
    setDeleting(true); setError('')
    try { await bulkDeletePortfolio(entity, selectedIds); setConfirming(false); onClear(); await onDeleted() } catch (requestError) { setError(requestError.message); setConfirming(false) } finally { setDeleting(false) }
  }

  return <>
    <div className={`flex min-h-11 flex-wrap items-center gap-2 rounded-md px-3 py-2 transition ${count ? 'bg-[#fff0ec]' : 'bg-[#faf9f7]'}`}>
      <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-[#555]"><SelectionCheckbox checked={allSelected} onChange={onToggleAll} label={`Select all visible ${label}`} /> Select all <span className="font-normal text-[#999]">({visibleCount})</span></label><button type="button" onClick={() => setChoosing((current) => !current)} className="inline-flex min-h-8 items-center gap-1.5 rounded-md bg-white px-2.5 text-xs font-semibold text-[#666] hover:text-[#222]"><FiList /> Choose records</button>
      {count > 0 && <><span className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-primary-dark"><FiCheckSquare /> {count} selected</span><button type="button" onClick={onClear} className="grid size-8 place-items-center rounded-md text-[#777] hover:bg-white" aria-label="Clear selection"><FiX /></button><button type="button" onClick={() => setConfirming(true)} className="inline-flex min-h-8 items-center gap-1.5 rounded-md bg-red-600 px-3 text-xs font-semibold text-white hover:bg-red-700"><FiTrash2 /> Delete selected</button></>}
    </div>
    {choosing && <div className="mt-2 max-h-60 overflow-y-auto rounded-md border border-[#e7e3df] bg-white p-2 shadow-sm"><div className="grid gap-1 sm:grid-cols-2 xl:grid-cols-3">{items.map((item) => <label key={item._id} className="flex min-w-0 cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-xs text-[#555] hover:bg-[#f7f7f7]"><SelectionCheckbox checked={selected?.has(String(item._id)) || false} onChange={() => onToggle(item._id)} label={`Select ${getItemLabel(item)}`} /><span className="truncate">{getItemLabel(item)}</span></label>)}</div></div>}
    {error && <p role="alert" className="mt-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
    <ConfirmModal open={confirming} title={`Delete ${count} selected ${label}?`} message="These records will be permanently removed. This action cannot be undone." confirmLabel={`Delete ${count} records`} loading={deleting} onConfirm={removeSelected} onCancel={() => setConfirming(false)} />
  </>
}

export default BulkActions
