import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useToast } from '../../context/ToastContext.jsx'

function NavigationFeedback() {
  const location = useLocation()
  const navigate = useNavigate()
  const { showToast } = useToast()

  useEffect(() => {
    const notice = location.state?.notice
    if (!notice) return
    showToast(notice, location.state?.noticeTone || 'success')
    const { notice: _notice, noticeTone: _noticeTone, ...remainingState } = location.state
    navigate(`${location.pathname}${location.search}${location.hash}`, {
      replace: true,
      state: Object.keys(remainingState).length ? remainingState : null,
    })
  }, [location.hash, location.pathname, location.search, location.state, navigate, showToast])

  return null
}

export default NavigationFeedback
