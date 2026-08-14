const styles = {
  Pending: 'bg-amber-100 text-amber-800',
  Completed: 'bg-emerald-100 text-emerald-700',
  Cancelled: 'bg-slate-100 text-slate-600',
  Overdue: 'bg-red-100 text-red-700',
}

function FollowUpStatusBadge({ status, isOverdue = false }) {
  const label = isOverdue ? 'Overdue' : status

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${styles[label]}`}>
      {label}
    </span>
  )
}

export default FollowUpStatusBadge
