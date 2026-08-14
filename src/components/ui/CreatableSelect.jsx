import { useEffect, useMemo, useRef, useState } from 'react'
import { useController } from 'react-hook-form'
import { FiCheck, FiChevronDown, FiPlus, FiSearch } from 'react-icons/fi'

const cleanValue = (value) => value.trim().replace(/\s+/g, ' ')
const normalizeValue = (value) => cleanValue(value).toLocaleLowerCase()

function CreatableSelect({
  name,
  control,
  options = [],
  placeholder = 'Choose an option',
  searchPlaceholder = 'Search or add a new option',
  disabled = false,
  className = '',
}) {
  const { field } = useController({ name, control })
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef(null)
  const buttonRef = useRef(null)
  const searchRef = useRef(null)

  const uniqueOptions = useMemo(() => {
    const values = new Map()

    options.forEach((option) => {
      const cleanedOption = cleanValue(String(option ?? ''))
      const normalizedOption = normalizeValue(cleanedOption)
      if (cleanedOption && !values.has(normalizedOption)) values.set(normalizedOption, cleanedOption)
    })

    const currentValue = cleanValue(String(field.value ?? ''))
    if (currentValue && !values.has(normalizeValue(currentValue))) {
      values.set(normalizeValue(currentValue), currentValue)
    }

    return [...values.values()].sort((first, second) =>
      first.localeCompare(second, undefined, { sensitivity: 'base' }),
    )
  }, [field.value, options])

  const cleanedQuery = cleanValue(query)
  const normalizedQuery = normalizeValue(query)
  const exactOption = uniqueOptions.find((option) => normalizeValue(option) === normalizedQuery)
  const filteredOptions = uniqueOptions.filter((option) =>
    normalizeValue(option).includes(normalizedQuery),
  )
  const canCreate = cleanedQuery && !exactOption

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false)
        setQuery('')
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  useEffect(() => {
    if (open) requestAnimationFrame(() => searchRef.current?.focus())
  }, [open])

  const closeMenu = (restoreFocus = false) => {
    setOpen(false)
    setQuery('')
    if (restoreFocus) requestAnimationFrame(() => buttonRef.current?.focus())
  }

  const selectValue = (value) => {
    field.onChange(value)
    field.onBlur()
    closeMenu(true)
  }

  const handleSearchKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      closeMenu(true)
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      if (exactOption) selectValue(exactOption)
      else if (canCreate) selectValue(cleanedQuery)
      else if (filteredOptions[0]) selectValue(filteredOptions[0])
    }
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        ref={(node) => {
          buttonRef.current = node
          field.ref(node)
        }}
        type="button"
        name={field.name}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onBlur={field.onBlur}
        onClick={() => {
          setOpen((current) => !current)
          setQuery('')
        }}
        className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-[14px] border px-4 py-3 text-left text-sm outline-none transition ${
          open
            ? 'border-primary bg-white ring-4 ring-primary/10'
            : 'border-[#e5e5e5] bg-[#f7f7f7] hover:border-[#d5d5d5] hover:bg-[#fafafa]'
        } ${disabled ? 'cursor-not-allowed bg-[#efefef] text-[#8a8a8a]' : 'text-[#171717]'}`}
      >
        <span className={`truncate ${field.value ? '' : 'text-[#999]'}`}>
          {field.value || placeholder}
        </span>
        <FiChevronDown
          className={`shrink-0 text-primary transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      <div
        className={`absolute z-50 mt-2 w-full origin-top overflow-hidden rounded-[16px] border border-[#e5e5e5] bg-white p-2 shadow-[0_18px_50px_rgba(0,0,0,0.14)] transition duration-150 ${
          open
            ? 'visible translate-y-0 scale-100 opacity-100'
            : 'invisible -translate-y-1 scale-[0.98] opacity-0'
        }`}
      >
        <div className="relative mb-1.5">
          <FiSearch
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999]"
            aria-hidden="true"
          />
          <input
            ref={searchRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder={searchPlaceholder}
            className="w-full rounded-xl border border-[#e5e5e5] bg-[#f7f7f7] py-2.5 pl-10 pr-3 text-sm font-normal text-[#171717] outline-none transition placeholder:text-[#999] focus:border-primary focus:bg-white focus:ring-3 focus:ring-primary/10"
          />
        </div>

        <div role="listbox" aria-label={name} className="max-h-56 overflow-y-auto">
          {filteredOptions.map((option) => {
            const selected = normalizeValue(option) === normalizeValue(String(field.value ?? ''))

            return (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => selectValue(option)}
                className={`flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-normal transition ${
                  selected
                    ? 'bg-primary-light text-primary-dark ring-1 ring-inset ring-primary/10'
                    : 'text-[#333] hover:bg-[#f6f6f6]'
                }`}
              >
                <span className="truncate">{option}</span>
                {selected && <FiCheck className="shrink-0" aria-hidden="true" />}
              </button>
            )
          })}

          {canCreate && (
            <button
              type="button"
              onClick={() => selectValue(cleanedQuery)}
              className="mt-1 flex w-full items-center gap-2 rounded-xl bg-primary-light px-3.5 py-2.5 text-left text-sm font-normal text-primary-dark transition hover:bg-[#ffebe5]"
            >
              <FiPlus className="shrink-0" aria-hidden="true" />
              <span className="truncate">Add “{cleanedQuery}”</span>
            </button>
          )}

          {!filteredOptions.length && !canCreate && (
            <p className="px-3.5 py-4 text-center text-sm font-normal text-[#777]">
              Type a new option to add it.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default CreatableSelect
