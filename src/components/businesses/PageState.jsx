import { FiAlertCircle } from 'react-icons/fi'
import { Link } from 'react-router-dom'

export function LoadingState({ label = 'Loading...' }) {
  return (
    <div className="min-h-64 rounded-lg bg-white p-5 sm:p-6" role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      <div className="animate-pulse">
        <div className="h-4 w-28 rounded bg-[#e9e8e6]" />
        <div className="mt-3 h-8 w-3/5 max-w-sm rounded bg-[#e4e3e1]" />
        <div className="mt-3 h-3 w-4/5 max-w-xl rounded bg-[#efeeec]" />
        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => <div key={item} className="rounded-md bg-[#f5f4f2] p-4"><div className="h-9 w-9 rounded-md bg-[#e6e4e1]" /><div className="mt-4 h-4 w-2/3 rounded bg-[#e5e3e0]" /><div className="mt-2 h-3 w-full rounded bg-[#ebe9e6]" /><div className="mt-2 h-3 w-3/4 rounded bg-[#ebe9e6]" /></div>)}
        </div>
      </div>
    </div>
  )
}

export function ErrorState({ message, onRetry, backTo = '/businesses', backLabel = 'Go to businesses' }) {
  return (
    <div className="rounded-2xl bg-red-50/70 p-8 text-center">
      <FiAlertCircle className="mx-auto text-2xl text-red-500" aria-hidden="true" />
      <h2 className="mt-3 text-lg text-slate-800">Unable to load this page</h2>
      <p className="mt-1 text-sm font-normal text-red-600">{message || 'Please try again.'}</p>
      <div className="mt-5 flex justify-center gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Try again
          </button>
        )}
        <Link
          to={backTo}
          className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          {backLabel}
        </Link>
      </div>
    </div>
  )
}
