import { useState } from 'react'
import { FiArrowRight, FiCheckCircle, FiDatabase, FiInfo } from 'react-icons/fi'
import { Link } from 'react-router-dom'

import * as demoDataService from '../services/demo-data.service.js'

const demoContents = [
  ['8', 'Businesses'],
  ['8', 'Conversations'],
  ['8', 'Problems'],
  ['5', 'Opportunities'],
  ['7', 'Follow-ups'],
]

const steps = [
  'Select Add demo data below.',
  'The app creates connected sample records with “Demo” in each business name.',
  'Open the Dashboard and other Business pages to explore the complete workflow.',
  'Delete the demo records manually when you no longer need them.',
]

function DemoDataPage() {
  const [creating, setCreating] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleCreate = async () => {
    setCreating(true)
    setError('')

    try {
      const response = await demoDataService.createDemoData()
      setResult(response.data)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <main className="w-full px-1 pb-3 pt-1 sm:px-2">
      <section className="rounded-lg bg-white p-5 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-wider text-primary-dark">Temporary tool</p>
            <h1 className="mt-1.5 text-3xl tracking-[-0.035em] text-[#171717] sm:text-4xl">Demo data</h1>
            <p className="mt-2 text-sm leading-6 text-[#707070]">
              Add a complete set of sample Business records so you can see how every feature works together.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiDatabase aria-hidden="true" /> {creating ? 'Adding demo data...' : 'Add demo data'}
          </button>
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-md bg-amber-50 px-3.5 py-3 text-sm leading-6 text-amber-800 sm:px-4">
          <FiInfo className="mt-1 shrink-0" aria-hidden="true" />
          <p>
            This adds records to your live database. Clicking again will update the same demo records instead of creating duplicates.
          </p>
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}

        {result && (
          <div className="mt-4 rounded-md bg-emerald-50 p-4 text-emerald-800">
            <div className="flex items-start gap-3">
              <FiCheckCircle className="mt-0.5 shrink-0 text-lg" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold">Demo data is ready</p>
                <p className="mt-1 text-xs leading-5">
                  Added or updated {result.businesses} businesses, {result.conversations} conversations, {result.problems} problems, {result.opportunities} opportunities, and {result.followUps} follow-ups.
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-4 pl-7">
              <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-semibold hover:underline">Open Dashboard <FiArrowRight aria-hidden="true" /></Link>
              <Link to="/businesses" className="inline-flex items-center gap-1.5 text-xs font-semibold hover:underline">View Businesses <FiArrowRight aria-hidden="true" /></Link>
            </div>
          </div>
        )}
      </section>

      <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="rounded-lg bg-white p-5 sm:p-7">
          <h2 className="text-xl font-semibold text-[#292929]">How it works</h2>
          <div className="mt-5 space-y-4">
            {steps.map((step, index) => (
              <div key={step} className="flex items-start gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-md bg-primary-light text-xs font-semibold text-primary-dark">{index + 1}</span>
                <p className="pt-0.5 text-sm leading-6 text-[#5f5f5f]">{step}</p>
              </div>
            ))}
          </div>
        </section>

        <aside className="rounded-lg bg-white p-5 sm:p-6">
          <h2 className="text-base font-semibold text-[#292929]">What will be added</h2>
          <dl className="mt-4 space-y-3">
            {demoContents.map(([count, label]) => (
              <div key={label} className="flex items-center justify-between gap-4 border-b border-[#efedeb] pb-3 last:border-0 last:pb-0">
                <dt className="text-sm text-[#666]">{label}</dt>
                <dd className="text-sm font-semibold text-[#292929]">{count}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>
    </main>
  )
}

export default DemoDataPage
