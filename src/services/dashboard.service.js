import { request } from './api.js'

export const getDashboard = () => request('get', '/dashboard')
