import { FiArrowLeft } from 'react-icons/fi'
import { useLocation, useNavigate } from 'react-router-dom'

function BackButton({ fallback = '/home', label = 'Back', className = '' }) {
  const location = useLocation()
  const navigate = useNavigate()

  const handleBack = () => {
    if (location.key !== 'default' && window.history.length > 1) {
      navigate(-1)
      return
    }

    navigate(fallback, { replace: true })
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`inline-flex items-center gap-2 text-sm font-medium text-[#666] transition hover:text-primary-dark ${className}`}
    >
      <FiArrowLeft aria-hidden="true" /> {label}
    </button>
  )
}

export default BackButton
