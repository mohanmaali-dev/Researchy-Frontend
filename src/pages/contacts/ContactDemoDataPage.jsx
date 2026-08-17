import { useState } from 'react'
import { FiArrowRight, FiCheckCircle, FiDatabase, FiInfo } from 'react-icons/fi'
import { Link } from 'react-router-dom'

import * as demoDataService from '../../services/demo-data.service.js'

function ContactDemoDataPage() {
  const [creating, setCreating] = useState(false)
  const [createdCount, setCreatedCount] = useState(null)
  const [error, setError] = useState('')

  const handleCreate = async () => {
    setCreating(true)
    setCreatedCount(null)
    setError('')

    try {
      const result = await demoDataService.createDemoContacts()
      setCreatedCount(result.data.contacts)
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
            <p className="text-xs font-medium uppercase tracking-wider text-primary-dark">Temporary page</p>
            <h1 className="mt-1.5 text-3xl tracking-[-0.035em] text-[#171717] sm:text-4xl">Contact demo data</h1>
            <p className="mt-2 text-sm leading-6 text-[#707070]">Add sample contacts to understand the Contact Management screens.</p>
          </div>
          <button type="button" onClick={handleCreate} disabled={creating} className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"><FiDatabase aria-hidden="true" /> {creating ? 'Adding demo contacts...' : 'Add demo contacts'}</button>
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-md bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
          <FiInfo className="mt-1 shrink-0" aria-hidden="true" />
          <p>This temporary tool adds records to the live database. Repeating it updates the same demo contacts instead of creating duplicates.</p>
        </div>

        {error && <p role="alert" className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
        {createdCount !== null && (
          <div className="mt-4 rounded-md bg-emerald-50 p-4 text-emerald-800">
            <div className="flex items-start gap-3"><FiCheckCircle className="mt-0.5 shrink-0 text-lg" aria-hidden="true" /><div><p className="text-sm font-semibold">Demo contacts are ready</p><p className="mt-1 text-xs leading-5">{createdCount} sample contacts were added or updated.</p></div></div>
            <Link to="/contacts" className="ml-7 mt-3 inline-flex items-center gap-1.5 text-xs font-semibold hover:underline">Open Contacts <FiArrowRight aria-hidden="true" /></Link>
          </div>
        )}
      </section>

      <section className="mt-3 rounded-lg bg-white p-5 sm:p-7">
        <h2 className="text-lg font-semibold text-[#292929]">What it adds</h2>
        <p className="mt-2 text-sm leading-6 text-[#666]">Eight sample contacts with phone numbers, email addresses, companies, roles, contact types, dates, notes, and statuses. Matching demo Businesses are linked automatically when available.</p>
      </section>
    </main>
  )
}

export default ContactDemoDataPage
