import { request } from './api.js'

export const search = (query) => request('get', `/search?q=${encodeURIComponent(query.trim())}`)
