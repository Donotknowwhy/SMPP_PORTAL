import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [authToken, setAuthToken] = useState(() => sessionStorage.getItem('sms_token') || null)
  const [authUsername, setAuthUsername] = useState(() => sessionStorage.getItem('sms_username') || '')

  const login = (token, username) => {
    sessionStorage.setItem('sms_token', token)
    sessionStorage.setItem('sms_username', username)
    setAuthToken(token)
    setAuthUsername(username)
  }

  const logout = () => {
    sessionStorage.removeItem('sms_token')
    sessionStorage.removeItem('sms_username')
    setAuthToken(null)
    setAuthUsername('')
  }

  return (
    <AuthContext.Provider value={{ authToken, authUsername, login, logout }}>
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
