import {
  FiArrowRight,
  FiBookOpen,
  FiBriefcase,
  FiCheckSquare,
  FiCompass,
  FiFileText,
  FiGlobe,
  FiUsers,
} from 'react-icons/fi'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../context/AuthContext.jsx'
import { getRecentWorkspace } from '../utils/recentWorkspace.js'
import AccountMenu from '../components/ui/AccountMenu.jsx'
import GlobalSearchButton from '../components/ui/GlobalSearchButton.jsx'

const activeWorkAreas = [
  {
    name: 'Business',
    description: 'Research businesses and promising opportunities.',
    icon: FiBriefcase,
    to: '/businesses',
    color: 'bg-[#f8ded7] text-[#b9472e]',
    accent: 'bg-[#d96a50]',
    action: 'bg-[#fff0ec] text-[#b9472e] group-hover:bg-[#f8ded7]',
    hover: 'hover:border-[#e5a494]',
  },
  {
    name: 'Learning',
    description: 'Save knowledge, resources, and learning progress.',
    icon: FiBookOpen,
    to: '/learning',
    color: 'bg-[#e2ecf9] text-[#315f91]',
    accent: 'bg-[#628ab4]',
    action: 'bg-[#edf3f9] text-[#315f91] group-hover:bg-[#e2ecf9]',
    hover: 'hover:border-[#9eb9d5]',
  },
  {
    name: 'Contacts',
    description: 'Remember people and important relationship details.',
    icon: FiUsers,
    to: '/contacts',
    color: 'bg-[#e0eee6] text-[#2f684f]',
    accent: 'bg-[#5b8c73]',
    action: 'bg-[#edf5f0] text-[#2f684f] group-hover:bg-[#e0eee6]',
    hover: 'hover:border-[#9ab9a8]',
  },
  {
    name: 'Notes',
    description: 'Keep ideas, lists, decisions, and anything useful.',
    icon: FiFileText,
    to: '/notes',
    color: 'bg-[#eee8f7] text-[#654b91]',
    accent: 'bg-[#8268ad]',
    action: 'bg-[#f4f0fa] text-[#654b91] group-hover:bg-[#eee8f7]',
    hover: 'hover:border-[#b7a5d2]',
  },
   {
    name: 'Portfolio',
    description: 'Manage projects, skills, experience, and your public profile.',
    icon: FiGlobe,
    to: '/portfolio',
    color: 'bg-[#f7ead0] text-[#855816]',
    accent: 'bg-[#b88435]',
    action: 'bg-[#fbf2df] text-[#855816] group-hover:bg-[#f7ead0]',
    hover: 'hover:border-[#cfad77]',
  },
]

const plannedWorkAreas = [
  {
    name: 'Tasks',
    icon: FiCheckSquare,
    color: 'bg-[#f7ead0] text-[#855816]',
  },
  {
    name: 'Research',
    icon: FiCompass,
    color: 'bg-[#e9e2f5] text-[#5c478c]',
  },

   {
    name: 'Websites',
    icon: FiGlobe,
    color: 'bg-[#e9e2f5] text-[#5c478c]',
  },
]

const focusQuotes = [
  'Small progress every day builds meaningful results.',
  'Focus on one useful next step.',
  'Clear thinking turns research into better decisions.',
  'What you record today becomes useful insight tomorrow.',
  'Good work starts by choosing the right priority.',
  'Learn, organise, and move one idea forward.',
  'Consistent action creates visible progress.',
  'Make the next step simple enough to begin.',
  'Keep the signal, remove the noise, and continue.',
  'Turn today’s attention into tomorrow’s advantage.',
]

const workflowStages = [
  { latin: 'Veni', action: 'Capture', color: 'text-[#b9472e]', dot: 'bg-[#d96a50]', animation: 'home-workflow-veni' },
  { latin: 'Vidi', action: 'Understand', color: 'text-[#315f91]', dot: 'bg-[#628ab4]', animation: 'home-workflow-vidi' },
  { latin: 'Vici', action: 'Act', color: 'text-[#2f684f]', dot: 'bg-[#5b8c73]', animation: 'home-workflow-vici' },
]

function HomePage() {
  const { user } = useAuth()
  const [focusQuote] = useState(
    () => focusQuotes[Math.floor(Math.random() * focusQuotes.length)],
  )
  const recentWorkspace = getRecentWorkspace(user?._id || user?.id)
  const continuePage = recentWorkspace || {
    section: 'Business',
    page: 'Business workspace',
    path: '/businesses',
  }
  const continueArea = activeWorkAreas.find((area) => area.name === continuePage.section) || activeWorkAreas[0]
  const ContinueIcon = continueArea.icon

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[#f1f0ee] text-[#252525]">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <div className="home-journey-bg" aria-hidden="true">
        <span className="home-journey-sweep" />
        <svg className="home-journey-mark" viewBox="0 0 1200 720" preserveAspectRatio="none">
          <path className="home-v-base home-v-veni" d="M70 105 L220 600 L370 105" pathLength="1" />
          <path className="home-v-base home-v-vidi" d="M410 105 L600 600 L790 105" pathLength="1" />
          <path className="home-v-base home-v-vici" d="M830 105 L980 600 L1130 105" pathLength="1" />

          <path className="home-v-draw home-v-veni" d="M70 105 L220 600 L370 105" pathLength="1" />
          <path className="home-v-draw home-v-vidi" d="M410 105 L600 600 L790 105" pathLength="1" />
          <path className="home-v-draw home-v-vici" d="M830 105 L980 600 L1130 105" pathLength="1" />

          <circle className="home-v-particle home-v-particle-veni" r="4">
            <animateMotion path="M70 105 L220 600 L370 105" dur="12s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0.7;0.7;0" keyTimes="0;0.08;0.42;1" dur="12s" repeatCount="indefinite" />
          </circle>
          <circle className="home-v-particle home-v-particle-vidi" r="4">
            <animateMotion path="M410 105 L600 600 L790 105" begin="2s" dur="12s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0.7;0.7;0" keyTimes="0;0.08;0.42;1" begin="2s" dur="12s" repeatCount="indefinite" />
          </circle>
          <circle className="home-v-particle home-v-particle-vici" r="4">
            <animateMotion path="M830 105 L980 600 L1130 105" begin="4s" dur="12s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0.7;0.7;0" keyTimes="0;0.08;0.42;1" begin="4s" dur="12s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>

      <header className="relative z-[90] border-b border-[#e3e1de]/90 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:h-[68px] sm:px-8">
          <Link to="/home" className="flex items-center gap-2.5" aria-label="3V home">
            <img src="/favicon.svg" alt="" className="size-9 shrink-0 rounded-md" aria-hidden="true" />
            <span>
              <span className="block text-sm font-semibold leading-4 tracking-tight text-[#292929]">3V Workspace</span>
              <span className="block text-[9px] uppercase tracking-[0.12em] text-[#8a8a8a]">Veni · Vidi · Vici</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <GlobalSearchButton className="size-9" />
            <AccountMenu />
          </div>
        </div>
      </header>

      <main id="main-content" tabIndex="-1" className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col justify-start px-4 py-6 sm:min-h-[calc(100vh-4.25rem)] sm:px-8 sm:py-9 lg:justify-center">
        <section className="mx-auto w-full max-w-3xl text-center">
          <div className="mx-auto flex max-w-md items-center justify-center px-2" aria-label="3V workflow">
            {workflowStages.map(({ latin, action, color, dot, animation }, index) => (
              <div key={latin} className="contents">
                <div className={`home-workflow-stage min-w-0 shrink-0 text-center ${animation}`}>
                  <p className={`flex items-center justify-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] ${color}`}>
                    <span className={`home-workflow-dot size-1.5 rounded-full ${dot}`} aria-hidden="true" /> {latin}
                  </p>
                  <p className="mt-0.5 text-[10px] font-medium text-[#777]">{action}</p>
                </div>
                {index < workflowStages.length - 1 && (
                  <span className={`home-workflow-connector mx-3 h-px min-w-5 flex-1 sm:mx-5 ${index === 0 ? 'home-connector-veni-vidi' : 'home-connector-vidi-vici'}`} aria-hidden="true" />
                )}
              </div>
            ))}
          </div>
        </section>

        <Link
          to={continuePage.path}
          className={`group mt-6 flex items-center gap-3 rounded-[10px] border border-[#d8d5d1] bg-white p-3.5 shadow-[0_3px_14px_rgba(46,39,35,0.07)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgba(46,39,35,0.10)] focus:outline-none focus:ring-2 focus:ring-primary/25 sm:mt-7 sm:gap-4 sm:p-4 ${continueArea.hover}`}
        >
          <span className={`grid size-10 shrink-0 place-items-center rounded-md ${continueArea.color}`}>
            <ContinueIcon aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] font-medium uppercase tracking-[0.12em] text-[#8a8a8a]">
              {recentWorkspace ? 'Continue your work' : 'A useful place to begin'}
            </span>
            <span className="mt-0.5 block truncate text-sm font-semibold text-[#292929] sm:text-base">
              {continuePage.page}
            </span>
            <span className="mt-0.5 block text-xs text-[#777]">{continuePage.section}</span>
          </span>
          <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition ${continueArea.action}`}>
            Continue <FiArrowRight aria-hidden="true" />
          </span>
        </Link>

        <section className="mt-6 sm:mt-7" aria-labelledby="active-workspaces-title">
          <div className="mb-3 flex items-center justify-between gap-3 px-0.5">
            <h2 id="active-workspaces-title" className="text-xs font-semibold uppercase tracking-[0.12em] text-[#777]">
              Active workspaces
            </h2>
            <span className="text-[10px] text-[#999]">Select an area</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {activeWorkAreas.map(({ name, description, icon: Icon, to, color, accent, action, hover }) => (
              <Link
                key={name}
                to={to}
                className={`group relative overflow-hidden rounded-[10px] border border-[#d8d5d1] bg-white p-4 shadow-[0_4px_16px_rgba(46,39,35,0.08)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_9px_24px_rgba(46,39,35,0.12)] focus:outline-none focus:ring-2 focus:ring-primary/25 sm:min-h-[158px] sm:p-5 ${hover}`}
              >
                <span className={`absolute inset-y-4 left-0 w-1 rounded-r-full ${accent}`} aria-hidden="true" />
                <div className="flex min-w-0 items-start gap-3.5 sm:block">
                  <span className={`grid size-10 shrink-0 place-items-center rounded-md ${color}`}>
                    <Icon aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1 sm:mt-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-base font-semibold text-[#2b2b2b]">{name}</h3>
                      <span className={`grid size-8 shrink-0 place-items-center rounded-md transition ${action}`}>
                        <FiArrowRight className="transition group-hover:translate-x-0.5" aria-hidden="true" />
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm leading-5 text-[#666]">{description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-5" aria-labelledby="planned-workspaces-title">
          <h2 id="planned-workspaces-title" className="px-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-[#999]">
            Coming later
          </h2>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {plannedWorkAreas.map(({ name, icon: Icon, color }) => (
              <div key={name} className="flex min-w-0 flex-col items-start gap-2 rounded-md border border-[#dfdcd8] bg-[#f7f6f4] px-2.5 py-2.5 sm:flex-row sm:items-center sm:px-3">
                <span className={`grid size-7 shrink-0 place-items-center rounded ${color}`}>
                  <Icon className="text-xs" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-medium text-[#555]">{name}</span>
                  <span className="hidden text-[9px] uppercase tracking-wide text-[#999] sm:block">Planned</span>
                </span>
              </div>
            ))}
          </div>
        </section>

        <footer className="mx-auto mt-6 flex w-full max-w-2xl items-center justify-center gap-3 rounded-md bg-white/70 px-4 py-3 text-center shadow-[0_2px_10px_rgba(46,39,35,0.05)] sm:mt-7 sm:px-5">
          <span className="h-7 w-0.5 shrink-0 rounded-full bg-primary/60" aria-hidden="true" />
          <p className="text-sm leading-6 text-[#626262] sm:text-base">“{focusQuote}”</p>
        </footer>
      </main>
    </div>
  )
}

export default HomePage
