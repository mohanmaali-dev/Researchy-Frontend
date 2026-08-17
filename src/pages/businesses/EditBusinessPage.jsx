import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import BusinessForm from '../../components/businesses/BusinessForm.jsx'
import { ErrorState, LoadingState } from '../../components/businesses/PageState.jsx'
import BackButton from '../../components/ui/BackButton.jsx'
import * as businessService from '../../services/business.service.js'

function EditBusinessPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [business, setBusiness] = useState(null)
  const [businessOptions, setBusinessOptions] = useState({ businessTypes: [], industries: [] })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const loadBusiness = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const [businessResult, optionsResult] = await Promise.all([
        businessService.getBusinessById(id),
        businessService.getBusinessOptions(),
      ])
      setBusiness(businessResult.data)
      setBusinessOptions(optionsResult.data)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadBusiness()
  }, [loadBusiness])

  const initialValues = useMemo(() => {
    if (!business) return undefined

    return {
      companyName: business.companyName,
      businessType: business.businessType,
      industry: business.industry,
      location: business.location,
      contactPerson: business.contactPerson,
      contactNumber: business.contactNumber || '',
      email: business.email || '',
      website: business.website || '',
      generalNotes: business.generalNotes || '',
      dateVisitedOrResearched: business.dateVisitedOrResearched.slice(0, 10),
      status: business.status,
    }
  }, [business])

  const handleSubmit = async (data) => {
    setSubmitting(true)
    setError('')

    try {
      await businessService.updateBusiness(id, data)
      navigate(`/businesses/${id}`)
      return true
    } catch (requestError) {
      setError(requestError.message)
      return false
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      {loading ? (
        <LoadingState label="Loading business..." />
      ) : !business ? (
        <ErrorState message={error} onRetry={loadBusiness} />
      ) : (
        <>
          <BackButton fallback={`/businesses/${id}`} />
          <div className="mb-8 mt-5">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-dark">Update record</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">Edit business</h1>
            <p className="mt-2 text-slate-500">Update details for {business.companyName}.</p>
          </div>
          <BusinessForm
            initialValues={initialValues}
            businessOptions={businessOptions}
            onSubmit={handleSubmit}
            submitting={submitting}
            serverError={error}
          />
        </>
      )}
    </main>
  )
}

export default EditBusinessPage
