const styles = {
  Active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  Inactive: 'bg-slate-100 text-slate-600 ring-slate-500/20',
}

function ContactStatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${styles[status] || styles.Inactive}`}>
      {status}
    </span>
  )
}

export default ContactStatusBadge
