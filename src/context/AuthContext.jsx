/* oxlint-disable react/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'

import * as authService from '../services/auth.service.js'

const AuthContext = createContext(null)
const CACHED_USER_KEY = 'enter_manage_cached_user'

const readCachedUser = () => {
  try { return JSON.parse(window.localStorage.getItem(CACHED_USER_KEY)) } catch { return null }
}

const storeCachedUser = (user) => {
  try {
    if (user) window.localStorage.setItem(CACHED_USER_KEY, JSON.stringify(user))
    else window.localStorage.removeItem(CACHED_USER_KEY)
  } catch {
    // The application still works online when storage is unavailable.
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const result = await authService.getCurrentUser()
        setUser(result.data)
        storeCachedUser(result.data)
      } catch {
        try {
          await authService.refreshSession()
          const result = await authService.getCurrentUser()
          setUser(result.data)
          storeCachedUser(result.data)
        } catch {
          setUser(readCachedUser())
        }
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  useEffect(() => {
    const handleExpiredSession = () => { setUser(null); storeCachedUser(null) }
    window.addEventListener('auth:expired', handleExpiredSession)
    return () => window.removeEventListener('auth:expired', handleExpiredSession)
  }, [])

  const login = async (credentials) => {
    const result = await authService.login(credentials)
    setUser(result.data)
    storeCachedUser(result.data)
    return result
  }

  const register = async (details) => {
    const result = await authService.register(details)
    setUser(result.data)
    storeCachedUser(result.data)
    return result
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
    storeCachedUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser: (nextUser) => { setUser(nextUser); storeCachedUser(nextUser) } }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
