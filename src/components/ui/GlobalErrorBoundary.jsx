import { Component } from 'react'
import { FiAlertTriangle, FiHome, FiRefreshCw } from 'react-icons/fi'

class GlobalErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null, recoveryKey: 0 }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) console.error('Application render error', error, info)
  }

  retry = () => this.setState(({ recoveryKey }) => ({ error: null, recoveryKey: recoveryKey + 1 }))

  render() {
    if (!this.state.error) return <div key={this.state.recoveryKey}>{this.props.children}</div>

    return (
      <main className="grid min-h-screen place-items-center bg-[#f2f2f1] p-4 text-[#242424]">
        <section role="alert" className="w-full max-w-lg rounded-lg bg-white p-6 text-center shadow-[0_16px_50px_rgba(30,30,30,0.09)] sm:p-8">
          <span className="mx-auto grid size-12 place-items-center rounded-lg bg-red-50 text-xl text-red-600"><FiAlertTriangle aria-hidden="true" /></span>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight">This page could not open</h1>
          <p className="mt-2 text-sm leading-6 text-[#666]">Your data is safe. Try opening the page again, or return Home and continue from there.</p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button type="button" onClick={this.retry} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"><FiRefreshCw aria-hidden="true" /> Try again</button>
            <a href="/home" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#f2f2f1] px-5 py-2.5 text-sm font-semibold text-[#444] hover:bg-[#e9e8e6]"><FiHome aria-hidden="true" /> Go to Home</a>
          </div>
          <button type="button" onClick={() => window.location.reload()} className="mt-4 min-h-10 px-3 text-sm font-medium text-[#666] underline-offset-4 hover:text-[#222] hover:underline">Reload the application</button>
        </section>
      </main>
    )
  }
}

export default GlobalErrorBoundary
