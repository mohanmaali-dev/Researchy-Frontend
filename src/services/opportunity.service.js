import { request } from './api.js'

export const getOpportunities = () => request('get', '/opportunities')

export const getOpportunityByProblem = (problemId) =>
  request('get', `/opportunities/problem/${problemId}`)

export const getOpportunityById = (opportunityId) =>
  request('get', `/opportunities/${opportunityId}`)

export const createOpportunity = (data) => request('post', '/opportunities', data)

export const updateOpportunity = (opportunityId, data) =>
  request('patch', `/opportunities/${opportunityId}`, data)

export const deleteOpportunity = (opportunityId) =>
  request('delete', `/opportunities/${opportunityId}`)
