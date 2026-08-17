import { useEffect, useState } from 'react'
import { FiBookOpen, FiBriefcase, FiDownload, FiHome, FiPlus, FiShield, FiUsers, FiX } from 'react-icons/fi'
import { Link, useLocation } from 'react-router-dom'

import { usePwa } from '../../context/PwaContext.jsx'

const navigation = [
  { label: 'Home', to: '/home', icon: FiHome, active: (path) => path === '/home' },
  { label: 'Business', to: '/businesses', icon: FiBriefcase, active: (path) => ['/dashboard', '/businesses', '/conversations', '/problems', '/problem-patterns', '/opportunities', '/follow-ups'].some((prefix) => path.startsWith(prefix)) },
  { label: 'Learning', to: '/learning', icon: FiBookOpen, active: (path) => path.startsWith('/learning') },
  { label: 'Contacts', to: '/contacts', icon: FiUsers, active: (path) => path.startsWith('/contacts') },
]

const quickActions = [
  { label: 'Add Business', description: 'Record a business visit', to: '/businesses/new', icon: FiBriefcase },
  { label: 'Add Contact', description: 'Save a person quickly', to: '/contacts/new', icon: FiUsers },
  { label: 'New Learning Topic', description: 'Choose something to learn', to: '/learning/topics/new', icon: FiBookOpen },
  { label: 'Add Learning Entry', description: 'Record what you understood', to: '/learning/entries/new', icon: FiPlus },
]

function MobileNavigation() {
  const location = useLocation()
  const { canInstall, installApp, isIos } = usePwa()
  const [open, setOpen] = useState(false)
  const [showIosHelp, setShowIosHelp] = useState(false)

  useEffect(() => { document.body.classList.add('has-mobile-navigation'); return () => document.body.classList.remove('has-mobile-navigation') }, [])
  useEffect(() => setOpen(false), [location.pathname])

  return (
    <>
      {open && <button type="button" className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] md:hidden" onClick={() => setOpen(false)} aria-label="Close quick actions" />}
      <section className={`fixed inset-x-2 bottom-[4.8rem] z-[60] rounded-lg bg-white p-4 shadow-[0_18px_60px_rgba(0,0,0,0.24)] transition duration-200 md:hidden ${open ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'}`} aria-hidden={!open}>
        <div className="flex items-center justify-between"><div><h2 className="text-base font-semibold">Quick add</h2><p className="mt-0.5 text-xs text-[#777]">Choose what you want to record.</p></div><button type="button" onClick={() => setOpen(false)} className="grid size-9 place-items-center rounded-md bg-[#f2f2f1]" aria-label="Close"><FiX aria-hidden="true" /></button></div>
        <div className="mt-4 grid grid-cols-2 gap-2">{quickActions.map(({ label, description, to, icon: Icon }) => <Link key={to} to={to} className="rounded-md bg-[#f7f7f7] p-3 transition active:bg-[#ededeb]"><Icon className="text-primary-dark" aria-hidden="true" /><p className="mt-2 text-xs font-semibold text-[#333]">{label}</p><p className="mt-1 text-[10px] leading-4 text-[#888]">{description}</p></Link>)}</div>
        <div className="mt-3 flex gap-2"><Link to="/sessions" className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-[#edf3f9] px-3 py-2.5 text-xs font-semibold text-[#315f91]"><FiShield aria-hidden="true" /> Active sessions</Link>{canInstall && <button type="button" onClick={() => isIos ? setShowIosHelp((value) => !value) : installApp()} className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-emerald-50 px-3 py-2.5 text-xs font-semibold text-emerald-700"><FiDownload aria-hidden="true" /> Install app</button>}</div>
        {showIosHelp && <p className="mt-3 rounded-md bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-800">On iPhone or iPad: tap the browser Share button, then choose <strong>Add to Home Screen</strong>.</p>}
      </section>
      <nav className="fixed inset-x-2 bottom-2 z-[55] grid h-16 grid-cols-5 items-center rounded-lg border border-[#ddd9d4] bg-white/95 px-1 shadow-[0_8px_32px_rgba(0,0,0,0.14)] backdrop-blur md:hidden" aria-label="Mobile navigation">
        {navigation.slice(0, 2).map(({ label, to, icon: Icon, active }) => <Link key={to} to={to} className={`flex h-12 flex-col items-center justify-center gap-1 rounded-md text-[10px] font-medium ${active(location.pathname) ? 'text-primary-dark' : 'text-[#777]'}`}><Icon className="text-lg" aria-hidden="true" /> {label}</Link>)}
        <button type="button" onClick={() => setOpen((value) => !value)} className="mx-auto grid size-12 place-items-center rounded-full bg-primary text-xl text-white shadow-md shadow-primary/25" aria-label="Open quick actions" aria-expanded={open}><FiPlus className={`transition ${open ? 'rotate-45' : ''}`} aria-hidden="true" /></button>
        {navigation.slice(2).map(({ label, to, icon: Icon, active }) => <Link key={to} to={to} className={`flex h-12 flex-col items-center justify-center gap-1 rounded-md text-[10px] font-medium ${active(location.pathname) ? 'text-primary-dark' : 'text-[#777]'}`}><Icon className="text-lg" aria-hidden="true" /> {label}</Link>)}
      </nav>
    </>
  )
}

export default MobileNavigation
