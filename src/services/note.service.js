import { request } from './api.js'

const withQuery = (url, params = {}) => {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, value)
  })
  const search = query.toString()
  return search ? `${url}?${search}` : url
}

export const getNotes = (params) => request('get', withQuery('/notes', params))

export const getNoteById = (noteId) => request('get', `/notes/${noteId}`)

export const createNote = (data) => request('post', '/notes', data)

export const updateNote = (noteId, data) => request('patch', `/notes/${noteId}`, data)

export const deleteNote = (noteId) => request('delete', `/notes/${noteId}`)
