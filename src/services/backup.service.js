import { api, clearApiCache, request } from './api.js'

export const createBackup = async () => {
  const response = await api.get('/backups')
  return response.data
}

export const restoreBackup = async (backup) => {
  const result = await request('post', '/backups/restore', backup, { successFeedback: false })
  clearApiCache()
  return result
}
