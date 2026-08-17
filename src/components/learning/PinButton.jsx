import { PiPushPin, PiPushPinFill } from 'react-icons/pi'

function PinButton({ pinned, onClick, saving = false, compact = false }) {
  return (
    <button type="button" onClick={onClick} disabled={saving} aria-pressed={pinned} className={`inline-flex items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${pinned ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-[#f2f2f1] text-[#555] hover:bg-[#e8e7e5]'}`} title={pinned ? 'Remove from pinned items' : 'Pin for quick access'}>
      {pinned ? <PiPushPinFill aria-hidden="true" /> : <PiPushPin aria-hidden="true" />} {!compact && (saving ? 'Saving...' : pinned ? 'Pinned' : 'Pin')}
    </button>
  )
}

export default PinButton
