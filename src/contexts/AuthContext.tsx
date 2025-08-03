'use client'
import React, {createContext, useContext, useState, ReactNode, useEffect} from 'react'

interface User {
  name: string
  role: 'customer' | 'staff' | 'admin' | 'customer_staff' | 'manager'
}

interface AuthValue {
  user: User | null
  login: (u: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthValue | undefined>(undefined)

export function AuthProvider({children}:{children: ReactNode}) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('mockUser')
    if(stored) setUser(JSON.parse(stored))
  }, [])

  function login(u: User) {
    localStorage.setItem('mockUser', JSON.stringify(u))
    setUser(u)
  }
  function logout() {
    localStorage.removeItem('mockUser')
    setUser(null)
  }

  return <AuthContext.Provider value={{user, login, logout}}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if(!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
