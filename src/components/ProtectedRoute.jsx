import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuth } from '../context/AuthContext.jsx'
import { rememberWorkspacePage } from '../utils/recentWorkspace.js'
import MobileNavigation from './mobile/MobileNavigation.jsx'

function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()
  const verificationRequired = import.meta.env.VITE_REQUIRE_EMAIL_VERIFICATION === 'true'

  useEffect(() => {
    if (user) rememberWorkspacePage(location.pathname, user._id || user.id)
  }, [location.pathname, user])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f2f2f1] p-3 sm:p-5" role="status">
        <span className="sr-only">Loading your workspace</span>
        <div className="h-16 animate-pulse rounded-lg bg-white" />
        <div className="mt-3 grid animate-pulse gap-3 lg:grid-cols-[16rem_minmax(0,1fr)]"><div className="hidden h-[calc(100vh-7rem)] rounded-lg bg-white lg:block" /><div><div className="h-40 rounded-lg bg-white" /><div className="mt-3 grid gap-3 sm:grid-cols-2"><div className="h-44 rounded-lg bg-white" /><div className="h-44 rounded-lg bg-white" /></div></div></div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (verificationRequired && !user.isEmailVerified) {
    return <Navigate to="/check-email" replace />
  }

  return <><Outlet /><MobileNavigation /></>
}

export default ProtectedRoute
