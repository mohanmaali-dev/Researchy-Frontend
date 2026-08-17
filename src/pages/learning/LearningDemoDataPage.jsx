import { useState } from 'react'
import { FiArrowRight, FiCheckCircle, FiDatabase, FiInfo } from 'react-icons/fi'
import { Link } from 'react-router-dom'

import * as demoDataService from '../../services/demo-data.service.js'

const demoContents = [
  ['6', 'Learning Topics'],
  ['8', 'Learning Entries'],
  ['8', 'Resources'],
  ['5', 'Practice items'],
  ['6', 'Questions'],
]

function LearningDemoDataPage() {
  const [creating, setCreating] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleCreate = async () => {
    setCreating(true)
    setResult(null)
    setError('')
    try {
      const response = await demoDataService.createDemoLearningData()
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
            <p className="text-xs font-medium uppercase tracking-wider text-[#315f91]">Temporary page</p>
            <h1 className="mt-1.5 text-3xl tracking-[-0.035em] text-[#171717] sm:text-4xl">Learning demo data</h1>
            <p className="mt-2 text-sm leading-6 text-[#707070]">Add connected sample Learning records to understand Topics, Entries, Resources, Practice, Questions, and Takeaways.</p>
          </div>
          <button type="button" onClick={handleCreate} disabled={creating} className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"><FiDatabase aria-hidden="true" /> {creating ? 'Adding demo data...' : 'Add Learning demo data'}</button>
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-md bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800"><FiInfo className="mt-1 shrink-0" aria-hidden="true" /><p>This temporary tool adds records to the live database. Clicking again updates the same demo records instead of creating duplicates.</p></div>
        {error && <p role="alert" className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
        {result && (
          <div className="mt-4 rounded-md bg-emerald-50 p-4 text-emerald-800">
            <div className="flex items-start gap-3"><FiCheckCircle className="mt-0.5 shrink-0 text-lg" aria-hidden="true" /><div><p className="text-sm font-semibold">Learning demo data is ready</p><p className="mt-1 text-xs leading-5">Added or updated {result.topics} topics, {result.entries} entries, {result.resources} resources, {result.practiceItems} practice items, and {result.questions} questions.</p></div></div>
            <div className="ml-7 mt-3 flex flex-wrap gap-4"><Link to="/learning" className="inline-flex items-center gap-1.5 text-xs font-semibold hover:underline">Open Learning <FiArrowRight aria-hidden="true" /></Link><Link to="/learning/topics" className="inline-flex items-center gap-1.5 text-xs font-semibold hover:underline">View Topics <FiArrowRight aria-hidden="true" /></Link></div>
          </div>
        )}
      </section>

      <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="rounded-lg bg-white p-5 sm:p-7">
          <h2 className="text-lg font-semibold text-[#292929]">How to use it</h2>
          <ol className="mt-4 space-y-3 text-sm leading-6 text-[#666]"><li><span className="font-semibold text-[#333]">1.</span> Select Add Learning demo data.</li><li><span className="font-semibold text-[#333]">2.</span> Open Learning and explore the connected sample Topics.</li><li><span className="font-semibold text-[#333]">3.</span> Review Entries, Resources, Practice, and Questions inside each Topic.</li><li><span className="font-semibold text-[#333]">4.</span> Delete the demo records manually when you no longer need them.</li></ol>
        </section>
        <aside className="rounded-lg bg-white p-5 sm:p-6"><h2 className="text-base font-semibold text-[#292929]">What will be added</h2><dl className="mt-4 space-y-3">{demoContents.map(([count, label]) => <div key={label} className="flex items-center justify-between gap-4 border-b border-[#efedeb] pb-3 last:border-0 last:pb-0"><dt className="text-sm text-[#666]">{label}</dt><dd className="text-sm font-semibold text-[#292929]">{count}</dd></div>)}</dl></aside>
      </div>
    </main>
  )
}

export default LearningDemoDataPage
