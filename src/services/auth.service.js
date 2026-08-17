import { clearAuthTokens, getRefreshToken, request, storeAuthTokens } from './api.js'

const saveSession = async (operation) => {
  const result = await operation
  storeAuthTokens(result.meta)
  return result
}

export const register = (data) => saveSession(request('post', '/auth/register', data))

export const login = (data) => saveSession(request('post', '/auth/login', data))

export const logout = async () => {
  try {
    return await request('post', '/auth/logout', { refreshToken: getRefreshToken() })
  } finally {
    clearAuthTokens()
  }
}

export const getCurrentUser = () => request('get', '/auth/me')

export const refreshSession = () => saveSession(request('post', '/auth/refresh', { refreshToken: getRefreshToken() }))

export const forgotPassword = (email) =>
  request('post', '/auth/forgot-password', { email })

export const resetPassword = (token, password) =>
  request('post', '/auth/reset-password', { token, password })

export const verifyEmail = (token) => request('post', '/auth/verify-email', { token })

export const sendVerificationEmail = () => request('post', '/auth/send-verification')
