import { useCallback, useEffect, useState } from 'react'
import { FiStar } from 'react-icons/fi'
import { Link } from 'react-router-dom'

import * as opportunityService from '../../services/opportunity.service.js'

function OpportunityAction({ problemId }) {
  const [opportunity, setOpportunity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadOpportunity = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const result = await opportunityService.getOpportunityByProblem(problemId)
      setOpportunity(result.data)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [problemId])

  useEffect(() => {
    loadOpportunity()
  }, [loadOpportunity])

  if (loading) {
    return <span className="h-10 w-36 animate-pulse rounded-lg bg-slate-100" />
  }

  if (error) {
    return <span className="self-center text-xs text-red-600">Unable to check opportunity</span>
  }

  return (
    <Link
      to={opportunity ? `/opportunities/${opportunity._id}` : `/problems/${problemId}/opportunity/new`}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
    >
      <FiStar aria-hidden="true" /> {opportunity ? 'View opportunity' : 'Mark as Opportunity'}
    </Link>
  )
}

export default OpportunityAction
