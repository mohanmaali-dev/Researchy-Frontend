import { useEffect, useState } from 'react'
import {
  FiBriefcase,
  FiClock,
  FiGrid,
  FiHelpCircle,
  FiMenu,
  FiPlus,
  FiRepeat,
  FiSearch,
  FiStar,
  FiX,
} from 'react-icons/fi'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'

const navigation = [
  { to: '/dashboard', label: 'Dashboard', icon: FiGrid, end: true },
  { to: '/businesses', label: 'Businesses', icon: FiBriefcase },
  { to: '/problem-patterns', label: 'Problem patterns', icon: FiRepeat },
  { to: '/opportunities', label: 'Opportunities', icon: FiStar },
  { to: '/follow-ups', label: 'Follow-ups', icon: FiClock },
]

function BusinessLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [search, setSearch] = useState('')
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  const handleSearch = (event) => {
    event.preventDefault()
    const value = search.trim()
    navigate(value ? `/businesses?search=${encodeURIComponent(value)}` : '/businesses')
  }

  return (
    <div className="min-h-screen bg-[#f2f2f1] p-2.5 text-ink sm:p-4">
      <header className="relative z-30 flex h-18 items-center rounded-[22px] bg-white px-4 shadow-[0_1px_0_rgba(0,0,0,0.04)] sm:px-5">
        <Link to="/dashboard" className="flex w-auto shrink-0 items-center gap-2.5 lg:w-64">
          <span className="grid size-10 place-items-center rounded-full bg-primary-light text-primary-dark">
            <FiBriefcase aria-hidden="true" />
          </span>
          <span className="text-lg font-semibold tracking-tight text-slate-800">Researchy</span>
        </Link>

        <form onSubmit={handleSearch} className="mx-auto hidden w-full max-w-lg md:block">
          <label className="flex items-center gap-3 rounded-full bg-[#f6f6f6] px-5 py-3 text-sm text-slate-500">
            <FiSearch className="text-lg text-slate-700" aria-hidden="true" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent text-slate-900 outline-none placeholder:text-slate-400" placeholder="Search businesses" aria-label="Search businesses" />
            <span className="rounded-md bg-white px-2 py-1 text-[10px] font-medium text-slate-400 shadow-sm">ENTER</span>
          </label>
        </form>

        <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-6">
          <Link to="/follow-ups/new" className="hidden size-10 place-items-center rounded-full bg-[#f6f6f6] text-slate-700 hover:bg-slate-100 sm:grid" aria-label="Add follow-up"><FiClock aria-hidden="true" /></Link>
          <Link to="/businesses/new" className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-xs font-medium text-white hover:bg-primary-dark"><FiPlus aria-hidden="true" /><span className="hidden sm:inline">Add business</span></Link>
          <button type="button" onClick={() => setSidebarOpen(true)} className="grid size-10 place-items-center rounded-full bg-[#f6f6f6] text-slate-700 lg:hidden" aria-label="Open menu"><FiMenu aria-hidden="true" /></button>
        </div>
      </header>

      {sidebarOpen && <button type="button" className="animate-overlay-in fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px] lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close menu" />}

      <div className="mt-3 flex items-start gap-3">
        <aside className={`fixed inset-y-3 left-3 z-50 flex w-64 flex-col rounded-[22px] bg-white p-4 shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:sticky lg:top-3 lg:h-[calc(100vh-6.75rem)] lg:translate-x-0 lg:shadow-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-[115%]'}`}>
          <div className="mb-3 flex items-center justify-between px-1 lg:hidden">
            <span className="font-extrabold">Menu</span>
            <button type="button" onClick={() => setSidebarOpen(false)} className="grid size-9 place-items-center rounded-full bg-[#f5f5f5]" aria-label="Close menu"><FiX aria-hidden="true" /></button>
          </div>

          <p className="px-2 pb-3 text-sm font-medium text-[#737373]">Menu</p>
          <nav className="space-y-1.5" aria-label="Main navigation">
            {navigation.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? 'bg-primary-light text-primary-dark ring-1 ring-primary/10'
                      : 'text-[#252525] hover:bg-[#f5f5f5]'
                  }`
                }
              >
                <Icon className="text-base" aria-hidden="true" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-7">
            <p className="px-2 pb-3 text-sm font-medium text-[#737373]">Create</p>
            <div className="space-y-1.5">
              <Link to="/businesses/new" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#444] hover:bg-[#f7f7f7]"><FiPlus aria-hidden="true" /> New business</Link>
              <Link to="/follow-ups/new" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#444] hover:bg-[#f7f7f7]"><FiClock aria-hidden="true" /> New follow-up</Link>
            </div>
          </div>

          <div className="mt-auto space-y-2">
            <NavLink
              to="/how-it-works"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-primary-light text-primary-dark ring-1 ring-primary/10'
                    : 'text-[#444] hover:bg-[#f5f5f5]'
                }`
              }
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white shadow-sm ring-1 ring-[#ece8e5]">
                <FiHelpCircle aria-hidden="true" />
              </span>
              <span>
                <span className="block">How it works</span>
                <span className="mt-0.5 block text-[10px] font-normal text-[#888]">Quick project guide</span>
              </span>
            </NavLink>

            <div className="rounded-xl bg-[#f6f6f6] px-4 py-3">
              <p className="text-xs font-medium text-slate-700">Research workspace</p>
              <p className="mt-1 text-[11px] leading-5 text-slate-500">Business research and opportunity tracking.</p>
            </div>
          </div>
        </aside>

        <div className="workspace-content min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default BusinessLayout
