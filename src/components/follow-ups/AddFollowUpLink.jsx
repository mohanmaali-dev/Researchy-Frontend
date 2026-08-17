import { FiClock } from 'react-icons/fi'
import { Link } from 'react-router-dom'

function AddFollowUpLink({ businessId, conversationId, opportunityId }) {
  const query = new URLSearchParams({ businessId })
  if (conversationId) query.set('conversationId', conversationId)
  if (opportunityId) query.set('opportunityId', opportunityId)

  return (
    <Link
      to={`/follow-ups/new?${query}`}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-dark"
    >
      <FiClock aria-hidden="true" /> Add follow-up
    </Link>
  )
}

export default AddFollowUpLink
