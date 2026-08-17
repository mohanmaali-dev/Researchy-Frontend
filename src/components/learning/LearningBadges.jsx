const statusStyles = {
  'Want to Learn': 'bg-slate-100 text-slate-600', Learning: 'bg-blue-50 text-blue-700', Learned: 'bg-emerald-50 text-emerald-700',
  Saved: 'bg-slate-100 text-slate-600', 'In Progress': 'bg-amber-50 text-amber-700', Completed: 'bg-emerald-50 text-emerald-700',
  Planned: 'bg-blue-50 text-blue-700', Unanswered: 'bg-red-50 text-red-700', 'Partially Understood': 'bg-amber-50 text-amber-700', Answered: 'bg-emerald-50 text-emerald-700',
}
const priorityStyles = { Low: 'bg-slate-100 text-slate-600', Medium: 'bg-amber-50 text-amber-700', High: 'bg-red-50 text-red-700' }

export function LearningStatusBadge({ status }) { return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[status] || 'bg-slate-100 text-slate-600'}`}>{status}</span> }
export function PriorityBadge({ priority }) { return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${priorityStyles[priority] || priorityStyles.Low}`}>{priority}</span> }
