import { useCallback, useEffect, useState } from 'react'
import {
  FiAlertCircle,
  FiBriefcase,
  FiCalendar,
  FiClock,
  FiEdit2,
  FiInfo,
  FiMail,
  FiMapPin,
  FiMessageSquare,
  FiPhone,
  FiStar,
  FiTrash2,
  FiUser,
} from 'react-icons/fi'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import {
  BusinessFollowUpsPanel,
  BusinessOpportunitiesPanel,
  BusinessProblemsPanel,
} from '../../components/businesses/BusinessRelatedPanels.jsx'
import { ErrorState, LoadingState } from '../../components/businesses/PageState.jsx'
import StatusBadge from '../../components/businesses/StatusBadge.jsx'
import ConversationList from '../../components/conversations/ConversationList.jsx'
import ConfirmModal from '../../components/ui/ConfirmModal.jsx'
import BackButton from '../../components/ui/BackButton.jsx'
import * as businessService from '../../services/business.service.js'

const TABS = [
  { value: 'overview', label: 'Overview', icon: FiInfo },
  { value: 'conversations', label: 'Conversations', icon: FiMessageSquare },
  { value: 'problems', label: 'Problems', icon: FiAlertCircle },
  { value: 'opportunities', label: 'Opportunities', icon: FiStar },
  { value: 'follow-ups', label: 'Follow-ups', icon: FiClock },
]

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
      <dt className="text-xs font-medium text-[#999]">{label}</dt>
      <dd className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-[#444]">{children || '—'}</dd>
    </div>
  )
}

function OverviewPanel({ business, onDelete, deleting }) {
  return (
    <div className="space-y-3">
      <section className="grid gap-3 lg:grid-cols-3">
        <div className="rounded-[22px] bg-white p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-primary-light text-primary-dark"><FiBriefcase aria-hidden="true" /></span>
            <h2 className="text-lg">Business</h2>
          </div>
          <dl className="mt-5 space-y-4">
            <DetailItem label="Type">{business.businessType}</DetailItem>
            <DetailItem label="Industry">{business.industry}</DetailItem>
            <DetailItem label="Location">{business.location}</DetailItem>
          </dl>
        </div>

        <div className="rounded-[22px] bg-white p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-[#eef6f2] text-emerald-700"><FiUser aria-hidden="true" /></span>
            <h2 className="text-lg">Contact</h2>
          </div>
          <dl className="mt-5 space-y-4">
            <DetailItem label="Person">{business.contactPerson}</DetailItem>
            <DetailItem label="Phone">
              {business.contactNumber ? <a href={`tel:${business.contactNumber}`} className="inline-flex items-center gap-2 hover:text-primary-dark"><FiPhone aria-hidden="true" /> {business.contactNumber}</a> : null}
            </DetailItem>
            <DetailItem label="Email">
              {business.email ? <a href={`mailto:${business.email}`} className="inline-flex items-center gap-2 break-all hover:text-primary-dark"><FiMail aria-hidden="true" /> {business.email}</a> : null}
            </DetailItem>
            {business.website && (
              <DetailItem label="Website">
                <a href={getWebsiteUrl(business.website)} target="_blank" rel="noreferrer" className="break-all hover:text-primary-dark">{business.website}</a>
              </DetailItem>
            )}
          </dl>
        </div>

        <div className="rounded-[22px] bg-white p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-[#eef3fb] text-[#4c6f9c]"><FiCalendar aria-hidden="true" /></span>
            <h2 className="text-lg">Research</h2>
          </div>
          <dl className="mt-5 space-y-4">
            <DetailItem label="Last visited or researched">{formatDate(business.dateVisitedOrResearched)}</DetailItem>
            <DetailItem label="Status"><StatusBadge status={business.status} /></DetailItem>
            <DetailItem label="Notes">{business.generalNotes}</DetailItem>
          </dl>
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-[22px] bg-red-50/60 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm text-red-700">Delete business</h2>
          <p className="mt-1 text-xs leading-5 text-red-600/80">Only delete this business if you no longer need the record.</p>
        </div>
        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          <FiTrash2 aria-hidden="true" /> {deleting ? 'Deleting...' : 'Delete business'}
        </button>
      </section>
    </div>
  )
}

function BusinessDetailsPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState('')
  const requestedTab = searchParams.get('tab') || 'overview'
  const activeTab = TABS.some((tab) => tab.value === requestedTab) ? requestedTab : 'overview'

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

  const selectTab = (tab) => {
    if (tab === 'overview') setSearchParams({}, { replace: true })
    else setSearchParams({ tab }, { replace: true })
  }

  const renderTab = () => {
    if (activeTab === 'conversations') return <ConversationList businessId={business._id} />
    if (activeTab === 'problems') return <BusinessProblemsPanel businessId={business._id} />
    if (activeTab === 'opportunities') return <BusinessOpportunitiesPanel businessId={business._id} />
    if (activeTab === 'follow-ups') return <BusinessFollowUpsPanel businessId={business._id} />

    return <OverviewPanel business={business} onDelete={() => setConfirmDelete(true)} deleting={deleting} />
  }

  return (
    <main className="w-full px-1 pb-3 pt-1 sm:px-2">
      {loading ? (
        <div className="rounded-[24px] bg-white p-6"><LoadingState label="Loading business..." /></div>
      ) : error && !business ? (
        <div className="rounded-[24px] bg-white p-6"><ErrorState message={error} onRetry={loadBusiness} /></div>
      ) : (
        <>
          <section className="rounded-[24px] bg-white p-5 sm:p-7">
            <BackButton fallback="/businesses" className="text-[#777]" />

            {location.state?.notice && (
              <p className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{location.state.notice}</p>
            )}
            {error && (
              <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-normal text-red-600">{error}</p>
            )}

            <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl tracking-[-0.035em] text-[#171717] sm:text-4xl">{business.companyName}</h1>
                  <StatusBadge status={business.status} />
                </div>
                <p className="mt-2 flex flex-wrap items-center gap-x-2 text-sm text-[#777]">
                  <span>{business.businessType}</span><span>•</span><span>{business.industry}</span><span>•</span>
                  <span className="inline-flex items-center gap-1"><FiMapPin aria-hidden="true" /> {business.location}</span>
                </p>
              </div>
              <Link
                to={`/businesses/${business._id}/edit`}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#f5f5f5] px-4 py-2.5 text-sm font-medium text-[#444] hover:bg-[#ededed]"
              >
                <FiEdit2 aria-hidden="true" /> Edit business
              </Link>
            </div>

            <nav className="mt-7 flex gap-1 overflow-x-auto rounded-2xl bg-[#f5f5f5] p-1.5" aria-label="Business details sections">
              {TABS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => selectTab(value)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                    activeTab === value ? 'bg-white text-[#222] shadow-sm' : 'text-[#777] hover:text-[#333]'
                  }`}
                >
                  <Icon aria-hidden="true" /> {label}
                </button>
              ))}
            </nav>
          </section>

          <div className="mt-3">{renderTab()}</div>

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
