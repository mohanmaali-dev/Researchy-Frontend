export const TOPIC_PRIORITIES = ['Low', 'Medium', 'High']
export const TOPIC_STATUSES = ['Want to Learn', 'Learning', 'Learned']
export const RESOURCE_TYPES = ['Article', 'Video', 'Book', 'Course', 'Documentation', 'Podcast', 'Other']
export const RESOURCE_STATUSES = ['Saved', 'In Progress', 'Completed']
export const PRACTICE_STATUSES = ['Planned', 'Completed']
export const QUESTION_STATUSES = ['Unanswered', 'Partially Understood', 'Answered']

export const todayValue = () => {
  const today = new Date()
  return new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

export const parseTags = (value) =>
  [...new Set(String(value || '').split(',').map((tag) => tag.trim().toLowerCase()).filter(Boolean))]

export const formatTag = (tag) => String(tag).replace(/\b\w/g, (letter) => letter.toUpperCase())
