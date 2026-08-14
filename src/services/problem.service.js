import { request } from './api.js'

export const getProblemsByConversation = (conversationId) =>
  request('get', `/problems?conversationId=${encodeURIComponent(conversationId)}`)

export const getProblemsByBusiness = (businessId) =>
  request('get', `/problems?businessId=${encodeURIComponent(businessId)}`)

export const getProblemById = (problemId) => request('get', `/problems/${problemId}`)

export const createProblem = (data) => request('post', '/problems', data)

export const updateProblem = (problemId, data) => request('patch', `/problems/${problemId}`, data)

export const deleteProblem = (problemId) => request('delete', `/problems/${problemId}`)

export const getProblemPatterns = () => request('get', '/problems/patterns')

export const getProblemPatternDetails = (type, key) =>
  request(
    'get',
    `/problems/patterns/details?type=${encodeURIComponent(type)}&key=${encodeURIComponent(key)}`,
  )
