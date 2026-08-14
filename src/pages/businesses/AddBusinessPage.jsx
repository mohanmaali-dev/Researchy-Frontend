import { useEffect, useState } from 'react'
import { FiArrowLeft } from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'

import BusinessForm from '../../components/businesses/BusinessForm.jsx'
import * as businessService from '../../services/business.service.js'

function AddBusinessPage() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [businessOptions, setBusinessOptions] = useState({ businessTypes: [], industries: [] })

  useEffect(() => {
    let active = true

    businessService
      .getBusinessOptions()
      .then((result) => {
        if (active) setBusinessOptions(result.data)
      })
      .catch((requestError) => {
        if (active) setError(requestError.message)
      })

    return () => {
      active = false
    }
  }, [])

  const handleSubmit = async (data) => {
    setSubmitting(true)
    setError('')

    try {
      const result = await businessService.createBusiness(data)
      navigate(`/businesses/${result.data._id}`, {
        state: { notice: 'Business created successfully.' },
      })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <Link to="/businesses" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary-dark">
        <FiArrowLeft aria-hidden="true" /> Back to businesses
      </Link>
      <div className="mb-8 mt-5">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary-dark">New record</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Add business</h1>
        <p className="mt-2 text-slate-500">Record the company details and your latest research or visit.</p>
      </div>
      <BusinessForm
        businessOptions={businessOptions}
        onSubmit={handleSubmit}
        submitting={submitting}
        serverError={error}
      />
    </main>
  )
}

export default AddBusinessPage
