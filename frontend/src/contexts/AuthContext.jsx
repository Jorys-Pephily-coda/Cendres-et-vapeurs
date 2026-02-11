import { createContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

export const AuthContext = createContext({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  hasRole: () => false,
  loading: true,
})

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [token, setToken]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedToken = sessionStorage.getItem('token')
    const savedUser  = sessionStorage.getItem('user')
    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        setToken(savedToken)
        setUser(parsedUser)
        api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`
        console.log('[AuthContext] Session restaurée —', parsedUser.email)
      } catch {
        sessionStorage.removeItem('token')
        sessionStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = useCallback((accessToken, userData) => {
    // Tout en synchrone, dans l'ordre
    sessionStorage.setItem('token', accessToken)
    sessionStorage.setItem('user', JSON.stringify(userData))
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
    setToken(accessToken)
    setUser(userData)
    console.log('[AuthContext] Login OK —', userData?.email, '| role:', userData?.role)
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
    delete api.defaults.headers.common['Authorization']
    setToken(null)
    setUser(null)
  }, [])

  const hasRole = useCallback((roles) => {
    if (!user) return false
    return roles.includes(user.role)
  }, [user])

  return (
    <AuthContext.Provider value={{ user, token, login, logout, hasRole, loading }}>
      {children}
    </AuthContext.Provider>
  )
}