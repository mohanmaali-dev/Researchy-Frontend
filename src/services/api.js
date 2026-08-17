import axios from 'axios'

const ACCESS_TOKEN_KEY = 'enter_manage_access_token'
const REFRESH_TOKEN_KEY = 'enter_manage_refresh_token'
const API_CACHE_PREFIX = 'enter_manage_api_cache_'
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const readToken = (key) => {
  try {
    return typeof window === 'undefined' ? '' : window.localStorage.getItem(key) || ''
  } catch {
    return ''
  }
}

const tokenUserId = () => {
  try {
    const token = readToken(ACCESS_TOKEN_KEY)
    if (!token) return ''
    return JSON.parse(window.atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).userId || ''
  } catch {
    return ''
  }
}

const apiCacheKey = (url) => {
  const userId = tokenUserId()
  return userId ? `${API_CACHE_PREFIX}${userId}_${window.btoa(encodeURIComponent(url))}` : ''
}

const storeCachedResponse = (url, data) => {
  try {
    const key = apiCacheKey(url)
    if (!key || url.startsWith('/auth/')) return
    window.localStorage.setItem(key, JSON.stringify({ storedAt: Date.now(), data }))
    const keys = Object.keys(window.localStorage).filter((item) => item.startsWith(`${API_CACHE_PREFIX}${tokenUserId()}_`))
    if (keys.length > 60) keys.slice(0, keys.length - 60).forEach((item) => window.localStorage.removeItem(item))
  } catch {
    // Offline caching is optional when storage is unavailable or full.
  }
}

const readCachedResponse = (url) => {
  try {
    const key = apiCacheKey(url)
    const cached = key ? JSON.parse(window.localStorage.getItem(key)) : null
    if (!cached || Date.now() - cached.storedAt > 7 * 24 * 60 * 60 * 1000) return null
    return { ...cached.data, meta: { ...cached.data.meta, offline: true, cachedAt: cached.storedAt } }
  } catch {
    return null
  }
}

const clearCachedResponses = () => {
  try {
    const userId = tokenUserId()
    Object.keys(window.localStorage)
      .filter((key) => key.startsWith(`${API_CACHE_PREFIX}${userId}_`))
      .forEach((key) => window.localStorage.removeItem(key))
  } catch {
    // Cache cleanup is best effort when browser storage is restricted.
  }
}

export const storeAuthTokens = ({ accessToken, refreshToken } = {}) => {
  try {
    if (typeof window === 'undefined') return
    if (accessToken) window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    if (refreshToken) window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  } catch {
    // Cookie authentication remains available when browser storage is restricted.
  }
}

export const clearAuthTokens = () => {
  try {
    if (typeof window === 'undefined') return
    clearCachedResponses()
    window.localStorage.removeItem(ACCESS_TOKEN_KEY)
    window.localStorage.removeItem(REFRESH_TOKEN_KEY)
  } catch {
    // Nothing else is required when browser storage is unavailable.
  }
}

export const getRefreshToken = () => readToken(REFRESH_TOKEN_KEY)

const notifyAuthExpired = () => {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('auth:expired'))
}

export const api = axios.create({
  baseURL,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const accessToken = readToken(ACCESS_TOKEN_KEY)
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

let refreshPromise = null

const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken()
  if (!refreshToken) throw new Error('No refresh token available')

  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${baseURL}/auth/refresh`, { refreshToken }, { withCredentials: true })
      .then((response) => {
        storeAuthTokens(response.data.meta)
        return response.data.meta.accessToken
      })
      .catch((error) => {
        if (error.response) {
          clearAuthTokens()
          notifyAuthExpired()
        }
        throw error
      })
      .finally(() => { refreshPromise = null })
  }

  return refreshPromise
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const isAuthenticationRequest = originalRequest?.url?.includes('/auth/login') || originalRequest?.url?.includes('/auth/register') || originalRequest?.url?.includes('/auth/refresh')

    if (error.response?.status === 401 && !isAuthenticationRequest && !getRefreshToken()) {
      clearAuthTokens()
      notifyAuthExpired()
    }

    if (error.response?.status !== 401 || originalRequest?._authRetry || isAuthenticationRequest || !getRefreshToken()) {
      return Promise.reject(error)
    }

    originalRequest._authRetry = true
    const accessToken = await refreshAccessToken()
    originalRequest.headers.Authorization = `Bearer ${accessToken}`
    return api(originalRequest)
  },
)

export const request = async (method, url, data, config = {}) => {
  try {
    const response = await api({ method, url, data, ...config })
    if (method.toLowerCase() === 'get') storeCachedResponse(url, response.data)
    return response.data
  } catch (error) {
    if (method.toLowerCase() === 'get' && !error.response) {
      const cached = readCachedResponse(url)
      if (cached) return cached
    }
    if (!error.response && typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new Error('You are offline. Connect to the internet to complete this action')
    }
    throw new Error(error.response?.data?.message || 'Something went wrong')
  }
}
