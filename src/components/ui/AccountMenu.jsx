import { useEffect, useRef, useState } from 'react'
import { FiActivity, FiChevronDown, FiDatabase, FiLogOut } from 'react-icons/fi'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext.jsx'
import { requestNavigation } from '../../utils/navigationGuard.js'

function AccountMenu() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const rootRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => setOpen(false), [location.pathname])

  useEffect(() => {
    const closeMenu = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    const closeWithKeyboard = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', closeMenu)
    document.addEventListener('keydown', closeWithKeyboard)
    return () => {
      document.removeEventListener('pointerdown', closeMenu)
      document.removeEventListener('keydown', closeWithKeyboard)
    }
  }, [])

  const handleLogout = () => {
    requestNavigation(async () => {
      setLoggingOut(true)
      try {
        await logout()
        navigate('/login', { replace: true })
      } finally {
        setLoggingOut(false)
      }
    })
  }

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`flex h-10 items-center gap-1 rounded-md bg-[#f5f5f5] pl-1 pr-2 text-[#666] transition hover:bg-[#ecebea] ${open ? 'ring-2 ring-[#628ab4]/15' : ''}`}
        aria-label="Open account menu"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="grid size-8 place-items-center rounded-md bg-white text-sm font-semibold text-[#555] shadow-sm">
          {(user?.name || 'W').trim().charAt(0).toUpperCase()}
        </span>
        <FiChevronDown className={`text-xs transition ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-[calc(100%+0.5rem)] z-[210] w-64 overflow-hidden rounded-lg border border-[#e1dfdc] bg-white p-2 shadow-[0_18px_55px_rgba(40,35,31,0.18)]">
          <div className="px-3 py-2.5">
            <p className="truncate text-sm font-semibold text-[#292929]">{user?.name || 'My workspace'}</p>
            <p className="mt-0.5 truncate text-xs text-[#888]">{user?.email || 'Personal account'}</p>
          </div>
          <div className="my-1 h-px bg-[#ece9e5]" />
          <Link to="/sessions" role="menuitem" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-[#444] transition hover:bg-[#edf3f9] hover:text-[#315f91]">
            <FiActivity className="shrink-0" aria-hidden="true" /> Account activity
          </Link>
          <Link to="/settings/data" role="menuitem" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-[#444] transition hover:bg-[#edf5f0] hover:text-[#2f684f]">
            <FiDatabase className="shrink-0" aria-hidden="true" /> Backup &amp; restore
          </Link>
          <div className="my-1 h-px bg-[#ece9e5]" />
          <button type="button" role="menuitem" onClick={handleLogout} disabled={loggingOut} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-50">
            <FiLogOut className="shrink-0" aria-hidden="true" /> {loggingOut ? 'Signing out...' : 'Sign out'}
          </button>
        </div>
      )}
    </div>
  )
}

export default AccountMenu
