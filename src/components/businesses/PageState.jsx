import { FiAlertCircle } from 'react-icons/fi'
import { Link } from 'react-router-dom'

export function LoadingState({ label = 'Loading...' }) {
  return (
    <div className="grid min-h-64 place-items-center rounded-2xl bg-white">
      <div className="text-center">
        <div className="mx-auto size-9 animate-spin rounded-full border-4 border-primary-light border-t-primary" />
        <p className="mt-3 text-sm text-slate-500">{label}</p>
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
