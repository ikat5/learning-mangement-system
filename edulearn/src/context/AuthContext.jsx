import { useCallback, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import api from '../services/api.js'
import { AuthContext } from './auth-context.js'

const TOKEN_KEY = 'edulearn_token'
const USER_KEY = 'edulearn_user'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(USER_KEY)
    return stored ? JSON.parse(stored) : null
  })
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const persist = useCallback((authUser, authToken) => {
    setUser(authUser)
    setToken(authToken)
    if (authUser && authToken) {
      localStorage.setItem(USER_KEY, JSON.stringify(authUser))
      localStorage.setItem(TOKEN_KEY, authToken)
    } else {
      localStorage.removeItem(USER_KEY)
      localStorage.removeItem(TOKEN_KEY)
    }
  }, [])

  const login = useCallback(async (role, credentials) => {
    try {
      setLoading(true)
      setError(null)
      const endpoint = `/auth/${role}/login`
      const { data } = await api.post(endpoint, credentials)
      const { user: loggedInUser, accessToken } = data?.data || {}
      persist(loggedInUser, accessToken)
      return loggedInUser
    } catch (err) {
      const message =
        err?.response?.data?.message || 'Unable to login. Please try again.'
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [persist])

  const signup = useCallback(async (role, payload) => {
    try {
      setLoading(true)
      setError(null)
      const endpoint = `/auth/${role}/signup`
      await api.post(endpoint, payload)
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        'Unable to create account. Please try again.'
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    if (!user) return
    try {
      setLoading(true)
      const role = user.role?.toLowerCase()
      await api.post(`/auth/${role}/logout`)
    } catch (err) {
      console.error('Logout failed', err)
    } finally {
      persist(null, null)
      setLoading(false)
    }
  }, [persist, user])

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      error,
      isAuthenticated: Boolean(user && token),
      login,
      signup,
      logout,
    }),
    [user, token, loading, error, login, signup, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
}
