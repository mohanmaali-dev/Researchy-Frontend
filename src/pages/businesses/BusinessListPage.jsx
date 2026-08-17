import { useCallback, useEffect, useState } from 'react'
import { FiArrowRight, FiBriefcase, FiChevronDown, FiChevronLeft, FiChevronRight, FiMapPin, FiPlus, FiSearch } from 'react-icons/fi'
import { Link, useSearchParams } from 'react-router-dom'

import { ErrorState, TableLoadingState } from '../../components/businesses/PageState.jsx'
import StatusBadge from '../../components/businesses/StatusBadge.jsx'
import * as businessService from '../../services/business.service.js'

const STATUS_FILTERS = ['All', 'Prospect', 'Contacted', 'Visited', 'Active', 'Inactive']
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'updated', label: 'Last updated' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'name', label: 'Name A–Z' },
]

function FilterSelect({ label, value, onChange, options, className = '' }) {
  return (
    <label className={`block min-w-0 ${className}`}>
      <span className="sr-only">{label}</span>
      <span className="relative block">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-full appearance-none rounded-md border border-[#d9d6d2] bg-white py-2 pl-3 pr-9 text-xs text-[#333] outline-none transition hover:border-[#c9c4bf] focus:border-primary focus:ring-2 focus:ring-primary/10 sm:text-sm"
          aria-label={label}
        >
          {options.map((option) => {
            const optionValue = typeof option === 'object' ? option.value : option
            const optionLabel = typeof option === 'object' ? option.label : option
            return <option key={optionValue} value={optionValue}>{optionLabel}</option>
          })}
        </select>
        <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#777]" aria-hidden="true" />
      </span>
    </label>
  )
}

function BusinessListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [businesses, setBusinesses] = useState([])
  const [businessOptions, setBusinessOptions] = useState({ businessTypes: [], industries: [] })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || 'All'
  const businessType = searchParams.get('type') || 'All'
  const industry = searchParams.get('industry') || 'All'
  const sort = searchParams.get('sort') || 'newest'
  const pageValue = Number(searchParams.get('page'))
  const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1
  const hasFilters = Boolean(
    search || status !== 'All' || businessType !== 'All' || industry !== 'All',
  )

  const loadBusinesses = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const result = await businessService.getBusinesses({
        page,
        limit: 10,
        search,
        status,
        type: businessType,
        industry,
        sort,
      })
      setBusinesses(result.data)
      setPagination(result.pagination)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [businessType, industry, page, search, sort, status])

  useEffect(() => {
    const delay = search ? 300 : 0
    const timeout = window.setTimeout(loadBusinesses, delay)
    return () => window.clearTimeout(timeout)
  }, [loadBusinesses, search])

  useEffect(() => {
    businessService
      .getBusinessOptions()
      .then((result) => setBusinessOptions(result.data))
      .catch(() => {})
  }, [])

  const updateFilter = (key, value) => {
    const nextParams = new URLSearchParams(searchParams)

    if (
      !value ||
      value === 'All' ||
      (key === 'sort' && value === 'newest') ||
      (key === 'page' && Number(value) <= 1)
    ) nextParams.delete(key)
    else nextParams.set(key, value)

    if (key !== 'page') nextParams.delete('page')

    setSearchParams(nextParams, { replace: true })
  }

  const clearFilters = () => setSearchParams({}, { replace: true })

  return (
    <main className="w-full px-1 pb-3 pt-1 sm:px-2">
      <section className="rounded-[24px] bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-[#888]">Business workspace</p>
            <h1 className="mt-1 text-3xl tracking-[-0.035em] text-[#171717] sm:text-4xl">Businesses</h1>
            <p className="mt-2 text-sm leading-6 text-[#707070]">
              Find a business or add a new one after a visit or research session.
            </p>
          </div>
          <Link
            to="/businesses/new"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-white hover:bg-primary-dark"
          >
            <FiPlus aria-hidden="true" /> Add business
          </Link>
        </div>

        <div className="mt-6 rounded-[20px] bg-[#f7f7f7] p-3">
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-[minmax(15rem,1.6fr)_repeat(4,minmax(8rem,0.7fr))]">
            <label className="col-span-2 flex h-10 items-center gap-3 rounded-md border border-[#d9d6d2] bg-white px-3 text-[#777] transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 lg:col-span-1">
              <FiSearch className="shrink-0" aria-hidden="true" />
              <input
                value={search}
                onChange={(event) => updateFilter('search', event.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm text-[#222] outline-none placeholder:text-[#999]"
                placeholder="Search businesses"
                aria-label="Search businesses"
              />
            </label>
            <FilterSelect
              label="Status"
              value={status}
              onChange={(value) => updateFilter('status', value)}
              options={[
                { value: 'All', label: 'All statuses' },
                ...STATUS_FILTERS.slice(1),
              ]}
            />
            <FilterSelect
              label="Business type"
              value={businessType}
              onChange={(value) => updateFilter('type', value)}
              options={[{ value: 'All', label: 'All types' }, ...businessOptions.businessTypes]}
            />
            <FilterSelect
              label="Industry"
              value={industry}
              onChange={(value) => updateFilter('industry', value)}
              options={[{ value: 'All', label: 'All industries' }, ...businessOptions.industries]}
            />
            <FilterSelect
              label="Sort by"
              value={sort}
              onChange={(value) => updateFilter('sort', value)}
              options={SORT_OPTIONS}
            />
          </div>
        </div>
      </section>

      <section className="mt-3 rounded-[24px] bg-white p-4 sm:p-6">
        {error && businesses.length > 0 && (
          <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-normal text-red-600">
            {error}
          </p>
        )}

        {loading ? (
          <TableLoadingState
            label="Loading businesses..."
            headers={['Business', 'Type', 'Industry', 'Location', 'Status', '']}
            template="minmax(12rem, 1.5fr) 1fr 1fr 1.2fr auto 2rem"
            minWidth="820px"
            cellVariants={['line', 'line', 'line', 'line', 'pill', 'icon']}
          />
        ) : error && businesses.length === 0 ? (
          <ErrorState message={error} onRetry={loadBusinesses} />
        ) : businesses.length === 0 && !hasFilters ? (
          <div className="px-6 py-16 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary-light text-primary-dark">
              <FiBriefcase aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-lg">No businesses yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#777]">
              Add the first business you visited or researched.
            </p>
            <Link to="/businesses/new" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary-dark">
              <FiPlus aria-hidden="true" /> Add business
            </Link>
          </div>
        ) : businesses.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <FiSearch className="mx-auto text-2xl text-[#aaa]" aria-hidden="true" />
            <h2 className="mt-4 text-lg">No matching businesses</h2>
            <p className="mt-2 text-sm text-[#777]">Try another search, filter, or sort option.</p>
            <button type="button" onClick={clearFilters} className="mt-4 text-sm font-medium text-primary-dark">
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-1 pb-4">
              <p className="text-sm font-medium text-[#333]">
                {pagination.totalItems === 0
                  ? 'No businesses'
                  : `${(pagination.page - 1) * pagination.limit + 1}–${Math.min(
                      pagination.page * pagination.limit,
                      pagination.totalItems,
                    )} of ${pagination.totalItems} businesses`}
              </p>
              {(search || status !== 'All' || businessType !== 'All' || industry !== 'All' || sort !== 'newest') && (
                <button type="button" onClick={clearFilters} className="text-xs font-medium text-[#777] hover:text-primary-dark">
                  Clear filters
                </button>
              )}
            </div>

            <div className="hidden overflow-hidden rounded-[18px] bg-[#fafafa] md:block">
              <div className="grid grid-cols-[minmax(12rem,1.5fr)_1fr_1fr_1.2fr_auto_auto] gap-4 px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-[#999]">
                <span>Business</span>
                <span>Type</span>
                <span>Industry</span>
                <span>Location</span>
                <span>Status</span>
                <span className="w-8" />
              </div>
              <div className="space-y-px bg-[#ededeb]">
                {businesses.map((business) => (
                  <Link
                    key={business._id}
                    to={`/businesses/${business._id}`}
                    className="group grid grid-cols-[minmax(12rem,1.5fr)_1fr_1fr_1.2fr_auto_auto] items-center gap-4 bg-white px-5 py-4 transition hover:bg-[#fffaf8]"
                  >
                    <span className="truncate text-sm font-medium text-[#222]">{business.companyName}</span>
                    <span className="truncate text-sm text-[#666]">{business.businessType}</span>
                    <span className="truncate text-sm text-[#666]">{business.industry}</span>
                    <span className="flex min-w-0 items-center gap-1.5 truncate text-sm text-[#666]">
                      <FiMapPin className="shrink-0 text-[#999]" aria-hidden="true" /> {business.location}
                    </span>
                    <StatusBadge status={business.status} />
                    <FiArrowRight className="text-[#aaa] transition group-hover:translate-x-0.5 group-hover:text-primary-dark" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-3 md:hidden">
              {businesses.map((business) => (
                <Link key={business._id} to={`/businesses/${business._id}`} className="block rounded-[18px] bg-[#f7f7f7] p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-lg text-[#222]">{business.companyName}</h2>
                      <p className="mt-1 text-sm text-[#777]">{business.businessType}</p>
                    </div>
                    <StatusBadge status={business.status} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-[#666]">
                    <span>{business.industry}</span>
                    <span className="inline-flex items-center gap-1.5"><FiMapPin aria-hidden="true" /> {business.location}</span>
                  </div>
                </Link>
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <nav className="mt-5 flex items-center justify-between border-t border-[#e8e5e1] pt-4" aria-label="Business pages">
                <button
                  type="button"
                  onClick={() => updateFilter('page', String(pagination.page - 1))}
                  disabled={!pagination.hasPreviousPage}
                  className="inline-flex items-center gap-1.5 rounded-md border border-[#d8d4d0] bg-white px-3 py-2 text-xs font-medium text-[#444] transition hover:bg-[#f7f7f7] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FiChevronLeft aria-hidden="true" /> Previous
                </button>
                <span className="text-xs text-[#777]">
                  Page <strong className="font-medium text-[#333]">{pagination.page}</strong> of {pagination.totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => updateFilter('page', String(pagination.page + 1))}
                  disabled={!pagination.hasNextPage}
                  className="inline-flex items-center gap-1.5 rounded-md border border-[#d8d4d0] bg-white px-3 py-2 text-xs font-medium text-[#444] transition hover:bg-[#f7f7f7] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next <FiChevronRight aria-hidden="true" />
                </button>
              </nav>
            )}
          </>
        )}
      </section>
    </main>
  )
}

export default BusinessListPage
