import { FiChevronDown } from 'react-icons/fi'

function QuickStatusSelect({ value, options, onChange, saving = false, label = 'Status' }) {
  return (
    <label className="relative inline-flex min-w-36 items-center">
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} disabled={saving} className="h-10 w-full appearance-none rounded-md border border-[#d9d6d2] bg-white px-3 pr-8 text-xs font-semibold text-[#555] outline-none transition focus:border-primary disabled:opacity-60">
        {options.map((option) => <option key={option} value={option}>{saving && option === value ? 'Saving...' : option}</option>)}
      </select>
      <FiChevronDown className="pointer-events-none absolute right-2.5 text-[#777]" aria-hidden="true" />
    </label>
  )
}

export default QuickStatusSelect
