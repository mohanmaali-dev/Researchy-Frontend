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

export function TableLoadingState({
  label = 'Loading...',
  headers,
  template,
  rows = 6,
  minWidth = '760px',
  desktopClassName = 'hidden md:block',
  mobileClassName = 'space-y-3 md:hidden',
  cellVariants = [],
}) {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">{label}</span>

      <div className={`${desktopClassName} overflow-x-auto rounded-md bg-[#fafafa]`}>
        <div style={{ minWidth }}>
          <div
            className="grid items-center gap-4 px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-[#999]"
            style={{ gridTemplateColumns: template }}
          >
            {headers.map((header, index) => <span key={`${header}-${index}`}>{header}</span>)}
          </div>
          <div className="divide-y divide-[#ededeb]">
            {Array.from({ length: rows }, (_, rowIndex) => (
              <div
                key={rowIndex}
                className="grid animate-pulse items-center gap-4 bg-white px-5 py-[1.125rem] motion-reduce:animate-none"
                style={{ gridTemplateColumns: template }}
              >
                {headers.map((header, columnIndex) => {
                  const variant = cellVariants[columnIndex] || 'line'
                  return (
                    <span
                      key={`${header}-${columnIndex}`}
                      className={`block bg-[#e9e8e6] ${variant === 'pill' ? 'h-6 w-16 rounded-full' : variant === 'icon' ? 'size-4 justify-self-end rounded' : 'h-3.5 rounded'}`}
                      style={variant === 'line' ? { width: `${58 + ((rowIndex + columnIndex) % 4) * 9}%` } : undefined}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={mobileClassName}>
        {Array.from({ length: Math.min(rows, 5) }, (_, rowIndex) => (
          <div key={rowIndex} className="animate-pulse rounded-md bg-[#f7f7f7] p-4 motion-reduce:animate-none">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="h-4 rounded bg-[#e3e2df]" style={{ width: `${58 + (rowIndex % 3) * 12}%` }} />
                <div className="mt-2.5 h-3 w-2/5 rounded bg-[#e9e8e6]" />
              </div>
              <div className="h-6 w-16 rounded-full bg-[#e5e4e1]" />
            </div>
            <div className="mt-4 flex gap-3">
              <div className="h-3 w-1/3 rounded bg-[#e9e8e6]" />
              <div className="h-3 w-1/4 rounded bg-[#e9e8e6]" />
            </div>
          </div>
        ))}
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
