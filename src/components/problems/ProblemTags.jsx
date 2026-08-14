import { formatTag } from './tag.utils.js'

function ProblemTags({ tags = [], compact = false }) {
  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className={`rounded-full bg-primary-light font-semibold text-primary-dark ${
            compact ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
          }`}
        >
          {formatTag(tag)}
        </span>
      ))}
    </div>
  )
}

export default ProblemTags
