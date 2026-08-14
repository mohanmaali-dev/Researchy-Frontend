import { useCallback, useEffect, useState } from 'react'
import { FiArrowLeft, FiCalendar, FiEdit2, FiMapPin, FiTrash2, FiUser } from 'react-icons/fi'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'

import { ErrorState, LoadingState } from '../../components/businesses/PageState.jsx'
import StatusBadge from '../../components/businesses/StatusBadge.jsx'
import ConversationList from '../../components/conversations/ConversationList.jsx'
import AddFollowUpLink from '../../components/follow-ups/AddFollowUpLink.jsx'
import ConfirmModal from '../../components/ui/ConfirmModal.jsx'
import * as businessService from '../../services/business.service.js'

const formatDate = (date) =>
  new Date(date).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })

const getWebsiteUrl = (website) =>
  /^https?:\/\//i.test(website) ? website : `https://${website}`

function DetailItem({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-slate-700">{children || '—'}</dd>
    </div>
  )
}

function BusinessDetailsPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState('')

  const loadBusiness = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const result = await businessService.getBusinessById(id)
      setBusiness(result.data)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadBusiness()
  }, [loadBusiness])

  const handleDelete = async () => {
    setDeleting(true)
    setError('')

    try {
      await businessService.deleteBusiness(business._id)
      setConfirmDelete(false)
      navigate('/businesses', { replace: true })
    } catch (requestError) {
      setError(requestError.message)
      setDeleting(false)
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      {loading ? (
        <LoadingState label="Loading business details..." />
      ) : error && !business ? (
        <ErrorState message={error} onRetry={loadBusiness} />
      ) : (
        <>
          <Link to="/businesses" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary-dark">
            <FiArrowLeft aria-hidden="true" /> Back to businesses
          </Link>

          {location.state?.notice && (
            <p className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {location.state.notice}
            </p>
          )}

          {error && (
            <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-slate-50/60 p-5 sm:p-7">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-bold tracking-tight">{business.companyName}</h1>
                    <StatusBadge status={business.status} />
                  </div>
                  <p className="mt-2 text-slate-500">{business.industry} · {business.businessType}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <AddFollowUpLink businessId={business._id} />
                  <Link
                    to={`/businesses/${business._id}/edit`}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <FiEdit2 aria-hidden="true" /> Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    disabled={deleting}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    <FiTrash2 aria-hidden="true" /> {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-8 p-5 sm:grid-cols-2 sm:p-7">
              <div className="rounded-xl bg-slate-50 p-5">
                <div className="flex items-center gap-3 text-primary-dark">
                  <FiMapPin aria-hidden="true" />
                  <h2 className="font-bold text-slate-900">Business details</h2>
                </div>
                <dl className="mt-5 space-y-5">
                  <DetailItem label="Location">{business.location}</DetailItem>
                  <DetailItem label="Business type">{business.businessType}</DetailItem>
                  <DetailItem label="Industry">{business.industry}</DetailItem>
                </dl>
              </div>

              <div className="rounded-xl bg-slate-50 p-5">
                <div className="flex items-center gap-3 text-primary-dark">
                  <FiUser aria-hidden="true" />
                  <h2 className="font-bold text-slate-900">Contact details</h2>
                </div>
                <dl className="mt-5 space-y-5">
                  <DetailItem label="Contact person">{business.contactPerson}</DetailItem>
                  <DetailItem label="Contact number">
                    {business.contactNumber ? (
                      <a className="hover:text-primary-dark" href={`tel:${business.contactNumber}`}>
                        {business.contactNumber}
                      </a>
                    ) : null}
                  </DetailItem>
                  <DetailItem label="Email">
                    {business.email ? (
                      <a className="break-all hover:text-primary-dark" href={`mailto:${business.email}`}>
                        {business.email}
                      </a>
                    ) : null}
                  </DetailItem>
                  <DetailItem label="Website">
                    {business.website ? (
                      <a
                        className="break-all hover:text-primary-dark"
                        href={getWebsiteUrl(business.website)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {business.website}
                      </a>
                    ) : null}
                  </DetailItem>
                </dl>
              </div>

              <div className="rounded-xl bg-slate-50 p-5 sm:col-span-2">
                <div className="flex items-center gap-3 text-primary-dark">
                  <FiCalendar aria-hidden="true" />
                  <h2 className="font-bold text-slate-900">Research and notes</h2>
                </div>
                <dl className="mt-5 grid gap-6 sm:grid-cols-2">
                  <DetailItem label="Date visited/researched">
                    {formatDate(business.dateVisitedOrResearched)}
                  </DetailItem>
                  <DetailItem label="Status">{business.status}</DetailItem>
                  <div className="sm:col-span-2">
                    <DetailItem label="General notes">{business.generalNotes}</DetailItem>
                  </div>
                </dl>
              </div>
            </div>
          </section>
          <ConversationList businessId={business._id} />
          <ConfirmModal
            open={confirmDelete}
            title="Delete business?"
            message={`“${business.companyName}” will be permanently deleted. This action cannot be undone.`}
            confirmLabel="Delete business"
            loading={deleting}
            onConfirm={handleDelete}
            onCancel={() => setConfirmDelete(false)}
          />
        </>
      )}
    </main>
  )
}

export default BusinessDetailsPage
