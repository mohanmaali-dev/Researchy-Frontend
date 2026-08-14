import { useEffect, useMemo, useState } from 'react'
import { FiEye, FiMapPin, FiPlus, FiTrash2, FiUsers } from 'react-icons/fi'
import { Link, useSearchParams } from 'react-router-dom'

import { ErrorState, LoadingState } from '../../components/businesses/PageState.jsx'
import StatusBadge from '../../components/businesses/StatusBadge.jsx'
import ConfirmModal from '../../components/ui/ConfirmModal.jsx'
import * as businessService from '../../services/business.service.js'

const formatDate = (date) =>
  new Date(date).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })

function BusinessListPage() {
  const [searchParams] = useSearchParams()
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [businessToDelete, setBusinessToDelete] = useState(null)
  const search = (searchParams.get('search') || '').trim().toLowerCase()
  const visibleBusinesses = useMemo(
    () =>
      search
        ? businesses.filter((business) =>
            [
              business.companyName,
              business.industry,
              business.location,
              business.contactPerson,
              business.contactNumber,
              business.email,
              business.website,
            ].some((value) => value?.toLowerCase().includes(search)),
          )
        : businesses,
    [businesses, search],
  )

  const loadBusinesses = async () => {
    setLoading(true)
    setError('')

    try {
      const result = await businessService.getBusinesses()
      setBusinesses(result.data)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBusinesses()
  }, [])

  const handleDelete = async (business) => {
    setDeletingId(business._id)
    setError('')

    try {
      await businessService.deleteBusiness(business._id)
      setBusinesses((current) => current.filter((item) => item._id !== business._id))
      setBusinessToDelete(null)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-dark">
            Business management
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Businesses</h1>
          <p className="mt-2 text-slate-500">Keep company research and contact details in one place.</p>
        </div>
        <Link
          to="/businesses/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          <FiPlus aria-hidden="true" /> Add business
        </Link>
      </div>

      {error && !loading && businesses.length > 0 && (
        <p role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <section className="mt-8">
        {loading ? (
          <LoadingState label="Loading businesses..." />
        ) : error && businesses.length === 0 ? (
          <ErrorState message={error} onRetry={loadBusinesses} />
        ) : businesses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary-light text-2xl text-primary-dark">
              <FiUsers aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-xl font-bold">No businesses yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Add the first company you visited or researched to begin building your records.
            </p>
            <Link
              to="/businesses/new"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              <FiPlus aria-hidden="true" /> Add your first business
            </Link>
          </div>
        ) : visibleBusinesses.length === 0 ? (
          <div className="rounded-2xl bg-white px-6 py-14 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-[#f5f5f5] text-xl text-slate-500"><FiUsers aria-hidden="true" /></span>
            <h2 className="mt-4 text-lg font-bold">No matching businesses</h2>
            <p className="mt-2 text-sm text-slate-500">Try a different company, industry, location, or contact name.</p>
            <Link to="/businesses" className="mt-4 inline-flex rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50">Clear search</Link>
          </div>
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
              <table className="w-full border-collapse text-left">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3.5">Business</th>
                    <th className="px-5 py-3.5">Industry</th>
                    <th className="px-5 py-3.5">Contact</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Visited / researched</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleBusinesses.map((business) => (
                    <tr key={business._id} className="transition hover:bg-slate-50/70">
                      <td className="px-5 py-4">
                        <Link
                          to={`/businesses/${business._id}`}
                          className="font-bold text-slate-900 hover:text-primary-dark"
                        >
                          {business.companyName}
                        </Link>
                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                          <FiMapPin aria-hidden="true" /> {business.location}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        <p>{business.industry}</p>
                        <p className="mt-1 text-xs text-slate-400">{business.businessType}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        <p className="font-medium text-slate-700">{business.contactPerson}</p>
                        <p className="mt-1 max-w-44 truncate text-xs text-slate-400">
                          {business.contactNumber || business.email || 'No contact details'}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={business.status} />
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(business.dateVisitedOrResearched)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1">
                          <Link
                            to={`/businesses/${business._id}`}
                            aria-label={`View ${business.companyName}`}
                            className="rounded-lg p-2 text-slate-500 hover:bg-primary-light hover:text-primary-dark"
                          >
                            <FiEye aria-hidden="true" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setBusinessToDelete(business)}
                            disabled={deletingId === business._id}
                            aria-label={`Delete ${business.companyName}`}
                            className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                          >
                            <FiTrash2 aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-4 md:hidden">
              {visibleBusinesses.map((business) => (
                <article key={business._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link to={`/businesses/${business._id}`} className="text-lg font-bold hover:text-primary-dark">
                        {business.companyName}
                      </Link>
                      <p className="mt-1 text-sm text-slate-500">{business.industry}</p>
                    </div>
                    <StatusBadge status={business.status} />
                  </div>
                  <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-600">
                    <p className="flex items-center gap-2"><FiMapPin aria-hidden="true" /> {business.location}</p>
                    <p><span className="font-semibold text-slate-700">Contact:</span> {business.contactPerson}</p>
                    <p><span className="font-semibold text-slate-700">Date:</span> {formatDate(business.dateVisitedOrResearched)}</p>
                  </div>
                  <div className="mt-5 flex gap-2">
                    <Link
                      to={`/businesses/${business._id}`}
                      className="flex-1 rounded-lg bg-primary-light px-4 py-2.5 text-center text-sm font-semibold text-primary-dark"
                    >
                      View details
                    </Link>
                    <button
                      type="button"
                      onClick={() => setBusinessToDelete(business)}
                      disabled={deletingId === business._id}
                      className="rounded-lg border border-red-200 px-3.5 text-red-600 disabled:opacity-40"
                      aria-label={`Delete ${business.companyName}`}
                    >
                      <FiTrash2 aria-hidden="true" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
      <ConfirmModal
        open={Boolean(businessToDelete)}
        title="Delete business?"
        message={businessToDelete ? `“${businessToDelete.companyName}” will be permanently deleted. This action cannot be undone.` : ''}
        confirmLabel="Delete business"
        loading={Boolean(deletingId)}
        onConfirm={() => businessToDelete && handleDelete(businessToDelete)}
        onCancel={() => setBusinessToDelete(null)}
      />
    </main>
  )
}

export default BusinessListPage
