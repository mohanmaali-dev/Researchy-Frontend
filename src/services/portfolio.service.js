import { request } from './api.js'

const queryString = (params = {}) => {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, value)
  })
  return query.toString()
}

export const getPortfolioDashboard = () => request('get', '/portfolio/dashboard')
export const getPortfolioProfile = () => request('get', '/portfolio/profile')
export const getPublicPortfolio = (profileId) => request('get', `/portfolio/public/${profileId}`)
export const bulkDeletePortfolio = (entity, ids) => request('post', '/portfolio/bulk-delete', { entity, ids })

const profileFormData = (data, imageFile, resumeFile) => {
  const formData = new FormData()
  const fields = [
    'fullName', 'professionalTitle', 'shortBio', 'about', 'email', 'phone', 'location',
    'profileImageUrl', 'resumeUrl', 'githubUrl', 'linkedinUrl', 'instagramUrl', 'xUrl',
    'whatsappNumber', 'whatsappMessage', 'availabilityText',
    'showGithub', 'showLinkedin', 'showInstagram', 'showX',
  ]
  fields.forEach((field) => {
    if (data[field] !== undefined) formData.append(field, data[field] ?? '')
  })
  if (data.profileImageAction === 'remove') formData.append('removeProfileImage', 'true')
  if (data.resumeAction === 'remove') formData.append('removeResume', 'true')
  if (imageFile) formData.append('profileImage', imageFile)
  if (resumeFile) formData.append('resumeFile', resumeFile)
  return formData
}

export const savePortfolioProfile = (data, imageFile, resumeFile) => request('patch', '/portfolio/profile', profileFormData(data, imageFile, resumeFile))
export const getPortfolioContactMessages = (params) => request('get', `/portfolio/contact-submissions?${queryString(params)}`)
export const updatePortfolioContactMessage = (messageId, status) => request('patch', `/portfolio/contact-submissions/${messageId}`, { status })
export const deletePortfolioContactMessage = (messageId) => request('delete', `/portfolio/contact-submissions/${messageId}`)
export const getPortfolioProjects = (params) => request('get', `/portfolio/projects?${queryString(params)}`)
export const getPortfolioProject = (projectId) => request('get', `/portfolio/projects/${projectId}`)

const projectFormData = (data, imageFile) => {
  const formData = new FormData()
  const fields = ['title', 'shortDescription', 'description', 'projectType', 'customProjectType', 'projectSource', 'organizationName', 'githubUrl', 'liveUrl', 'status', 'featured', 'displayOrder']
  fields.forEach((field) => formData.append(field, data[field] ?? ''))
  formData.append('technologies', Array.isArray(data.technologies) ? data.technologies.join(',') : data.technologies || '')
  if (data.imageAction === 'remove') formData.append('removeImage', 'true')
  if (imageFile) formData.append('image', imageFile)
  return formData
}

export const resolvePortfolioImageUrl = (imageUrl) => {
  if (!imageUrl || /^https?:\/\//i.test(imageUrl) || imageUrl.startsWith('blob:')) return imageUrl || ''
  try {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    return `${new URL(apiBase, window.location.origin).origin}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
  } catch {
    return imageUrl
  }
}

export const createPortfolioProject = (data, imageFile) => request('post', '/portfolio/projects', projectFormData(data, imageFile))
export const updatePortfolioProject = (projectId, data, imageFile) => request('patch', `/portfolio/projects/${projectId}`, projectFormData(data, imageFile))
export const movePortfolioProject = (projectId, direction) => request('patch', `/portfolio/projects/${projectId}/order`, { direction })
export const deletePortfolioProject = (projectId) => request('delete', `/portfolio/projects/${projectId}`)
export const getPortfolioSkills = () => request('get', '/portfolio/skills')
export const createPortfolioSkill = (data) => request('post', '/portfolio/skills', data)
export const updatePortfolioSkill = (skillId, data) => request('patch', `/portfolio/skills/${skillId}`, data)
export const deletePortfolioSkill = (skillId) => request('delete', `/portfolio/skills/${skillId}`)
export const getPortfolioExperiences = () => request('get', '/portfolio/experiences')
export const createPortfolioExperience = (data) => request('post', '/portfolio/experiences', data)
export const updatePortfolioExperience = (experienceId, data) => request('patch', `/portfolio/experiences/${experienceId}`, data)
export const deletePortfolioExperience = (experienceId) => request('delete', `/portfolio/experiences/${experienceId}`)
export const getPortfolioEducations = () => request('get', '/portfolio/educations')
export const createPortfolioEducation = (data) => request('post', '/portfolio/educations', data)
export const updatePortfolioEducation = (educationId, data) => request('patch', `/portfolio/educations/${educationId}`, data)
export const deletePortfolioEducation = (educationId) => request('delete', `/portfolio/educations/${educationId}`)
export const getPortfolioCertifications = () => request('get', '/portfolio/certifications')
export const createPortfolioCertification = (data) => request('post', '/portfolio/certifications', data)
export const updatePortfolioCertification = (certificationId, data) => request('patch', `/portfolio/certifications/${certificationId}`, data)
export const deletePortfolioCertification = (certificationId) => request('delete', `/portfolio/certifications/${certificationId}`)
export const getPortfolioServices = () => request('get', '/portfolio/services')
export const createPortfolioService = (data) => request('post', '/portfolio/services', data)
export const updatePortfolioService = (serviceId, data) => request('patch', `/portfolio/services/${serviceId}`, data)
export const deletePortfolioService = (serviceId) => request('delete', `/portfolio/services/${serviceId}`)

const testimonialFormData = (data, imageFile) => {
  const formData = new FormData()
  const fields = ['personName', 'personRole', 'company', 'message', 'featured', 'status', 'displayOrder']
  fields.forEach((field) => formData.append(field, data[field] ?? ''))
  if (data.imageAction === 'remove') formData.append('removeImage', 'true')
  if (imageFile) formData.append('image', imageFile)
  return formData
}

export const getPortfolioTestimonials = () => request('get', '/portfolio/testimonials')
export const createPortfolioTestimonial = (data, imageFile) => request('post', '/portfolio/testimonials', testimonialFormData(data, imageFile))
export const updatePortfolioTestimonial = (testimonialId, data, imageFile) => request('patch', `/portfolio/testimonials/${testimonialId}`, testimonialFormData(data, imageFile))
export const deletePortfolioTestimonial = (testimonialId) => request('delete', `/portfolio/testimonials/${testimonialId}`)
