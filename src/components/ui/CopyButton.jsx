import { useEffect, useState } from 'react'
import { FiCheck, FiCopy } from 'react-icons/fi'

const copyWithFallback = async (value) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  textarea.remove()
}

function CopyButton({ value, label = 'Copy', showLabel = false, className = '' }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return undefined
    const timer = window.setTimeout(() => setCopied(false), 1500)
    return () => window.clearTimeout(timer)
  }, [copied])

  const handleCopy = async (event) => {
    event.preventDefault()
    event.stopPropagation()
    if (!value) return

    try {
      await copyWithFallback(String(value))
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={!value}
      className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md text-xs font-medium transition disabled:opacity-40 ${copied ? 'text-emerald-700' : 'text-[#777] hover:bg-[#efedeb] hover:text-[#333]'} ${className}`}
      aria-label={copied ? 'Copied' : label}
      title={copied ? 'Copied' : label}
    >
      {copied ? <FiCheck aria-hidden="true" /> : <FiCopy aria-hidden="true" />}
      {showLabel && <span>{copied ? 'Copied' : label}</span>}
    </button>
  )
}

export default CopyButton
