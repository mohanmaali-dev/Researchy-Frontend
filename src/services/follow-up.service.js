import { request } from './api.js'

const buildQuery = (filters = {}) => {
  const query = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value) query.set(key, value)
  })

  const value = query.toString()
  return value ? `?${value}` : ''
}

export const getFollowUps = (filters) =>
  request('get', `/follow-ups${buildQuery(filters)}`)

export const getUpcomingFollowUps = () => request('get', '/follow-ups/upcoming')

export const getFollowUpById = (followUpId) =>
  request('get', `/follow-ups/${followUpId}`)

export const createFollowUp = (data) => request('post', '/follow-ups', data)

export const updateFollowUp = (followUpId, data) =>
  request('patch', `/follow-ups/${followUpId}`, data)

export const completeFollowUp = (followUpId) =>
  request('patch', `/follow-ups/${followUpId}/complete`)

export const reopenFollowUp = (followUpId) =>
  request('patch', `/follow-ups/${followUpId}/reopen`)

export const deleteFollowUp = (followUpId) =>
  request('delete', `/follow-ups/${followUpId}`)
