import { useEffect, useMemo, useRef, useState } from 'react'
import { FiArrowRight, FiLoader, FiSearch, FiX } from 'react-icons/fi'
import { useLocation, useNavigate } from 'react-router-dom'

import * as searchService from '../../services/search.service.js'

const MAXIMUM_OPTIONS = 10

function GlobalSearchButton({ className = '' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const rootRef = useRef(null)
  const mobileInputRef = useRef(null)
  const [query, setQuery] = useState('')
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [desktopOpen, setDesktopOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const options = useMemo(
    () => groups.flatMap((group) => group.results.map((item) => ({ ...item, group: group.label }))).slice(0, MAXIMUM_OPTIONS),
    [groups],
  )

  useEffect(() => {
    let active = true
    const cleanedQuery = query.trim()

    if (cleanedQuery.length < 2) {
      setGroups([])
      setLoading(false)
      setError('')
      return () => { active = false }
    }

    setLoading(true)
    setError('')
    const timer = window.setTimeout(() => {
      searchService.search(cleanedQuery)
        .then((response) => { if (active) setGroups(response.data.groups || []) })
        .catch((requestError) => { if (active) setError(requestError.message) })
        .finally(() => { if (active) setLoading(false) })
    }, 250)

    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [query])

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!rootRef.current?.contains(event.target)) setDesktopOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick)
  }, [])

  useEffect(() => {
    setDesktopOpen(false)
    setMobileOpen(false)
    setQuery('')
    setGroups([])
  }, [location.pathname])

  useEffect(() => {
    if (mobileOpen) requestAnimationFrame(() => mobileInputRef.current?.focus())
  }, [mobileOpen])

  useEffect(() => {
    if (!mobileOpen) return undefined
    document.body.style.overflow = 'hidden'
    document.body.classList.add('global-search-open')
    return () => {
      document.body.style.overflow = ''
      document.body.classList.remove('global-search-open')
    }
  }, [mobileOpen])

  useEffect(() => setActiveIndex(0), [options.length, query])

  const chooseOption = (option) => {
    if (!option) return
    setDesktopOpen(false)
    setMobileOpen(false)
    setQuery('')
    setGroups([])
    navigate(option.path)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setDesktopOpen(false)
      setMobileOpen(false)
      return
    }
    if (!options.length) return
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const direction = event.key === 'ArrowDown' ? 1 : -1
      setActiveIndex((current) => (current + direction + options.length) % options.length)
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      chooseOption(options[activeIndex])
    }
  }

  const resultList = (id) => (
    <div id={id} role="listbox" aria-label="Search results" className="min-h-40 max-h-[min(32rem,72dvh)] overflow-y-auto p-2">
      {query.trim().length < 2 ? (
        <p className="px-3 py-5 text-center text-xs leading-5 text-[#888]">Type at least two characters to search.</p>
      ) : loading ? (
        <p className="flex items-center justify-center gap-2 px-3 py-5 text-xs text-[#777]"><FiLoader className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> Searching...</p>
      ) : error ? (
        <p className="px-3 py-5 text-center text-xs leading-5 text-red-600">{error}</p>
      ) : !options.length ? (
        <p className="px-3 py-5 text-center text-xs leading-5 text-[#777]">No matching items found.</p>
      ) : options.map((option, index) => (
        <button
          key={`${option.group}-${option.id}`}
          type="button"
          role="option"
          aria-selected={index === activeIndex}
          onMouseEnter={() => setActiveIndex(index)}
          onClick={() => chooseOption(option)}
          className={`flex w-full min-w-0 items-center gap-3 rounded-md px-3 py-2.5 text-left transition ${index === activeIndex ? 'bg-[#f2f2f1]' : 'hover:bg-[#f7f7f7]'}`}
        >
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-[#292929]">{option.title}</span>
            {option.subtitle && <span className="mt-0.5 block truncate text-xs text-[#888]">{option.subtitle}</span>}
          </span>
          <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-[#999]">{option.group}</span>
          <FiArrowRight className="shrink-0 text-[#aaa]" aria-hidden="true" />
        </button>
      ))}
    </div>
  )

  return (
    <div ref={rootRef} className="relative shrink-0">
      <div className="relative hidden w-64 lg:block xl:w-80">
        <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888]" aria-hidden="true" />
        <input
          value={query}
          onFocus={() => setDesktopOpen(true)}
          onChange={(event) => { setQuery(event.target.value); setDesktopOpen(true) }}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-expanded={desktopOpen}
          aria-controls="desktop-global-search-results"
          aria-autocomplete="list"
          autoComplete="off"
          placeholder="Search workspace"
          className="h-10 w-full rounded-md border border-[#e1dfdc] bg-[#f7f7f7] pl-10 pr-9 text-sm text-[#292929] outline-none transition placeholder:text-[#999] focus:border-[#b9b5b0] focus:bg-white focus:ring-2 focus:ring-[#628ab4]/10"
        />
        {query && <button type="button" onClick={() => { setQuery(''); setGroups([]) }} className="absolute right-1.5 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded text-[#888] hover:bg-[#ecebea]" aria-label="Clear search"><FiX aria-hidden="true" /></button>}
        {desktopOpen && <div className="absolute right-0 top-[calc(100%+0.5rem)] z-[200] w-[34rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-[#e1dfdc] bg-white shadow-[0_22px_65px_rgba(40,35,31,0.2)]">{resultList('desktop-global-search-results')}</div>}
      </div>

      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className={`grid size-10 place-items-center rounded-md text-[#666] transition hover:bg-[#edf3f9] hover:text-[#315f91] lg:hidden ${className}`}
        aria-label="Search workspace"
        title="Search workspace"
      >
        <FiSearch aria-hidden="true" />
      </button>

      {mobileOpen && (
        <>
          <button type="button" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-[220] bg-black/30 backdrop-blur-[2px] lg:hidden" aria-label="Close search" />
          <section className="fixed inset-x-2 top-2 z-[230] overflow-hidden rounded-lg bg-white shadow-[0_20px_70px_rgba(0,0,0,0.24)] lg:hidden">
            <div className="flex items-center gap-2 border-b border-[#ece9e5] p-2.5">
              <FiSearch className="ml-1 shrink-0 text-[#777]" aria-hidden="true" />
              <input
                ref={mobileInputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handleKeyDown}
                role="combobox"
                aria-expanded="true"
                aria-controls="mobile-global-search-results"
                aria-autocomplete="list"
                autoComplete="off"
                placeholder="Search workspace"
                className="h-11 min-w-0 flex-1 bg-transparent text-base text-[#292929] outline-none placeholder:text-[#999]"
              />
              {query && <button type="button" onClick={() => { setQuery(''); setGroups([]); mobileInputRef.current?.focus() }} className="grid size-10 shrink-0 place-items-center rounded-md text-[#777] hover:bg-[#f2f2f1]" aria-label="Clear search"><FiX aria-hidden="true" /></button>}
              <button type="button" onClick={() => setMobileOpen(false)} className="shrink-0 rounded-md bg-[#f2f2f1] px-3 py-2.5 text-xs font-semibold text-[#555]">Cancel</button>
            </div>
            {resultList('mobile-global-search-results')}
          </section>
        </>
      )}
    </div>
  )
}

export default GlobalSearchButton
