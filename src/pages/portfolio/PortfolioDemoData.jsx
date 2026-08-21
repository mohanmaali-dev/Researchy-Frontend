import { useState } from 'react'
import { FiArrowRight, FiCheckCircle, FiDatabase, FiInfo, FiShield } from 'react-icons/fi'
import { Link } from 'react-router-dom'

import PageHeader from '../../components/portfolio/PageHeader.jsx'
import { createDemoPortfolioData } from '../../services/demo-data.service.js'

const contents = [
  ['1', 'Profile'], ['10', 'Projects'], ['10', 'Skills'], ['10', 'Experience records'],
  ['10', 'Education records'], ['10', 'Certifications'], ['10', 'Services'], ['10', 'Testimonials'],
]

function PortfolioDemoData() {
  const [creating, setCreating] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const createData = async () => {
    setCreating(true); setResult(null); setError('')
    try { setResult((await createDemoPortfolioData()).data) } catch (requestError) { setError(requestError.message) } finally { setCreating(false) }
  }

  return <div className="space-y-3">
    <PageHeader eyebrow="Temporary setup tool" title="Portfolio demo data" description="Add a complete fixed dataset to understand every Portfolio section."><button type="button" onClick={createData} disabled={creating} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"><FiDatabase /> {creating ? 'Adding portfolio data...' : 'Add portfolio demo data'}</button></PageHeader>

    <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_21rem]">
      <section className="rounded-lg bg-white p-4 sm:p-6">
        <div className="flex items-start gap-3 rounded-md bg-[#fff8e8] p-3.5 text-[#7d6227]"><FiInfo className="mt-0.5 shrink-0" /><div><h2 className="text-sm font-semibold">Fixed data—not random data</h2><p className="mt-1 text-xs leading-5">Your deployed portfolio provides the profile, six projects, two work records, two education records, skills, and five services. Missing records use clearly labelled samples.</p></div></div>
        <div className="mt-3 flex items-start gap-3 rounded-md bg-[#edf5f0] p-3.5 text-[#315f51]"><FiShield className="mt-0.5 shrink-0" /><div><h2 className="text-sm font-semibold">Safe for the live admin</h2><p className="mt-1 text-xs leading-5">Seeded projects, history, education, certifications, services, and testimonials are saved as drafts. Skills are hidden. Nothing new is published automatically.</p></div></div>
        {error && <p role="alert" className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
        {result && <div className="mt-4 rounded-md bg-emerald-50 p-4 text-emerald-800"><div className="flex items-start gap-3"><FiCheckCircle className="mt-0.5 shrink-0 text-lg" /><div><p className="text-sm font-semibold">Portfolio demo data is ready</p><p className="mt-1 text-xs leading-5">Added missing records or kept matching records already in your account. You can now review and edit every Portfolio section.</p></div></div><div className="ml-7 mt-3 flex flex-wrap gap-4"><Link to="/portfolio" className="inline-flex items-center gap-1.5 text-xs font-semibold hover:underline">Open overview <FiArrowRight /></Link><Link to="/portfolio/projects" className="inline-flex items-center gap-1.5 text-xs font-semibold hover:underline">View projects <FiArrowRight /></Link><Link to="/portfolio/preview" className="inline-flex items-center gap-1.5 text-xs font-semibold hover:underline">Open preview <FiArrowRight /></Link></div></div>}
        <div className="mt-6"><h2 className="font-semibold text-[#292929]">How it works</h2><ol className="mt-3 space-y-3 text-sm leading-6 text-[#666]"><li><span className="font-semibold text-[#333]">1.</span> Select <strong>Add portfolio demo data</strong>.</li><li><span className="font-semibold text-[#333]">2.</span> Open each Portfolio section and review the fixed entries.</li><li><span className="font-semibold text-[#333]">3.</span> Edit verified entries and replace sample content with your real information.</li><li><span className="font-semibold text-[#333]">4.</span> Publish only the entries you want on the public portfolio.</li></ol></div>
      </section>

      <aside className="rounded-lg bg-white p-4 sm:p-5"><h2 className="font-semibold text-[#292929]">What will be available</h2><p className="mt-1 text-xs leading-5 text-[#888]">At least ten fixed records for every repeatable section.</p><dl className="mt-4 space-y-3">{contents.map(([count, label]) => <div key={label} className="flex items-center justify-between gap-4 border-b border-[#efedeb] pb-3 last:border-0 last:pb-0"><dt className="text-sm text-[#666]">{label}</dt><dd className="text-sm font-semibold text-[#292929]">{count}</dd></div>)}</dl><p className="mt-5 rounded-md bg-[#f7f7f7] p-3 text-xs leading-5 text-[#777]">Clicking the button again will not create duplicate records with the same identity.</p></aside>
    </div>
  </div>
}

export default PortfolioDemoData
