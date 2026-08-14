const statusStyles = {
  Prospect: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  Contacted: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  Visited: 'bg-purple-50 text-purple-700 ring-purple-600/20',
  Active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  Inactive: 'bg-slate-100 text-slate-600 ring-slate-500/20',
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
        statusStyles[status] || statusStyles.Inactive
      }`}
    >
      {status}
    </span>
  )
}

export default StatusBadge
