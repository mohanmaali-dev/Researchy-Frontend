import { request } from './api.js'

export const getDashboard = (date) =>
  request('get', `/dashboard${date ? `?date=${encodeURIComponent(date)}` : ''}`)
