import { FiAlertCircle } from 'react-icons/fi'
import { Link } from 'react-router-dom'

export function LoadingState({ label = 'Loading...' }) {
  return (
    <div className="grid min-h-72 place-items-center rounded-2xl border border-slate-200 bg-white">
      <div className="text-center">
        <div className="mx-auto size-9 animate-spin rounded-full border-4 border-primary-light border-t-primary" />
        <p className="mt-3 text-sm text-slate-500">{label}</p>
      </div>
    </div>
  )
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
      <FiAlertCircle className="mx-auto text-3xl text-red-500" aria-hidden="true" />
      <h2 className="mt-3 text-lg font-bold text-red-900">We couldn't load this page</h2>
      <p className="mt-1 text-sm text-red-700">{message || 'Please try again.'}</p>
      <div className="mt-5 flex justify-center gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
          >
            Try again
          </button>
        )}
        <Link
          to="/businesses"
          className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700"
        >
          Go to businesses
        </Link>
      </div>
    </div>
  )
}
