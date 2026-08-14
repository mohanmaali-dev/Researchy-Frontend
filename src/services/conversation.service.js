import { request } from './api.js'

export const getConversationsByBusiness = (businessId) =>
  request('get', `/conversations?businessId=${encodeURIComponent(businessId)}`)

export const getConversationById = (conversationId) =>
  request('get', `/conversations/${conversationId}`)

export const createConversation = (data) => request('post', '/conversations', data)

export const updateConversation = (conversationId, data) =>
  request('patch', `/conversations/${conversationId}`, data)

export const deleteConversation = (conversationId) =>
  request('delete', `/conversations/${conversationId}`)
