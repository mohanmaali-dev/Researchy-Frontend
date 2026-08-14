const validationStyles = {
  'Not Validated': 'bg-slate-100 text-slate-600 ring-slate-500/20',
  Researching: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  Validated: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  Rejected: 'bg-red-50 text-red-700 ring-red-600/20',
}

export function ValidationBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
        validationStyles[status] || validationStyles['Not Validated']
      }`}
    >
      {status}
    </span>
  )
}

export function ScoreBadge({ score, large = false }) {
  const color = score >= 75 ? 'bg-emerald-50 text-emerald-700' : score >= 50 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'

  return (
    <span className={`inline-flex items-baseline rounded-xl font-bold ${color} ${large ? 'px-4 py-2 text-3xl' : 'px-3 py-1.5 text-base'}`}>
      {score}<span className={large ? 'ml-1 text-sm' : 'ml-0.5 text-xs'}>/100</span>
    </span>
  )
}
