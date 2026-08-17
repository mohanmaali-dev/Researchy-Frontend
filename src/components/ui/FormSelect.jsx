import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useController } from 'react-hook-form'
import { FiCheck, FiChevronDown } from 'react-icons/fi'

const normalizeOptions = (options) =>
  options.map((option) =>
    typeof option === 'object' ? option : { value: option, label: option },
  )

function FormSelect({ name, control, options, disabled = false, onValueChange, className = '' }) {
  const { field } = useController({ name, control })
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const rootRef = useRef(null)
  const buttonRef = useRef(null)
  const listboxId = useId()
  const normalizedOptions = useMemo(() => normalizeOptions(options), [options])
  const selectedIndex = normalizedOptions.findIndex(
    (option) => String(option.value) === String(field.value ?? ''),
  )
  const selectedOption = normalizedOptions[selectedIndex]

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  useEffect(() => {
    if (open) setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0)
  }, [open, selectedIndex])

  const selectOption = (option) => {
    field.onChange(option.value)
    field.onBlur()
    onValueChange?.(option.value)
    setOpen(false)
    buttonRef.current?.focus()
  }

  const handleKeyDown = (event) => {
    if (disabled) return
    if (!normalizedOptions.length) return

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!open) {
        setOpen(true)
        return
      }

      const direction = event.key === 'ArrowDown' ? 1 : -1
      setActiveIndex((current) =>
        (current + direction + normalizedOptions.length) % normalizedOptions.length,
      )
    } else if ((event.key === 'Enter' || event.key === ' ') && open) {
      event.preventDefault()
      selectOption(normalizedOptions[activeIndex])
    } else if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
      event.preventDefault()
      setOpen(true)
    } else if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  const handleBlur = () => {
    field.onBlur()
    requestAnimationFrame(() => {
      if (!rootRef.current?.contains(document.activeElement)) setOpen(false)
    })
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
        aria-controls={listboxId}
        aria-label={name.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase())}
        onBlur={handleBlur}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={handleKeyDown}
        className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-md border px-4 py-3 text-left text-sm outline-none transition ${
          open
            ? 'border-primary bg-white ring-4 ring-primary/10'
            : 'border-[#e5e5e5] bg-[#f7f7f7] hover:border-[#d5d5d5] hover:bg-[#fafafa]'
        } ${disabled ? 'cursor-not-allowed bg-[#efefef] text-[#8a8a8a]' : 'text-[#171717]'}`}
      >
        <span className={`truncate ${selectedOption?.value === '' ? 'text-[#999]' : ''}`}>
          {selectedOption?.label || 'Select an option'}
        </span>
        <FiChevronDown className={`shrink-0 text-primary transition-transform duration-200 ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      <div className={`absolute z-50 mt-2 w-full origin-top overflow-hidden rounded-lg border border-[#e5e5e5] bg-white p-1.5 shadow-[0_18px_50px_rgba(0,0,0,0.14)] transition duration-150 ${open ? 'visible translate-y-0 scale-100 opacity-100' : 'invisible -translate-y-1 scale-[0.98] opacity-0'}`}>
        <div id={listboxId} role="listbox" aria-label={name.replace(/([A-Z])/g, ' $1')} className="max-h-60 overflow-y-auto">
          {normalizedOptions.map((option, index) => {
            const selected = String(option.value) === String(field.value ?? '')
            const active = index === activeIndex

            return (
              <button
                key={`${option.value}:${option.label}`}
                type="button"
                role="option"
                aria-selected={selected}
                tabIndex={-1}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectOption(option)}
                className={`flex w-full items-center justify-between gap-3 rounded-md px-3.5 py-2.5 text-left text-sm transition ${
                  selected
                    ? 'bg-primary-light font-semibold text-primary-dark ring-1 ring-inset ring-primary/10'
                    : active
                      ? 'bg-primary-light text-primary-dark'
                      : 'text-[#333] hover:bg-[#f6f6f6]'
                }`}
              >
                <span className="truncate">{option.label}</span>
                {selected && <FiCheck className="shrink-0" aria-hidden="true" />}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default FormSelect
