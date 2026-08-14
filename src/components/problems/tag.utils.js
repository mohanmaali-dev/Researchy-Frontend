export const SUGGESTED_TAGS = [
  'inventory',
  'whatsapp',
  'excel',
  'quotation',
  'billing',
  'delivery',
  'manual work',
  'follow-up',
  'purchasing',
  'stock management',
]

export const normalizeTag = (tag) => tag.trim().toLowerCase().replace(/\s+/g, ' ')

export const formatTag = (tag) => {
  const normalized = normalizeTag(tag)
  const specialNames = { whatsapp: 'WhatsApp', excel: 'Excel' }

  return (
    specialNames[normalized] ||
    normalized.replace(/\b\w/g, (character) => character.toUpperCase())
  )
}
