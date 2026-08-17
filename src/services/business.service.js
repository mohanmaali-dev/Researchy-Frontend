import { request } from './api.js'

export const getBusinesses = (params) => {
  if (!params) return request('get', '/businesses')

  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, value)
  })

  return request('get', `/businesses?${query.toString()}`)
}

export const getBusinessOptions = () => request('get', '/businesses/options')

export const getBusinessById = (businessId) => request('get', `/businesses/${businessId}`)

export const createBusiness = (data) => request('post', '/businesses', data)

export const updateBusiness = (businessId, data) =>
  request('patch', `/businesses/${businessId}`, data)

export const deleteBusiness = (businessId) => request('delete', `/businesses/${businessId}`)
