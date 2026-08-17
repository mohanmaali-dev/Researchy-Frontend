import {
  FiArrowRight,
  FiBookOpen,
  FiBriefcase,
  FiCheckSquare,
  FiCompass,
  FiFileText,
  FiLogOut,
  FiUsers,
} from 'react-icons/fi'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext.jsx'

const workAreas = [
  {
    name: 'Business',
    description: 'Businesses, conversations, problems, opportunities, and follow-ups.',
    icon: FiBriefcase,
    to: '/businesses',
    color: 'bg-[#f8ded7] text-[#b9472e]',
    available: true,
  },
  {
    name: 'Learning',
    description: 'Learning notes, resources, progress, and useful takeaways.',
    icon: FiBookOpen,
    to: '/learning',
    color: 'bg-[#e2ecf9] text-[#315f91]',
    available: true,
  },
  {
    name: 'Contacts',
    description: 'People, companies, roles, notes, and relationship details.',
    icon: FiUsers,
    to: '/contacts',
    color: 'bg-[#e0eee6] text-[#2f684f]',
    available: true,
  },
  {
    name: 'Tasks',
    description: 'Personal tasks and the next actions that need your attention.',
    icon: FiCheckSquare,
    color: 'bg-[#f7ead0] text-[#855816]',
  },
  {
    name: 'Research',
    description: 'Research topics, useful sources, findings, and open questions.',
    icon: FiCompass,
    color: 'bg-[#e9e2f5] text-[#5c478c]',
  },
  {
    name: 'Notes',
    description: 'Quick notes, ideas, decisions, and things worth remembering.',
    icon: FiFileText,
    color: 'bg-[#e4e7e9] text-[#4c5761]',
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
  { latin: 'Veni', action: 'Capture', color: 'text-[#b9472e]', dot: 'bg-[#d96a50]' },
  { latin: 'Vidi', action: 'Understand', color: 'text-[#315f91]', dot: 'bg-[#628ab4]' },
  { latin: 'Vici', action: 'Act', color: 'text-[#2f684f]', dot: 'bg-[#5b8c73]' },
]

const formatTime = (date) =>
  date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  })

const formatFullDate = (date) =>
  date.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

function HomePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [currentTime, setCurrentTime] = useState(() => new Date())
  const [focusQuote] = useState(
    () => focusQuotes[Math.floor(Math.random() * focusQuotes.length)],
  )

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 30000)
    return () => window.clearInterval(timer)
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#f1f0ee] text-[#252525]">
      <header className="border-b border-[#e3e1de] bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:h-[68px] sm:px-8">
          <Link to="/home" className="flex items-center gap-2.5" aria-label="3V home">
            <img src="/favicon.svg" alt="" className="size-9 shrink-0 rounded-md" aria-hidden="true" />
            <span>
              <span className="block text-sm font-semibold leading-4 tracking-tight text-[#292929]">3V Workspace</span>
              <span className="block text-[9px] uppercase tracking-[0.12em] text-[#8a8a8a]">Veni · Vidi · Vici</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-[#333]">{user?.name || 'My workspace'}</p>
              <p className="text-xs text-[#8a8a8a]">Personal workspace</p>
            </div>
            <span className="grid size-9 place-items-center rounded-md bg-[#efefed] text-sm font-medium text-[#555]">
              {(user?.name || 'W').trim().charAt(0).toUpperCase()}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="grid size-9 place-items-center rounded-md text-[#777] transition hover:bg-red-50 hover:text-red-600"
              aria-label="Sign out"
              title="Sign out"
            >
              <FiLogOut aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col justify-center px-4 py-7 sm:min-h-[calc(100vh-4.25rem)] sm:px-8 sm:py-10">
        <section className="mx-auto w-full max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-[#777] sm:text-xs">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-30" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            Local time
          </div>
          <time dateTime={currentTime.toISOString()}>
            <span className="mt-2 block text-5xl font-semibold tabular-nums tracking-[-0.055em] text-[#202020] sm:text-7xl">
              {formatTime(currentTime)}
            </span>
            <span className="mt-2 block text-base font-medium text-[#444] sm:text-lg">
              {formatFullDate(currentTime)}
            </span>
          </time>

          <div className="mx-auto mt-5 flex max-w-lg items-center justify-center px-2" aria-label="3V workflow">
            {workflowStages.map(({ latin, action, color, dot }, index) => (
              <div key={latin} className="contents">
                <div className="min-w-0 shrink-0 text-center">
                  <p className={`flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] ${color}`}>
                    <span className={`size-1.5 rounded-full ${dot}`} aria-hidden="true" /> {latin}
                  </p>
                  <p className="mt-0.5 text-[10px] font-medium text-[#777] sm:text-xs">{action}</p>
                </div>
                {index < workflowStages.length - 1 && (
                  <span className="mx-3 h-px min-w-6 flex-1 bg-[#d8d4d0] sm:mx-6" aria-hidden="true" />
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-7 border-t border-[#dfdcd8] pt-7 sm:mt-9 sm:pt-9" aria-label="Workspaces">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {workAreas.map(({ name, description, icon: Icon, to, color, available }) => {
            const content = (
              <div className="flex min-w-0 items-start gap-4 sm:block">
                <span className={`grid size-10 shrink-0 place-items-center rounded-md ${color}`}>
                    <Icon aria-hidden="true" />
                </span>

                <div className="min-w-0 flex-1 sm:mt-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-base font-semibold text-[#2b2b2b]">{name}</h3>
                    {available ? (
                      <span className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition group-hover:bg-primary-dark">
                        Open <FiArrowRight aria-hidden="true" />
                      </span>
                    ) : (
                      <span className="rounded bg-[#e9e8e5] px-2 py-1 text-[10px] font-medium text-[#6f6f6f]">
                        Soon
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm leading-5 text-[#555]">{description}</p>
                </div>
              </div>
            )

            return available ? (
              <Link
                key={name}
                to={to}
                className="group cursor-pointer rounded-[10px] border-2 border-[#dd765d] bg-[#fffaf8] p-4 shadow-[0_7px_20px_rgba(77,54,46,0.13)] transition duration-200 hover:-translate-y-1 hover:border-[#cb5d43] hover:shadow-[0_12px_28px_rgba(77,54,46,0.18)] focus:outline-none focus:ring-3 focus:ring-[#efad9c] focus:ring-offset-2 sm:min-h-[172px] sm:p-5"
              >
                {content}
              </Link>
            ) : (
              <article
                key={name}
                className="rounded-[10px] border border-[#bdb8b3] bg-white p-4 shadow-[0_5px_16px_rgba(46,39,35,0.10)] sm:min-h-[172px] sm:p-5"
              >
                {content}
              </article>
            )
          })}
          </div>
        </section>

        <footer className="mx-auto mt-6 flex w-full max-w-2xl items-center justify-center gap-3 rounded-md bg-white/75 px-4 py-3 text-center shadow-[0_2px_10px_rgba(46,39,35,0.06)] sm:mt-8 sm:px-5">
          <span className="h-7 w-0.5 shrink-0 rounded-full bg-primary/60" aria-hidden="true" />
          <p className="text-sm leading-6 text-[#626262] sm:text-base">“{focusQuote}”</p>
        </footer>
      </main>
    </div>
  )
}

export default HomePage
