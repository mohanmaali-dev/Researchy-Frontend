import { request } from './api.js'

export const createDemoData = () => request('post', '/demo-data')

export const createDemoContacts = () => request('post', '/demo-data/contacts')

export const createDemoLearningData = () => request('post', '/demo-data/learning')
