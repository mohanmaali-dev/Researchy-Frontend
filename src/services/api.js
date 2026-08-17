import axios from 'axios'

const ACCESS_TOKEN_KEY = 'enter_manage_access_token'
const REFRESH_TOKEN_KEY = 'enter_manage_refresh_token'
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const readToken = (key) => {
  try {
    return typeof window === 'undefined' ? '' : window.localStorage.getItem(key) || ''
  } catch {
    return ''
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
    window.localStorage.removeItem(ACCESS_TOKEN_KEY)
    window.localStorage.removeItem(REFRESH_TOKEN_KEY)
  } catch {
    // Nothing else is required when browser storage is unavailable.
  }
}

export const getRefreshToken = () => readToken(REFRESH_TOKEN_KEY)

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
        clearAuthTokens()
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

    if (error.response?.status !== 401 || originalRequest?._authRetry || isAuthenticationRequest || !getRefreshToken()) {
      return Promise.reject(error)
    }

    originalRequest._authRetry = true
    const accessToken = await refreshAccessToken()
    originalRequest.headers.Authorization = `Bearer ${accessToken}`
    return api(originalRequest)
  },
)

export const request = async (method, url, data) => {
  try {
    const response = await api({ method, url, data })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Something went wrong')
  }
}
