import { request } from './api.js'

export const getContacts = (params = {}) => {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, value)
  })

  return request('get', `/contacts?${query.toString()}`)
}

export const getContactById = (contactId) => request('get', `/contacts/${contactId}`)

export const createContact = (data) => request('post', '/contacts', data)

export const updateContact = (contactId, data) =>
  request('patch', `/contacts/${contactId}`, data)

export const deleteContact = (contactId) => request('delete', `/contacts/${contactId}`)
