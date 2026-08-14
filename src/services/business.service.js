import { request } from './api.js'

export const getBusinesses = () => request('get', '/businesses')

export const getBusinessOptions = () => request('get', '/businesses/options')

export const getBusinessById = (businessId) => request('get', `/businesses/${businessId}`)

export const createBusiness = (data) => request('post', '/businesses', data)

export const updateBusiness = (businessId, data) =>
  request('patch', `/businesses/${businessId}`, data)

export const deleteBusiness = (businessId) => request('delete', `/businesses/${businessId}`)
