import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)
const SUPPORTED_ROLES = new Set(['ADMIN', 'CLIENT'])

function normalizeRole(role) {
  const value = String(role ?? '').trim().toUpperCase()
  return SUPPORTED_ROLES.has(value) ? value : ''
}

export function AuthProvider({ children }) {
  const storedRole = normalizeRole(sessionStorage.getItem('sms_role'))
  const [authToken, setAuthToken] = useState(() => sessionStorage.getItem('sms_token') || null)
  const [authUsername, setAuthUsername] = useState(() => sessionStorage.getItem('sms_username') || '')
  const [authRole, setAuthRole] = useState(storedRole)

  const login = (token, username, role) => {
    const normalizedRole = normalizeRole(role)
    sessionStorage.setItem('sms_token', token)
    sessionStorage.setItem('sms_username', username)
    sessionStorage.setItem('sms_role', normalizedRole)
    setAuthToken(token)
    setAuthUsername(username)
    setAuthRole(normalizedRole)
  }

  const logout = () => {
    sessionStorage.removeItem('sms_token')
    sessionStorage.removeItem('sms_username')
    sessionStorage.removeItem('sms_role')
    setAuthToken(null)
    setAuthUsername('')
    setAuthRole('')
  }

  return (
    <AuthContext.Provider value={{ authToken, authUsername, authRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
