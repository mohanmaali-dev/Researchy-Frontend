import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import ContactForm from '../../components/contacts/ContactForm.jsx'
import BackButton from '../../components/ui/BackButton.jsx'
import * as businessService from '../../services/business.service.js'
import * as contactService from '../../services/contact.service.js'

function AddContactPage() {
  const navigate = useNavigate()
  const [businesses, setBusinesses] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    businessService.getBusinesses().then((result) => setBusinesses(result.data)).catch(() => {})
  }, [])

  const handleSubmit = async (data) => {
    setSubmitting(true)
    setError('')
    try {
      const result = await contactService.createContact(data)
      navigate(`/contacts/${result.data._id}`)
      return true
    } catch (requestError) {
      setError(requestError.message)
      return false
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-1 pb-3 pt-1 sm:px-2">
      <section className="mb-3 rounded-lg bg-white p-5 sm:p-7">
        <BackButton fallback="/contacts" />
        <p className="mt-5 text-xs font-medium uppercase tracking-wider text-primary-dark">New contact</p>
        <h1 className="mt-1 text-3xl tracking-[-0.035em] text-[#171717]">Add contact</h1>
        <p className="mt-2 text-sm text-[#777]">Add the useful details now. You can complete the rest later.</p>
      </section>
      <ContactForm businesses={businesses} onSubmit={handleSubmit} submitting={submitting} serverError={error} />
    </main>
  )
}

export default AddContactPage
