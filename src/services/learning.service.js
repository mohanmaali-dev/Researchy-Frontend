import { request } from './api.js'

const withQuery = (url, params = {}) => {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, value)
  })
  const value = query.toString()
  return value ? `${url}?${value}` : url
}

export const getDashboard = () => request('get', '/learning/dashboard')
export const getTopicOptions = () => request('get', '/learning/topic-options')
export const getTopics = (params) => request('get', withQuery('/learning/topics', params))
export const getTopic = (id) => request('get', `/learning/topics/${id}`)
export const createTopic = (data) => request('post', '/learning/topics', data)
export const updateTopic = (id, data) => request('patch', `/learning/topics/${id}`, data)
export const deleteTopic = (id) => request('delete', `/learning/topics/${id}`)
export const restoreTopic = (id) => request('patch', `/learning/topics/${id}/restore`)
export const permanentlyDeleteTopic = (id) => request('delete', `/learning/topics/${id}/permanent`)

export const getEntries = (params) => request('get', withQuery('/learning/entries', params))
export const getEntry = (id) => request('get', `/learning/entries/${id}`)
export const createEntry = (data) => request('post', '/learning/entries', data)
export const updateEntry = (id, data) => request('patch', `/learning/entries/${id}`, data)
export const deleteEntry = (id) => request('delete', `/learning/entries/${id}`)

export const getResources = (params) => request('get', withQuery('/learning/resources', params))
export const getResource = (id) => request('get', `/learning/resources/${id}`)
export const createResource = (data) => request('post', '/learning/resources', data)
export const updateResource = (id, data) => request('patch', `/learning/resources/${id}`, data)
export const deleteResource = (id) => request('delete', `/learning/resources/${id}`)

export const getPracticeItems = (params) => request('get', withQuery('/learning/practice', params))
export const getPractice = (id) => request('get', `/learning/practice/${id}`)
export const createPractice = (data) => request('post', '/learning/practice', data)
export const updatePractice = (id, data) => request('patch', `/learning/practice/${id}`, data)
export const deletePractice = (id) => request('delete', `/learning/practice/${id}`)

export const getQuestions = (params) => request('get', withQuery('/learning/questions', params))
export const getQuestion = (id) => request('get', `/learning/questions/${id}`)
export const createQuestion = (data) => request('post', '/learning/questions', data)
export const updateQuestion = (id, data) => request('patch', `/learning/questions/${id}`, data)
export const deleteQuestion = (id) => request('delete', `/learning/questions/${id}`)

export const getTakeaways = (params) => request('get', withQuery('/learning/takeaways', params))
