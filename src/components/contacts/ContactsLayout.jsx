import { useEffect, useState } from 'react'
import { FiDatabase, FiMenu, FiUsers, FiX } from 'react-icons/fi'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'

import AccountMenu from '../ui/AccountMenu.jsx'
import GlobalSearchButton from '../ui/GlobalSearchButton.jsx'

const linkClassName = ({ isActive }) =>
  `flex items-center gap-3 rounded-md px-3.5 py-2.5 text-sm font-medium transition ${
    isActive
      ? 'bg-[#edf5f0] text-[#2f684f]'
      : 'text-[#444] hover:bg-[#f5f5f5] hover:text-[#222]'
  }`

function ContactsLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  useEffect(() => setSidebarOpen(false), [location.pathname])

  return (
    <div className="min-h-screen bg-[#f2f2f1] p-2.5 text-ink sm:p-4">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <header className="relative z-30 flex h-18 items-center rounded-[10px] bg-white px-4 sm:px-5">
        <Link to="/home" className="flex shrink-0 items-center gap-2.5 lg:w-64" aria-label="3V home">
          <img src="/favicon.svg" alt="" className="size-10 shrink-0 rounded-md" aria-hidden="true" />
          <span>
            <span className="block text-sm font-semibold leading-4 tracking-tight text-[#292929]">3V Workspace</span>
            <span className="block text-[9px] uppercase tracking-[0.12em] text-[#999]">Veni · Vidi · Vici</span>
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <GlobalSearchButton />
          <AccountMenu />
          <button type="button" onClick={() => setSidebarOpen(true)} className="grid size-10 place-items-center rounded-full bg-[#f5f5f5] text-[#555] lg:hidden" aria-label="Open menu"><FiMenu aria-hidden="true" /></button>
        </div>
      </header>

      {sidebarOpen && <button type="button" className="workspace-sidebar-overlay animate-overlay-in fixed inset-0 bg-black/25 backdrop-blur-[2px] lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close menu" />}

      <div className="mt-3 flex items-start gap-3">
        <aside className={`workspace-mobile-sidebar fixed inset-y-3 left-3 flex w-64 flex-col overflow-y-auto rounded-[10px] bg-white p-4 shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:sticky lg:top-3 lg:h-[calc(100vh-6.75rem)] lg:translate-x-0 lg:shadow-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-[115%]'}`}>
          <div className="mb-3 flex items-center justify-between px-1 lg:hidden">
            <span className="font-medium">Navigation</span>
            <button type="button" onClick={() => setSidebarOpen(false)} className="grid size-9 place-items-center rounded-full bg-[#f5f5f5]" aria-label="Close menu"><FiX aria-hidden="true" /></button>
          </div>

          <p className="px-2 pb-2 text-xs font-medium uppercase tracking-wider text-[#999]">Contacts workspace</p>
          <nav aria-label="Contacts navigation">
            <NavLink to="/contacts" end className={linkClassName}>
              <FiUsers aria-hidden="true" /> Contacts
            </NavLink>
          </nav>

          <div className="mt-auto space-y-1 pt-6">
            <NavLink to="/contacts/demo-data" className={linkClassName}>
              <FiDatabase aria-hidden="true" /> Demo data
            </NavLink>
          </div>
        </aside>

        <div id="main-content" tabIndex="-1" className="workspace-content min-w-0 flex-1"><Outlet /></div>
      </div>
    </div>
  )
}

export default ContactsLayout
