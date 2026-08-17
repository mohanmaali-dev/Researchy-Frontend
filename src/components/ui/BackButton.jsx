import { FiArrowLeft } from 'react-icons/fi'
import { useLocation, useNavigate } from 'react-router-dom'

import { requestNavigation } from '../../utils/navigationGuard.js'

function BackButton({ fallback = '/home', label = 'Back', className = '' }) {
  const location = useLocation()
  const navigate = useNavigate()

  const handleBack = () => {
    requestNavigation(() => {
      if (location.key !== 'default' && window.history.length > 1) {
        navigate(-1)
        return
      }

      navigate(fallback, { replace: true })
    })
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`-ml-1 inline-flex min-h-11 items-center gap-2 px-1 text-sm font-medium text-[#666] transition hover:text-primary-dark ${className}`}
    >
      <FiArrowLeft aria-hidden="true" /> {label}
    </button>
  )
}

export default BackButton
