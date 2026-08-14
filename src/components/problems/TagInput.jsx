import { useState } from 'react'
import { FiPlus, FiX } from 'react-icons/fi'

import { formatTag, normalizeTag, SUGGESTED_TAGS } from './tag.utils.js'

function TagInput({ value = [], onChange }) {
  const [input, setInput] = useState('')

  const addTags = (rawTags) => {
    const normalizedTags = rawTags.map(normalizeTag).filter(Boolean)
    const nextTags = [...new Set([...value, ...normalizedTags])].slice(0, 20)

    onChange(nextTags)
    setInput('')
  }

  const commitInput = () => {
    if (input.trim()) addTags(input.split(','))
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      commitInput()
    } else if (event.key === 'Backspace' && !input && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  const removeTag = (tagToRemove) => {
    onChange(value.filter((tag) => tag !== tagToRemove))
  }

  const availableSuggestions = SUGGESTED_TAGS.filter((tag) => !value.includes(tag))

  return (
    <div className="mt-1.5">
      <div className="rounded-lg border border-slate-300 bg-white p-2 focus-within:border-primary focus-within:ring-3 focus-within:ring-primary/10">
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-primary-light py-1 pl-2.5 pr-1.5 text-sm font-semibold text-primary-dark">
              {formatTag(tag)}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="rounded-full p-0.5 hover:bg-primary/15"
                aria-label={`Remove ${formatTag(tag)} tag`}
              >
                <FiX aria-hidden="true" />
              </button>
            </span>
          ))}
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={commitInput}
            disabled={value.length >= 20}
            className="min-w-40 flex-1 border-0 px-1 py-1 text-sm outline-none placeholder:text-slate-400 disabled:bg-white"
            placeholder={value.length >= 20 ? 'Maximum 20 tags' : 'Type a tag and press Enter'}
          />
          {input.trim() && (
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={commitInput}
              className="rounded-md p-1.5 text-primary-dark hover:bg-primary-light"
              aria-label="Add tag"
            >
              <FiPlus aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
      {availableSuggestions.length > 0 && value.length < 20 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {availableSuggestions.map((tag) => (
            <button
              key={tag}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => addTags([tag])}
              className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-500 hover:border-primary/40 hover:text-primary-dark"
            >
              + {formatTag(tag)}
            </button>
          ))}
        </div>
      )}
      <p className="mt-2 text-xs font-normal text-slate-400">Use Enter or commas to add custom tags.</p>
    </div>
  )
}

export default TagInput
