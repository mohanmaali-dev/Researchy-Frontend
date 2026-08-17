import { request } from './api.js'

export const createDemoData = () => request('post', '/demo-data', undefined, { successFeedback: false })

export const createDemoContacts = () => request('post', '/demo-data/contacts', undefined, { successFeedback: false })

export const createDemoLearningData = () => request('post', '/demo-data/learning', undefined, { successFeedback: false })
