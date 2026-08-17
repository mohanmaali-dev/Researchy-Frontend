import { FiAlertTriangle, FiHome, FiRefreshCw } from 'react-icons/fi'
import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom'

function RouteErrorRecovery() {
  const error = useRouteError()
  const navigate = useNavigate()
  const message = isRouteErrorResponse(error)
    ? error.status === 404
      ? 'The page you requested could not be found.'
      : error.statusText || 'This page could not open.'
    : 'This page could not open. Your saved data is safe.'

  return (
    <main className="grid min-h-screen place-items-center bg-[#f2f2f1] p-4 text-[#242424]">
      <section role="alert" className="w-full max-w-lg rounded-lg bg-white p-6 text-center shadow-[0_16px_50px_rgba(30,30,30,0.09)] sm:p-8">
        <span className="mx-auto grid size-12 place-items-center rounded-lg bg-red-50 text-xl text-red-600"><FiAlertTriangle aria-hidden="true" /></span>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">We could not open this page</h1>
        <p className="mt-2 text-sm leading-6 text-[#666]">{message}</p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button type="button" onClick={() => window.location.reload()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"><FiRefreshCw aria-hidden="true" /> Reload page</button>
          <button type="button" onClick={() => navigate('/home', { replace: true })} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#f2f2f1] px-5 py-2.5 text-sm font-semibold text-[#444] hover:bg-[#e9e8e6]"><FiHome aria-hidden="true" /> Go to Home</button>
        </div>
      </section>
    </main>
  )
}

export default RouteErrorRecovery
