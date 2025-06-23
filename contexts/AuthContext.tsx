"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  email: string
  role: "User" | "Seller" | "Admin"
  name?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string, role: string) => Promise<boolean>
  register: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load user data from localStorage on app start
    const savedUser = localStorage.getItem("user")
    const savedToken = localStorage.getItem("token")

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser))
      setToken(savedToken)
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string, role: string): Promise<boolean> => {
    try {
      setLoading(true)

      const response = await fetch("http://localhost:5292/api/Auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role }),
      })

      if (response.ok) {
        const data = await response.json()
        const userData: User = {
          id: data.id || "1",
          email,
          role: role as "User" | "Seller" | "Admin",
          name: data.name || email,
        }

        const mockToken = `token_${Date.now()}`

        setUser(userData)
        setToken(mockToken)
        localStorage.setItem("user", JSON.stringify(userData))
        localStorage.setItem("token", mockToken)

        return true
      }
      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      setLoading(true)

      const response = await fetch("http://localhost:5292/api/User/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name }),
      })

      if (response.ok) {
        return await login(email, password, "User")
      }
      return false
    } catch (error) {
      console.error("Register error:", error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("user")
    localStorage.removeItem("token")
  }

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!token,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
