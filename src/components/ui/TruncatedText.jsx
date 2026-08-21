import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

function TruncatedText({ value, className = '', emptyLabel = '—' }) {
  const textRef = useRef(null)
  const tooltipId = useId()
  const [tooltip, setTooltip] = useState(null)
  const text = String(value || '').trim()

  const openTooltip = () => {
    const element = textRef.current
    if (!text || !element || element.scrollWidth <= element.clientWidth) return
    const rect = element.getBoundingClientRect()
    const maxWidth = Math.min(352, window.innerWidth - 24)
    const showAbove = rect.bottom + 100 > window.innerHeight
    setTooltip({
      left: Math.max(12, Math.min(rect.left, window.innerWidth - maxWidth - 12)),
      maxWidth,
      top: showAbove ? rect.top - 8 : rect.bottom + 8,
      showAbove,
    })
  }

  useEffect(() => {
    if (!tooltip) return undefined
    const close = () => setTooltip(null)
    window.addEventListener('resize', close)
    window.addEventListener('scroll', close, true)
    return () => {
      window.removeEventListener('resize', close)
      window.removeEventListener('scroll', close, true)
    }
  }, [tooltip])

  return (
    <>
      <span
        ref={textRef}
        tabIndex={text ? 0 : undefined}
        onMouseEnter={openTooltip}
        onMouseLeave={() => setTooltip(null)}
        onFocus={openTooltip}
        onBlur={() => setTooltip(null)}
        aria-describedby={tooltip ? tooltipId : undefined}
        className={`block min-w-0 truncate outline-none ${className}`}
      >
        {text || emptyLabel}
      </span>
      {tooltip && createPortal(
        <span
          id={tooltipId}
          role="tooltip"
          className="pointer-events-none fixed z-[700] rounded-md bg-[#252525] px-3 py-2 text-xs font-normal leading-5 text-white shadow-[0_10px_30px_rgba(0,0,0,0.24)]"
          style={{
            left: tooltip.left,
            top: tooltip.top,
            maxWidth: tooltip.maxWidth,
            transform: tooltip.showAbove ? 'translateY(-100%)' : undefined,
          }}
        >
          {text}
        </span>,
        document.body,
      )}
    </>
  )
}

export default TruncatedText
